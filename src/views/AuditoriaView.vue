<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LayoutMain from '@/components/LayoutMain.vue'
import BaseCard from '@/components/BaseCard.vue'
import api from '@/services/api'
import type { AuditLog } from '@/types'

const auditLogs = ref<AuditLog[]>([])
const loading = ref(false)

async function loadAuditLogs() {
  loading.value = true
  try {
    const response = await api.get('/audit')
    auditLogs.value = response.data.sort((a: AuditLog, b: AuditLog) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  } catch (error) {
    console.error('Error loading audit logs:', error)
  } finally {
    loading.value = false
  }
}

function getActionColor(action: string) {
  switch (action.toLowerCase()) {
    case 'create': return 'bg-green-100 text-green-800'
    case 'update': return 'bg-blue-100 text-blue-800'
    case 'delete': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  loadAuditLogs()
})
</script>

<template>
  <LayoutMain>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Auditoría</h1>
        <p class="text-sm text-gray-600 mt-1">Registro de todas las actividades del sistema</p>
      </div>

      <!-- Audit Logs -->
      <BaseCard>
        <div v-if="loading" class="text-center py-8">
          <i class="pi pi-spinner pi-spin text-2xl text-gray-400"></i>
        </div>
        
        <div v-else-if="auditLogs.length === 0" class="text-center py-8 text-gray-500">
          No hay registros de auditoría
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="log in auditLogs" 
            :key="log.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <span 
                    :class="getActionColor(log.action)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ log.action }}
                  </span>
                  <span class="text-sm font-medium text-gray-900">{{ log.entity }}</span>
                  <span class="text-sm text-gray-500">#{{ log.entityId }}</span>
                </div>
                
                <div class="text-sm text-gray-600 mb-2">
                  Usuario: <span class="font-medium">{{ log.userEmail }}</span>
                </div>
                
                <div v-if="log.payload" class="text-xs text-gray-500 bg-gray-100 p-2 rounded font-mono">
                  {{ JSON.stringify(log.payload, null, 2) }}
                </div>
              </div>
              
              <div class="text-xs text-gray-500 text-right">
                <div>{{ new Date(log.timestamp).toLocaleDateString('es-PE') }}</div>
                <div>{{ new Date(log.timestamp).toLocaleTimeString('es-PE') }}</div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </LayoutMain>
</template>