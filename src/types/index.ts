export type Moneda = 'PEN' | 'USD'
export type TasaTipo = 'EFECTIVA' | 'NOMINAL'
export type GraciaTipo = 'NINGUNA' | 'TOTAL' | 'PARCIAL'

export interface Client {
  id?: string | number
  nombres: string
  apellidos: string
  documento: string
  telefono: string
  email: string
  ingresosMensuales: number
  dependientes: number
  empleo: string
}

export interface Unit {
  id?: string | number
  proyecto: string
  torre: string
  unidad: string
  moneda: Moneda
  precio: number
  pieInicial: number
  gastos: number
  seguros: number
  comisiones: number
  imageUrl?: string          // << NUEVO
}

export interface Config {
  id?: string | number
  moneda: Moneda
  tasaTipo: TasaTipo
  efectivaAnual: number
  graciaTipo: GraciaTipo
  graciaMeses: number
  entidad: string
  capitalizaEnGracia: boolean
}

export interface ScheduleItem {
  period: number
  fecha: string
  cuota: number
  interes: number
  amortizacion: number
  saldo: number
}

export interface SimulationResult {
  cuota: number
  tcea: number
  tir: number
  duracion: number
  durMod: number
  convexidad: number
  schedule: ScheduleItem[]
}

export interface Simulation {
  id?: string | number
  clientId: string       // forzamos string para evitar mismatch
  unitId: string
  configId: string
  principal: number
  plazoMeses: number
  tasaInput: number
  tasaTipo: TasaTipo
  graciaTipo: GraciaTipo
  graciaMeses: number
  capitalizaEnGracia: boolean
  resultados: SimulationResult
  schedule: ScheduleItem[]
  createdAt: string
}
