import type { SimulationResult, ScheduleItem, TasaTipo, GraciaTipo } from '@/types'

const r2 = (x:number)=>Math.round((x+Number.EPSILON)*100)/100
const r4 = (x:number)=>Math.round((x+Number.EPSILON)*10000)/10000

function irr(cfs:number[], guess=0.02){
  let r=guess
  for(let k=0;k<100;k++){
    let f=0, df=0
    for(let t=0;t<cfs.length;t++){
      const d=Math.pow(1+r,t)
      f += cfs[t]/d
      df += -t*cfs[t]/(d*(1+r))
    }
    const nr = r - f/(df || 1e-12)
    if(!isFinite(nr)) break
    if(Math.abs(nr-r) < 1e-10){ r=nr; break }
    r = nr
  }
  return r
}

/** Método francés mensual + gracia TOTAL/PARCIAL mínima */
export function calculateLoan(
    principal: number,
    tasa: number,               // TEA %
    plazoMeses: number,
    tasaTipo: TasaTipo = 'EFECTIVA',
    _capitalizacion?: string,
    graciaTipo: GraciaTipo = 'NINGUNA',
    graciaMeses = 0,
    capitalizaEnGracia = false
): SimulationResult {
  const i = Math.pow(1 + tasa/100, 1/12) - 1
  let saldo = principal
  const schedule: ScheduleItem[] = []
  const base = new Date()
  const addM = (d:Date,m:number)=>{ const x=new Date(d); x.setMonth(x.getMonth()+m); return x }

  // Gracia
  for(let g=1; g<=graciaMeses; g++){
    const interes = saldo*i
    let cuota = 0, amortizacion = 0
    if (graciaTipo==='PARCIAL') cuota = interes
    if (graciaTipo==='TOTAL' && capitalizaEnGracia) saldo += interes
    schedule.push({
      period:g,
      fecha:addM(base,g).toLocaleDateString('es-PE'),
      cuota:r2(cuota), interes:r2(interes), amortizacion:r2(amortizacion), saldo:r2(saldo)
    })
  }

  // Pago
  const n = plazoMeses
  const cuota = saldo===0 ? 0 : (saldo*i)/(1-Math.pow(1+i,-n))
  for(let k=1;k<=n;k++){
    const p = graciaMeses + k
    const interes = saldo*i
    const amortizacion = cuota - interes
    saldo = Math.max(0, saldo - amortizacion)
    schedule.push({
      period:p,
      fecha:addM(base,p).toLocaleDateString('es-PE'),
      cuota:r2(cuota), interes:r2(interes), amortizacion:r2(amortizacion), saldo:r2(saldo)
    })
  }

  // IRR/TCEA
  const cfs = [principal, ...schedule.slice(graciaMeses).map(s=>-s.cuota)]
  const irrMensual = irr(cfs, 0.02)
  const tirAnual = Math.pow(1+irrMensual, 12)-1

  return {
    cuota: r2(cuota),
    tcea: r2(tirAnual*100),
    tir:  r2(tirAnual*100),
    duracion: r4(n/12),
    durMod: r4((n/12)/(1+tirAnual)),
    convexidad: r4((n/12)*((n/12)+1)/Math.pow(1+tirAnual,2)),
    schedule
  }
}
