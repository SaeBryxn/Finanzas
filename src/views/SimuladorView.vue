<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import LayoutMain from '@/components/LayoutMain.vue'
import BaseCard from '@/components/BaseCard.vue'
import { calculateLoan } from '@/utils/financial-engine'  // <- directo
import api from '@/services/api'
import type { Client, Unit, Config, SimulationResult } from '@/types'

const clients = ref<Client[]>([])
const units = ref<Unit[]>([])
const configs = ref<Config[]>([])
const loading = ref(false)

// usar string para empatar con json-server y Render
const selectedClientId = ref<string | null>(null)
const selectedUnitId   = ref<string | null>(null)
const selectedConfigId = ref<string | null>(null)

const plazoMeses = ref(240)
const results = ref<SimulationResult | null>(null)

const selectedUnit = computed(() =>
    units.value.find(u => String(u.id) === String(selectedUnitId.value))
)
const selectedConfig = computed(() =>
    configs.value.find(c => String(c.id) === String(selectedConfigId.value))
)

const principal = computed(() => {
  if (!selectedUnit.value) return 0
  return selectedUnit.value.precio - selectedUnit.value.pieInicial
})

async function loadData() {
  loading.value = true
  try {
    const [clientsRes, unitsRes, configsRes] = await Promise.all([
      api.get('/clients'),
      api.get('/units'),
      api.get('/configs')
    ])
    clients.value = clientsRes.data
    units.value = unitsRes.data
    configs.value = configsRes.data
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

function simulate() {
  if (!selectedUnit.value || !selectedConfig.value) return
  const c = selectedConfig.value
  results.value = calculateLoan(
      principal.value,
      c.efectivaAnual || 0,
      plazoMeses.value,
      c.tasaTipo,
      // @ts-expect-error opcional/no usado
      c.capitalizacion,
      c.graciaTipo,
      c.graciaMeses,
      c.capitalizaEnGracia
  )
}

async function saveSimulation() {
  if (!results.value || !selectedClientId.value || !selectedUnitId.value || !selectedConfigId.value) return
  try {
    const simulation = {
      clientId: String(selectedClientId.value),
      unitId:   String(selectedUnitId.value),
      configId: String(selectedConfigId.value),
      principal: principal.value,
      plazoMeses: plazoMeses.value,
      tasaInput: selectedConfig.value?.efectivaAnual || 0,
      tasaTipo: selectedConfig.value?.tasaTipo || 'EFECTIVA',
      graciaTipo: selectedConfig.value?.graciaTipo || 'NINGUNA',
      graciaMeses: selectedConfig.value?.graciaMeses || 0,
      capitalizaEnGracia: selectedConfig.value?.capitalizaEnGracia || false,
      resultados: results.value,
      schedule: results.value.schedule,
      createdAt: new Date().toISOString()
    }
    await api.post('/simulations', simulation)
    alert('Simulación guardada exitosamente')
  } catch (error) {
    console.error('Error saving simulation:', error)
    alert('Error al guardar la simulación')
  }
}

onMounted(loadData)
</script>


<template>
  <LayoutMain>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Simulador de Créditos</h1>
        <p class="text-sm text-gray-600 mt-1">Calcula cuotas y métricas financieras</p>
      </div>

      <!-- Simulation Form -->
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
          <!-- Cliente y Unidad -->
          <BaseCard title="Selección" subtitle="Elige el cliente y la unidad inmobiliaria">
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <select
                    v-model="selectedClientId"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option :value="null">Seleccionar cliente</option>
                  <option
                      v-for="client in clients"
                      :key="client.id"
                      :value="String(client.id)"
                  >
                    {{ client.nombres }} {{ client.apellidos }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Unidad</label>
                <select
                    v-model="selectedUnitId"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option :value="null">Seleccionar unidad</option>
                  <option
                      v-for="unit in units"
                      :key="unit.id"
                      :value="String(unit.id)"
                  >
                    {{ unit.proyecto }} - {{ unit.torre }} {{ unit.unidad }}
                  </option>
                </select>
              </div>
            </div>
          </BaseCard>

          <!-- Configuración de Crédito -->
          <BaseCard title="Configuración" subtitle="Parámetros del crédito hipotecario">
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Configuración de Tasa</label>
                <select
                    v-model="selectedConfigId"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option :value="null">Seleccionar configuración</option>
                  <option
                      v-for="config in configs"
                      :key="config.id"
                      :value="String(config.id)"
                  >
                    {{ config.entidad }} - {{ config.efectivaAnual }}%
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Plazo (meses)</label>
                <input
                    v-model.number="plazoMeses"
                    type="number"
                    min="12"
                    max="360"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div class="mt-6">
              <button
                  @click="simulate"
                  :disabled="!selectedUnit || !selectedConfig"
                  class="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <i class="pi pi-calculator mr-2"></i>
                Simular Crédito
              </button>
            </div>
          </BaseCard>

          <!-- Schedule Table -->
          <BaseCard v-if="results" title="Cronograma de Pagos" subtitle="Detalle de cuotas mes a mes">
            <div class="overflow-x-auto max-h-96">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cuota</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Interés</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amortización</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in results.schedule" :key="item.period" class="hover:bg-gray-50">
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ item.period }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ item.fecha }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    {{ item.cuota.toLocaleString() }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    {{ item.interes.toLocaleString() }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    {{ item.amortizacion.toLocaleString() }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    {{ item.saldo.toLocaleString() }}
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </BaseCard>
        </div>

        <!-- Results Panel -->
        <div class="space-y-6">
          <!-- Unit Info -->
          <BaseCard v-if="selectedUnit" title="Unidad Seleccionada">
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Precio:</span>
                <span class="font-medium">{{ selectedUnit.moneda }} {{ selectedUnit.precio.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Inicial:</span>
                <span class="font-medium">{{ selectedUnit.moneda }} {{ selectedUnit.pieInicial.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between border-t pt-2">
                <span class="text-gray-600">A Financiar:</span>
                <span class="font-bold text-primary-600">{{ selectedUnit.moneda }} {{ principal.toLocaleString() }}</span>
              </div>
            </div>
          </BaseCard>

          <!-- Results -->
          <BaseCard v-if="results" title="Resultados de la Simulación">
            <div class="space-y-4">
              <div class="bg-primary-50 p-4 rounded-lg">
                <div class="text-center">
                  <div class="text-sm text-gray-600 mb-1">Cuota Mensual</div>
                  <div class="text-2xl font-bold text-primary-600">
                    {{ selectedUnit?.moneda }} {{ results.cuota.toLocaleString() }}
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="bg-gray-50 p-3 rounded">
                  <div class="text-gray-600 mb-1">TCEA</div>
                  <div class="font-semibold">{{ results.tcea }}%</div>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <div class="text-gray-600 mb-1">TIR</div>
                  <div class="font-semibold">{{ results.tir }}%</div>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <div class="text-gray-600 mb-1">Duración</div>
                  <div class="font-semibold">{{ results.duracion }}</div>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <div class="text-gray-600 mb-1">Dur. Mod.</div>
                  <div class="font-semibold">{{ results.durMod }}</div>
                </div>
                <div class="bg-gray-50 p-3 rounded col-span-2">
                  <div class="text-gray-600 mb-1">Convexidad</div>
                  <div class="font-semibold">{{ results.convexidad }}</div>
                </div>
              </div>

              <button
                  @click="saveSimulation"
                  class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <i class="pi pi-save mr-2"></i>
                Guardar Simulación
              </button>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </LayoutMain>
</template>
