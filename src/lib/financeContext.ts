export const buildFinanceContext = (
  entries: any[],
  selectedMonth: number,
  year: number
) => {
  const meses = [
    'Enero','Febrero','Marzo','Abril',
    'Mayo','Junio','Julio','Agosto',
    'Septiembre','Octubre','Noviembre',
    'Diciembre'
  ]

  // Datos del mes seleccionado
  const mesEntries = entries.filter(e =>
    Number(e.month) === Number(selectedMonth) &&
    Number(e.year) === Number(year)
  )

  const ingresos = mesEntries
    .filter(e => e.type === 'ingreso')
    .reduce((s, e) => s + Number(e.amount), 0)

  const gastosEntries = mesEntries
    .filter(e => e.type !== 'ingreso')

  const gastos = gastosEntries
    .reduce((s, e) => s + Number(e.amount), 0)

  // Desglose total del mes (INGRESOS Y GASTOS)
  const desgloseMes = mesEntries
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .map(e => `${e.concept}: ${Number(e.amount).toFixed(2)}€`)

  // RESUMEN DE TODOS LOS MESES DEL AÑO
  const resumenAnual = meses.map((mes, i) => {
    const monthNum = i + 1
    const monthEntries = entries.filter(e =>
      Number(e.month) === Number(monthNum) &&
      Number(e.year) === Number(year)
    )
    
    if (monthEntries.length === 0) {
      return `${mes}: Sin datos de transacciones`
    }

    const ing = monthEntries
      .filter(e => e.type === 'ingreso')
      .reduce((s, e) => s + Number(e.amount), 0)

    const gas = monthEntries
      .filter(e => e.type !== 'ingreso')
      .reduce((s, e) => s + Number(e.amount), 0)

    const bal = ing - gas

    return `${mes}: Ingresos ${ing.toFixed(2)}€ | Gastos ${gas.toFixed(2)}€ | Balance ${bal.toFixed(2)}€`
  })

  // Acumulado anual
  const acumulado = entries
    .filter(e => Number(e.year) === Number(year))
    .reduce((s, e) =>
      e.type === 'ingreso'
        ? s + Number(e.amount)
        : s - Number(e.amount)
    , 0)

  // Mes anterior
  const mesAnteriorEntries = entries.filter(e =>
    Number(e.month) === Number(selectedMonth - 1) &&
    Number(e.year) === Number(year)
  )
  const ingresosMesAnterior = mesAnteriorEntries
    .filter(e => e.type === 'ingreso')
    .reduce((s, e) => s + Number(e.amount), 0)
  const gastosMesAnterior = mesAnteriorEntries
    .filter(e => e.type !== 'ingreso')
    .reduce((s, e) => s + Number(e.amount), 0)

  return {
    mesSeleccionado: meses[selectedMonth - 1],
    año: year,
    ingresosMes: ingresos.toFixed(2),
    gastosMes: gastos.toFixed(2),
    balanceMes: (ingresos - gastos).toFixed(2),
    estadoMes: ingresos - gastos >= 0
      ? 'positivo' : 'negativo',
    gastosFijos: gastosEntries
      .filter(e => e.type === 'gasto_fijo')
      .reduce((s,e) => s+Number(e.amount),0)
      .toFixed(2),
    gastosVariables: gastosEntries
      .filter(e => e.type === 'variable')
      .reduce((s,e) => s+Number(e.amount),0)
      .toFixed(2),
    deudas: gastosEntries
      .filter(e => e.type === 'deuda')
      .reduce((s,e) => s+Number(e.amount),0)
      .toFixed(2),
    ahorros: gastosEntries
      .filter(e => e.type === 'ahorro')
      .reduce((s,e) => s+Number(e.amount),0)
      .toFixed(2),
    suscripciones: gastosEntries
      .filter(e => e.type === 'suscripcion')
      .reduce((s,e) => s+Number(e.amount),0)
      .toFixed(2),
    todosLosGastos: desgloseMes,
    totalConceptos: mesEntries.length,
    ingresosMesAnterior: ingresosMesAnterior
      .toFixed(2),
    gastosMesAnterior: gastosMesAnterior
      .toFixed(2),
    balanceAcumulado: acumulado.toFixed(2),
    estadoAnual: acumulado >= 0
      ? 'positivo' : 'negativo',
    resumenAnual,
    resumenPorMes: Object.fromEntries(
      meses.map((mes, i) => {
        const monthNum = i + 1
        const monthEntries = entries.filter(e =>
          Number(e.month) === Number(monthNum) &&
          Number(e.year) === Number(year)
        )
        if (monthEntries.length === 0) return [mes, { conceptos: [] }]
        
        return [mes, {
          conceptos: monthEntries
            .sort((a, b) => Number(b.amount) - Number(a.amount))
            .map(e => `${e.concept}: ${Number(e.amount).toFixed(2)}€`)
        }]
      })
    ),
    desgloseConceptosAnual: meses.map((mes, i) => {
      const monthNum = i + 1
      const monthEntries = entries.filter(e =>
        Number(e.month) === Number(monthNum) &&
        Number(e.year) === Number(year)
      )
      if (monthEntries.length === 0) return null
      
      return {
        mes,
        transacciones: monthEntries
          .sort((a, b) => Number(b.amount) - Number(a.amount))
          .map(e => `${e.concept}: ${Number(e.amount).toFixed(2)}€`)
      }
    }).filter(Boolean)
  }
}

export const buildBusinessContext = (
  entries: any[],
  selectedMonth: number,
  year: number
) => {
  const meses = [
    'Enero','Febrero','Marzo','Abril',
    'Mayo','Junio','Julio','Agosto',
    'Septiembre','Octubre','Noviembre',
    'Diciembre'
  ]

  const mesEntries = entries.filter(e =>
    Number(e.month) === Number(selectedMonth) &&
    Number(e.year) === Number(year)
  )

  const ingresos = mesEntries
    .filter(e => e.type === 'ingreso_cliente')
    .reduce((s: number, e: any) => s + Number(e.amount), 0)

  const gastos = mesEntries
    .filter(e => e.type !== 'ingreso_cliente')
    .reduce((s: number, e: any) => s + Number(e.amount), 0)

  const beneficio = ingresos - gastos

  const todosLosMovimientos = mesEntries
    .sort((a: any, b: any) => Number(b.amount) - Number(a.amount))
    .map((e: any) => {
      const cliente = e.client ? ` (${e.client})` : ''
      return `${e.concept}${cliente}: ${Number(e.amount).toFixed(2)}€ [${e.type}]`
    })

  const clientesActivos = Array.from(
    new Set(
      mesEntries
        .filter((e: any) => e.type === 'ingreso_cliente' && e.client)
        .map((e: any) => e.client)
    )
  )

  const resumenAnual = meses.map((mes, i) => {
    const m = i + 1
    const mEntries = entries.filter((e: any) =>
      Number(e.month) === Number(m) && Number(e.year) === Number(year)
    )
    if (mEntries.length === 0) return null
    const mIng = mEntries.filter((e: any) => e.type === 'ingreso_cliente').reduce((s: number, e: any) => s + Number(e.amount), 0)
    const mGas = mEntries.filter((e: any) => e.type !== 'ingreso_cliente').reduce((s: number, e: any) => s + Number(e.amount), 0)
    return `${mes}: Ingresos ${mIng.toFixed(2)}€ | Gastos ${mGas.toFixed(2)}€ | Beneficio ${(mIng - mGas).toFixed(2)}€`
  }).filter(Boolean)

  const acumulado = entries
    .filter((e: any) => Number(e.year) === Number(year))
    .reduce((s: number, e: any) =>
      e.type === 'ingreso_cliente' ? s + Number(e.amount) : s - Number(e.amount)
    , 0)

  return {
    mesSeleccionado: meses[selectedMonth - 1],
    año: year,
    ingresosMes: ingresos.toFixed(2),
    gastosMes: gastos.toFixed(2),
    beneficioMes: beneficio.toFixed(2),
    estadoMes: beneficio >= 0 ? 'positivo' : 'negativo',
    todosLosMovimientos,
    clientesActivos,
    resumenAnual,
    beneficioAcumulado: acumulado.toFixed(2),
    desgloseConceptosAnual: meses.map((mes, i) => {
      const m = i + 1
      const mEntries = entries.filter((e: any) =>
        Number(m) === Number(m) && Number(e.year) === Number(year)
      )
      if (mEntries.length === 0) return null
      return {
        mes,
        movimientos: mEntries
          .sort((a: any, b: any) => Number(b.amount) - Number(a.amount))
          .map((e: any) => {
            const cliente = e.client ? ` (${e.client})` : ''
            return `${e.concept}${cliente}: ${Number(e.amount).toFixed(2)}€ [${e.type}]`
          })
      }
    }).filter(Boolean)
  }
}
