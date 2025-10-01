import { describe, it, expect } from 'vitest'
import { FinancialEngine } from '../src/utils/financial-engine'

describe('FinancialEngine', () => {
  const engine = new FinancialEngine()

  describe('nominalToEffective', () => {
    it('should convert nominal to effective rate correctly', () => {
      const nominal = 12 // 12% nominal
      const capitalization = 12 // monthly
      const effective = engine.nominalToEffective(nominal, capitalization)
      
      expect(effective).toBeCloseTo(0.126825, 5)
    })

    it('should handle quarterly capitalization', () => {
      const nominal = 12
      const capitalization = 4 // quarterly
      const effective = engine.nominalToEffective(nominal, capitalization)
      
      expect(effective).toBeCloseTo(0.125509, 5)
    })
  })

  describe('effectiveAnnualToMonthly', () => {
    it('should convert effective annual to monthly rate correctly', () => {
      const effectiveAnnual = 12.5 // 12.5% effective annual
      const monthlyRate = engine.effectiveAnnualToMonthly(effectiveAnnual)
      
      expect(monthlyRate).toBeCloseTo(0.009849, 5)
    })
  })

  describe('calculateMonthlyPayment', () => {
    it('should calculate correct monthly payment for French method', () => {
      const principal = 280000
      const monthlyRate = 0.009849 // ~12.5% annual effective
      const termMonths = 240
      
      const payment = engine.calculateMonthlyPayment(principal, monthlyRate, termMonths)
      
      expect(payment).toBeCloseTo(3125, 0)
    })

    it('should handle zero interest rate', () => {
      const principal = 100000
      const monthlyRate = 0
      const termMonths = 120
      
      const payment = engine.calculateMonthlyPayment(principal, monthlyRate, termMonths)
      
      expect(payment).toBeCloseTo(833.33, 2)
    })
  })

  describe('generateSchedule', () => {
    it('should generate correct payment schedule', () => {
      const principal = 100000
      const monthlyRate = 0.01 // 1% monthly
      const termMonths = 12
      
      const schedule = engine.generateSchedule(principal, monthlyRate, termMonths)
      
      expect(schedule).toHaveLength(12)
      expect(schedule[0].period).toBe(1)
      expect(schedule[0].saldo).toBeLessThan(principal)
      expect(schedule[11].saldo).toBeCloseTo(0, 1)
    })

    it('should handle grace period correctly', () => {
      const principal = 100000
      const monthlyRate = 0.01
      const termMonths = 15
      const graceMonths = 3
      
      const schedule = engine.generateSchedule(
        principal, 
        monthlyRate, 
        termMonths, 
        'PARCIAL', 
        graceMonths
      )
      
      expect(schedule).toHaveLength(15)
      // Grace periods should have zero amortization for partial grace
      expect(schedule[0].amortizacion).toBe(0)
      expect(schedule[1].amortizacion).toBe(0)
      expect(schedule[2].amortizacion).toBe(0)
      // Regular payments should start after grace period
      expect(schedule[3].amortizacion).toBeGreaterThan(0)
    })
  })

  describe('calculateTCEA', () => {
    it('should calculate TCEA correctly', () => {
      const principal = 100000
      const monthlyPayment = 1500
      const termMonths = 120
      const additionalCosts = 5000
      
      const tcea = engine.calculateTCEA(principal, monthlyPayment, termMonths, additionalCosts)
      
      expect(tcea).toBeGreaterThan(0)
      expect(tcea).toBeLessThan(50)
    })
  })

  describe('calculateNPV', () => {
    it('should calculate NPV correctly', () => {
      const cashFlows = [-100000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000]
      const discountRate = 0.1
      
      const npv = engine.calculateNPV(cashFlows, discountRate)
      
      expect(npv).toBeCloseTo(0, -3) // Should be close to zero for break-even
    })
  })

  describe('calculateIRR', () => {
    it('should calculate IRR correctly', () => {
      const cashFlows = [-100000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000]
      
      const irr = engine.calculateIRR(cashFlows)
      
      expect(irr).toBeCloseTo(2.44, 1)
    })
  })

  describe('calculateDuration', () => {
    it('should calculate duration correctly', () => {
      const cashFlows = [0, 1000, 1000, 1000, 1000, 101000]
      const yieldRate = 0.05
      
      const duration = engine.calculateDuration(cashFlows, yieldRate)
      
      expect(duration).toBeGreaterThan(0)
      expect(duration).toBeLessThan(5)
    })
  })

  describe('calculateModifiedDuration', () => {
    it('should calculate modified duration correctly', () => {
      const duration = 4.5
      const yieldRate = 0.05
      
      const modifiedDuration = engine.calculateModifiedDuration(duration, yieldRate)
      
      expect(modifiedDuration).toBeCloseTo(4.286, 3)
    })
  })

  describe('calculateConvexity', () => {
    it('should calculate convexity correctly', () => {
      const cashFlows = [0, 1000, 1000, 1000, 1000, 101000]
      const yieldRate = 0.05
      
      const convexity = engine.calculateConvexity(cashFlows, yieldRate)
      
      expect(convexity).toBeGreaterThan(0)
    })
  })

  describe('calculateLoan - Integration Test', () => {
    it('should calculate complete loan metrics correctly', () => {
      const principal = 280000
      const annualRate = 12.5
      const termMonths = 240
      
      const result = engine.calculateLoan(principal, annualRate, termMonths)
      
      expect(result.cuota).toBeGreaterThan(3000)
      expect(result.cuota).toBeLessThan(3500)
      expect(result.tcea).toBeGreaterThan(10)
      expect(result.tcea).toBeLessThan(15)
      expect(result.schedule).toHaveLength(240)
      expect(result.schedule[239].saldo).toBeCloseTo(0, 1)
    })

    it('should handle grace period in complete calculation', () => {
      const principal = 100000
      const annualRate = 15
      const termMonths = 60
      const graceMonths = 6
      
      const result = engine.calculateLoan(
        principal,
        annualRate,
        termMonths,
        'EFECTIVA',
        undefined,
        'PARCIAL',
        graceMonths
      )
      
      expect(result.schedule).toHaveLength(60)
      expect(result.schedule[0].amortizacion).toBe(0) // Grace period
      expect(result.schedule[6].amortizacion).toBeGreaterThan(0) // After grace
    })
  })
})