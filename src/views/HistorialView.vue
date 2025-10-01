<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LayoutMain from '@/components/LayoutMain.vue'
import BaseCard from '@/components/BaseCard.vue'
import api from '@/services/api'
import type { Simulation, Client, Unit, Config } from '@/types'

const simulations = ref<Simulation[]>([])
const clients = ref<Client[]>([])
const units = ref<Unit[]>([])
const configs = ref<Config[]>([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const [simulationsRes, clientsRes, unitsRes, configsRes] = await Promise.all([
      api.get('/simulations'),
      api.get('/clients'),
      api.get('/units'),
      api.get('/configs')
    ])
    simulations.value = simulationsRes.data
    clients.value = clientsRes.data
    units.value = unitsRes.data
    configs.value = configsRes.data
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

function getClientName(clientId: string) {
  const c = clients.value.find(x => String(x.id) === String(clientId))
  return c ? `${c.nombres} ${c.apellidos}` : 'Cliente no encontrado'
}

function getUnitInfo(unitId: string) {
  const u = units.value.find(x => String(x.id) === String(unitId))
  return u ? `${u.proyecto} - ${u.torre} ${u.unidad}` : 'Unidad no encontrada'
}

function getConfigInfo(configId: string) {
  const cfg = configs.value.find(x => String(x.id) === String(configId))
  return cfg ? `${cfg.entidad} - ${cfg.efectivaAnual}%` : 'Config no encontrada'
}

async function deleteSimulation(simulation: Simulation) {
  if (!confirm('¿Está seguro de eliminar esta simulación?')) return
  try {
    await api.delete(`/simulations/${String(simulation.id)}`)
    await loadData()
  } catch (error) {
    console.error('Error deleting simulation:', error)
  }
}

onMounted(loadData)
</script>

<template>
  <LayoutMain>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Historial de Simulaciones</h1>
        <p class="text-sm text-gray-600 mt-1">Revisa todas las simulaciones realizadas</p>
      </div>

      <BaseCard>
        <div v-if="loading" class="text-center py-8">
          <i class="pi pi-spinner pi-spin text-2xl text-gray-400"></i>
        </div>

        <div v-else-if="simulations.length === 0" class="text-center py-8 text-gray-500">
          No hay simulaciones registradas
        </div>

        <div v-else class="space-y-4">
          <div
              v-for="simulation in simulations"
              :key="simulation.id"
              class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">
                  {{ getClientName(simulation.clientId) }}
                </h3>
                <p class="text-sm text-gray-600">{{ getUnitInfo(simulation.unitId) }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ new Date(simulation.createdAt).toLocaleDateString('es-PE') }} -
                  {{ getConfigInfo(simulation.configId) }}
                </p>
              </div>
              <button
                  @click="deleteSimulation(simulation)"
                  class="text-gray-400 hover:text-red-600 p-1"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="bg-gray-50 p-3 rounded">
                <div class="text-gray-600 mb-1">Principal</div>
                <div class="font-semibold">S/ {{ simulation.principal.toLocaleString() }}</div>
              </div>

              <div class="bg-gray-50 p-3 rounded">
                <div class="text-gray-600 mb-1">Plazo</div>
                <div class="font-semibold">{{ simulation.plazoMeses }} meses</div>
              </div>

              <div class="bg-primary-50 p-3 rounded">
                <div class="text-gray-600 mb-1">Cuota Mensual</div>
                <div class="font-semibold text-primary-600">
                  S/ {{ simulation.resultados.cuota.toLocaleString() }}
                </div>
              </div>

              <div class="bg-gray-50 p-3 rounded">
                <div class="text-gray-600 mb-1">TCEA</div>
                <div class="font-semibold">{{ simulation.resultados.tcea }}%</div>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-500">TIR:</span>
                <span>{{ simulation.resultados.tir }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Duración:</span>
                <span>{{ simulation.resultados.duracion }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Dur. Mod:</span>
                <span>{{ simulation.resultados.durMod }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Convexidad:</span>
                <span>{{ simulation.resultados.convexidad }}</span>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </LayoutMain>
</template>
