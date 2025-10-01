<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LayoutMain from '@/components/LayoutMain.vue'
import BaseCard from '@/components/BaseCard.vue'
import api from '@/services/api'
import type { Config } from '@/types'

const configs = ref<Config[]>([])
const loading = ref(false)
const showForm = ref(false)
const editingConfig = ref<Config | null>(null)

const form = ref<Config>({
  moneda: 'PEN',
  tasaTipo: 'EFECTIVA',
  efectivaAnual: 12.5,
  graciaTipo: 'NINGUNA',
  graciaMeses: 0,
  entidad: '',
  capitalizaEnGracia: false
})

async function loadConfigs() {
  loading.value = true
  try {
    const response = await api.get('/configs')
    configs.value = response.data
  } catch (error) {
    console.error('Error loading configs:', error)
  } finally {
    loading.value = false
  }
}

function openForm(config?: Config) {
  if (config) {
    editingConfig.value = config
    form.value = { ...config }
  } else {
    editingConfig.value = null
    form.value = {
      moneda: 'PEN',
      tasaTipo: 'EFECTIVA',
      efectivaAnual: 12.5,
      graciaTipo: 'NINGUNA',
      graciaMeses: 0,
      entidad: '',
      capitalizaEnGracia: false
    }
  }
  showForm.value = true
}

async function saveConfig() {
  try {
    if (editingConfig.value) {
      await api.put(`/configs/${editingConfig.value.id}`, form.value)
    } else {
      await api.post('/configs', form.value)
    }
    await loadConfigs()
    showForm.value = false
  } catch (error) {
    console.error('Error saving config:', error)
  }
}

async function deleteConfig(config: Config) {
  if (confirm('¿Está seguro de eliminar esta configuración?')) {
    try {
      await api.delete(`/configs/${config.id}`)
      await loadConfigs()
    } catch (error) {
      console.error('Error deleting config:', error)
    }
  }
}

onMounted(() => {
  loadConfigs()
})
</script>

<template>
  <LayoutMain>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Configuración</h1>
          <p class="text-sm text-gray-600 mt-1">Gestiona las configuraciones de tasas y entidades</p>
        </div>
        <button
          @click="openForm()"
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <i class="pi pi-plus mr-2"></i>
          Nueva Configuración
        </button>
      </div>

      <!-- Configurations List -->
      <BaseCard>
        <div v-if="loading" class="text-center py-8">
          <i class="pi pi-spinner pi-spin text-2xl text-gray-400"></i>
        </div>
        
        <div v-else-if="configs.length === 0" class="text-center py-8 text-gray-500">
          No hay configuraciones registradas
        </div>
        
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="config in configs" 
            :key="config.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-semibold text-gray-900">{{ config.entidad }}</h3>
                <p class="text-sm text-gray-600">{{ config.moneda }}</p>
              </div>
              <div class="flex space-x-1">
                <button
                  @click="openForm(config)"
                  class="text-gray-400 hover:text-primary-600 p-1"
                >
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  @click="deleteConfig(config)"
                  class="text-gray-400 hover:text-red-600 p-1"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>
            
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Tipo de Tasa:</span>
                <span class="font-medium">{{ config.tasaTipo }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Tasa Efectiva:</span>
                <span class="font-medium">{{ config.efectivaAnual }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Gracia:</span>
                <span class="font-medium">{{ config.graciaTipo }}</span>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Form Modal -->
      <div v-if="showForm" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showForm = false"></div>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form @submit.prevent="saveConfig" class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ editingConfig ? 'Editar Configuración' : 'Nueva Configuración' }}
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Entidad</label>
                  <input 
                    v-model="form.entidad" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select 
                    v-model="form.moneda"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="PEN">PEN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Tasa</label>
                  <select 
                    v-model="form.tasaTipo"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="EFECTIVA">Efectiva</option>
                    <option value="NOMINAL">Nominal</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tasa Efectiva Anual (%)</label>
                  <input 
                    v-model.number="form.efectivaAnual" 
                    type="number" 
                    step="0.01"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Gracia</label>
                  <select 
                    v-model="form.graciaTipo"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="NINGUNA">Ninguna</option>
                    <option value="TOTAL">Total</option>
                    <option value="PARCIAL">Parcial</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Meses de Gracia</label>
                  <input 
                    v-model.number="form.graciaMeses" 
                    type="number" 
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div class="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  @click="showForm = false"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
                >
                  {{ editingConfig ? 'Actualizar' : 'Crear' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </LayoutMain>
</template>