export const buildProjectsContext = (
  projects: any[]
) => {
  if (!projects || projects.length === 0) {
    return {
      total: 0,
      activos: 0,
      completados: 0,
      facturacion: '0.00',
      pendiente: '0.00',
      lista: []
    }
  }

  const facturacion = projects
    .reduce((s, p) => s + Number(p.budget || 0), 0)

  const cobrado = projects
    .reduce((s, p) => s + Number(p.paid || 0), 0)

  return {
    total: projects.length,
    activos: projects.filter(
      p => p.status === 'activo'
    ).length,
    completados: projects.filter(
      p => p.status === 'completado'
    ).length,
    propuestas: projects.filter(
      p => p.status === 'propuesta'
    ).length,
    facturacion: facturacion.toFixed(2),
    cobrado: cobrado.toFixed(2),
    pendiente: (facturacion - cobrado).toFixed(2),
    lista: projects.map(p =>
      `${p.name} (${p.clients?.name || 'Sin cliente'}): ${p.status} | ${p.progress}% | ${p.budget}€`
    )
  }
}
