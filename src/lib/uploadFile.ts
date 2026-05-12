import { createClient } from './supabase/client'

export const uploadFile = async (file: File) => {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('No hay sesión de usuario')
    return null
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${
    Math.random().toString(36).slice(2)
  }.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  // Subir a bucket "communications"
  const { data, error } = await supabase
    .storage
    .from('communications')
    .upload(filePath, file)

  if (error) {
    console.error('Error al subir:', error)
    return null
  }

  const { data: urlData } = supabase
    .storage
    .from('communications')
    .getPublicUrl(filePath)

  return {
    url: urlData.publicUrl,
    name: file.name,
    type: file.type,
    size: file.size
  }
}
