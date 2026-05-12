export interface Client {
  id?: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string | null;
  category: string | null;
  source: string | null;
  value: number | null;
  notes: string | null;
  last_contact?: string | null;
  created_at?: string;
}
