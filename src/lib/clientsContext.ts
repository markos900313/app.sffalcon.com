export const buildClientsContext = (clients: any[]) => {
  if (!clients || clients.length === 0) {
    return {
      total: 0,
      activos: 0,
      leads: 0,
      potenciales: 0,
      pipeline: '0.00',
      cartera: '0.00',
      lista: []
    }
  }

  const activosCount = clients.filter(c => c.status === 'activo').length;
  const leadsCount = clients.filter(c => c.status === 'lead').length;
  const potencialesCount = clients.filter(c => c.status === 'potencial').length;

  const pipelineValue = clients
    .filter(c => c.status === 'lead')
    .reduce((s, c) => s + Number(c.value || 0), 0);

  const carteraValue = clients
    .filter(c => c.status === 'activo')
    .reduce((s, c) => s + Number(c.value || 0), 0);

  const listaResumen = clients.map(c =>
    `${c.name}${c.company ? ` (${c.company})` : ''}: ${c.status} | ${c.category || 'sin categoría'} | ${c.value ? Number(c.value).toLocaleString('es-ES') + '€' : 'sin valor'}`
  );

  return {
    total: clients.length,
    activos: activosCount,
    leads: leadsCount,
    potenciales: potencialesCount,
    pipeline: pipelineValue.toFixed(2),
    cartera: carteraValue.toFixed(2),
    lista: listaResumen
  }
}
