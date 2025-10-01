export type Moneda = 'PEN' | 'USD'
export type TasaTipo = 'EFECTIVA' | 'NOMINAL'
export type GraciaTipo = 'NINGUNA' | 'TOTAL' | 'PARCIAL'

export interface Client {
  id?: string
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
  id?: string
  proyecto: string
  torre: string
  unidad: string
  moneda: Moneda
  precio: number
  pieInicial: number
  gastos: number
  seguros: number
  comisiones: number
  imageUrl?: string
}

export interface Config {
  id?: string
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
  id?: string
  clientId: string
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

export interface AuditLog {
  id: string
  userEmail: string
  action: string
  entity: string
  entityId: string
  payload?: any
  timestamp: string
}
