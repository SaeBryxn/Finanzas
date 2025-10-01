<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LayoutMain from '@/components/LayoutMain.vue'
import BaseCard from '@/components/BaseCard.vue'
import api from '@/services/api'
import type { Client } from '@/types'

const clients = ref<Client[]>([])
const loading = ref(false)
const showForm = ref(false)
const editingClient = ref<Client | null>(null)

const form = ref<Client>({
  nombres: '',
  apellidos: '',
  documento: '',
  telefono: '',
  email: '',
  ingresosMensuales: 0,
  dependientes: 0,
  empleo: ''
})

async function loadClients() {
  loading.value = true
  try {
    const response = await api.get('/clients')
    clients.value = response.data
  } catch (error) {
    console.error('Error loading clients:', error)
  } finally {
    loading.value = false
  }
}

function openForm(client?: Client) {
  if (client) {
    editingClient.value = client
    form.value = { ...client }
  } else {
    editingClient.value = null
    form.value = {
      nombres: '',
      apellidos: '',
      documento: '',
      telefono: '',
      email: '',
      ingresosMensuales: 0,
      dependientes: 0,
      empleo: ''
    }
  }
  showForm.value = true
}

async function saveClient() {
  try {
    if (editingClient.value) {
      await api.put(`/clients/${editingClient.value.id}`, form.value)
    } else {
      await api.post('/clients', form.value)
    }
    await loadClients()
    showForm.value = false
  } catch (error) {
    console.error('Error saving client:', error)
  }
}

async function deleteClient(client: Client) {
  if (confirm('¿Está seguro de eliminar este cliente?')) {
    try {
      await api.delete(`/clients/${client.id}`)
      await loadClients()
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }
}

onMounted(() => {
  loadClients()
})
</script>

<template>
  <LayoutMain>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Clientes</h1>
          <p class="text-sm text-gray-600 mt-1">Gestiona la información de tus clientes</p>
        </div>
        <button
          @click="openForm()"
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <i class="pi pi-plus mr-2"></i>
          Nuevo Cliente
        </button>
      </div>

      <!-- Clients List -->
      <BaseCard>
        <div v-if="loading" class="text-center py-8">
          <i class="pi pi-spinner pi-spin text-2xl text-gray-400"></i>
        </div>
        
        <div v-else-if="clients.length === 0" class="text-center py-8 text-gray-500">
          No hay clientes registrados
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dependientes</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="client in clients" :key="client.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ client.nombres }} {{ client.apellidos }}
                    </div>
                    <div class="text-sm text-gray-500">{{ client.documento }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ client.email }}</div>
                  <div class="text-sm text-gray-500">{{ client.telefono }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    S/ {{ client.ingresosMensuales.toLocaleString() }}
                  </div>
                  <div class="text-sm text-gray-500">{{ client.empleo }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ client.dependientes }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="openForm(client)"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button
                    @click="deleteClient(client)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>

      <!-- Form Modal -->
      <div v-if="showForm" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showForm = false"></div>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form @submit.prevent="saveClient" class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ editingClient ? 'Editar Cliente' : 'Nuevo Cliente' }}
              </h3>
              
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                  <input 
                    v-model="form.nombres" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                  <input 
                    v-model="form.apellidos" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                  <input 
                    v-model="form.documento" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input 
                    v-model="form.telefono" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    v-model="form.email" 
                    type="email" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ingresos Mensuales</label>
                  <input 
                    v-model.number="form.ingresosMensuales" 
                    type="number" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Dependientes</label>
                  <input 
                    v-model.number="form.dependientes" 
                    type="number" 
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Empleo</label>
                  <input 
                    v-model="form.empleo" 
                    type="text" 
                    required
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
                  {{ editingClient ? 'Actualizar' : 'Crear' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </LayoutMain>
</template>