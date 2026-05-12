import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const getConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('communications')
    .select(`
      *,
      messages (
        id,
        sender,
        content,
        read,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getQuickReplies = async (userId: string) => {
  const { data, error } = await supabase
    .from('quick_replies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');

  if (error) throw error;
  return data;
};

export const markMessagesAsRead = async (communicationId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('communication_id', communicationId)
    .eq('sender', 'client');

  if (error) throw error;
};

export const updateCommunicationStatus = async (id: string, status: string, respondedBy?: 'human' | 'ai') => {
  const updateData: any = { 
    status, 
    updated_at: new Date().toISOString() 
  };
  if (respondedBy) updateData.responded_by = respondedBy;

  const { error } = await supabase
    .from('communications')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
};
