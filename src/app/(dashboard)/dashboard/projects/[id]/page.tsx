'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Loader2, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ProjectDetail from '@/components/dashboard/projects/ProjectDetail';
import toast from 'react-hot-toast';

export default function ProjectDetailIdPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            company,
            phone
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      toast.error('Error al cargar detalle del proyecto');
      router.push('/dashboard/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) return;
    
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      toast.success('Proyecto eliminado');
      router.push('/dashboard/projects');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  );

  if (!project) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Acciones */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-colors group tracking-widest"
        >
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="w-4 h-4" />
          </div>
          VOLVER A PROYECTOS
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl font-semibold text-xs transition-all uppercase tracking-widest border border-red-100 dark:border-red-500/20"
          >
            <Trash2 className="w-4 h-4" /> Eliminar Proyecto
          </button>
        </div>
      </div>

      {/* Content */}
      <ProjectDetail project={project} onRefresh={fetchProject} />

    </div>
  );
}
