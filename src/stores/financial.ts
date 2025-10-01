import { defineStore } from 'pinia'
import { calculateLoan } from '@/utils/financial-engine'
import type { SimulationResult, TasaTipo, GraciaTipo } from '@/types'

export const useFinancialStore = defineStore('financial', {
  actions: {
    calculateLoan(
        principal: number,
        tasa: number,
        plazoMeses: number,
        tasaTipo: TasaTipo,
        capitalizacion: string | undefined,
        graciaTipo: GraciaTipo,
        graciaMeses: number,
        capitalizaEnGracia: boolean
    ): SimulationResult {
      return calculateLoan(
          principal, tasa, plazoMeses,
          tasaTipo, capitalizacion, graciaTipo, graciaMeses, capitalizaEnGracia
      )
    }
  }
})
