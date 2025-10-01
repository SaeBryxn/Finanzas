<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LayoutMain from '@/components/LayoutMain.vue'
import BaseCard from '@/components/BaseCard.vue'
import api from '@/services/api'
import type { Unit } from '@/types'

const units = ref<Unit[]>([])
const loading = ref(false)
const showForm = ref(false)
const editingUnit = ref<Unit | null>(null)

const form = ref<Unit>({
  proyecto: '',
  torre: '',
  unidad: '',
  moneda: 'PEN',
  precio: 0,
  pieInicial: 0,
  gastos: 0,
  seguros: 0,
  comisiones: 0,
  imageUrl: '' // puede ser URL http(s) o data:image/*;base64,...
})

// Config de subida
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_FILE_BYTES = 1_000_000 // 1MB para no inflar demasiado db.json
const PLACEHOLDER = 'https://placehold.co/640x160?text=Sin+imagen'

function safeSrc(u?: string) {
  if (!u) return PLACEHOLDER
  // Acepta Data URL de imagen
  if (u.startsWith('data:image/')) return u
  try {
    const parsed = new URL(u, window.location.origin)
    if (!/^https?:$/.test(parsed.protocol)) return PLACEHOLDER
    return parsed.toString()
  } catch {
    return PLACEHOLDER
  }
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (img && img.src !== PLACEHOLDER) img.src = PLACEHOLDER
}

function bytesToKB(n: number) { return Math.round((n / 1024) * 10) / 10 }

async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!ALLOWED_MIME.includes(file.type)) {
    alert(`Tipo no permitido: ${file.type}. Permitidos: PNG, JPG/JPEG, WEBP, GIF, SVG`)
    input.value = ''
    return
  }
  if (file.size > MAX_FILE_BYTES) {
    alert(`La imagen pesa ${bytesToKB(file.size)}KB y el máximo es ${bytesToKB(MAX_FILE_BYTES)}KB.`)
    input.value = ''
    return
  }

  try {
    const dataUrl = await readFileAsDataURL(file)
    form.value.imageUrl = dataUrl // guardamos base64 listo para persistir
  } catch (err) {
    console.error('Error leyendo archivo:', err)
    alert('No se pudo leer la imagen')
  }
}

function clearImage() {
  form.value.imageUrl = ''
  // limpiar input file visualmente (opcional: usar ref al input si quieres resetearlo)
}

async function loadUnits() {
  loading.value = true
  try {
    const res = await api.get('/units')
    units.value = res.data
  } catch (err) {
    console.error('Error loading units:', err)
  } finally {
    loading.value = false
  }
}

function openForm(unit?: Unit) {
  if (unit) {
    editingUnit.value = unit
    form.value = { ...unit }
  } else {
    editingUnit.value = null
    form.value = {
      proyecto: '',
      torre: '',
      unidad: '',
      moneda: 'PEN',
      precio: 0,
      pieInicial: 0,
      gastos: 0,
      seguros: 0,
      comisiones: 0,
      imageUrl: ''
    }
  }
  showForm.value = true
}

async function saveUnit() {
  try {
    if (editingUnit.value?.id != null) {
      await api.put(`/units/${String(editingUnit.value.id)}`, form.value)
    } else {
      await api.post('/units', form.value)
    }
    await loadUnits()
    showForm.value = false
  } catch (err) {
    console.error('Error saving unit:', err)
    alert('Error al guardar la unidad')
  }
}

async function deleteUnit(unit: Unit) {
  if (!confirm('¿Está seguro de eliminar esta unidad?')) return
  try {
    await api.delete(`/units/${String(unit.id)}`)
    await loadUnits()
  } catch (err) {
    console.error('Error deleting unit:', err)
    alert('Error al eliminar la unidad')
  }
}

onMounted(loadUnits)
</script>

<template>
  <LayoutMain>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Unidades</h1>
          <p class="text-sm text-gray-600 mt-1">Gestiona las unidades inmobiliarias disponibles</p>
        </div>
        <button
            @click="openForm()"
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <i class="pi pi-plus mr-2"></i>
          Nueva Unidad
        </button>
      </div>

      <BaseCard>
        <div v-if="loading" class="text-center py-8">
          <i class="pi pi-spinner pi-spin text-2xl text-gray-400"></i>
        </div>

        <div v-else-if="units.length === 0" class="text-center py-8 text-gray-500">
          No hay unidades registradas
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
              v-for="unit in units"
              :key="unit.id"
              class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <figure class="w-full">
              <img
                  :src="safeSrc(unit.imageUrl)"
                  alt="Foto de la unidad"
                  class="w-full h-40 object-cover"
                  @error="onImgError"
                  loading="lazy"
              />
            </figure>

            <div class="p-4">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ unit.proyecto }}</h3>
                  <p class="text-sm text-gray-600">{{ unit.torre }} - {{ unit.unidad }}</p>
                </div>
                <div class="flex space-x-1">
                  <button
                      @click="openForm(unit)"
                      class="text-gray-400 hover:text-primary-600 p-1"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button
                      @click="deleteUnit(unit)"
                      class="text-gray-400 hover:text-red-600 p-1"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>

              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Precio:</span>
                  <span class="font-medium">{{ unit.moneda }} {{ unit.precio.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Inicial:</span>
                  <span class="font-medium">{{ unit.moneda }} {{ unit.pieInicial.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Gastos:</span>
                  <span class="font-medium">{{ unit.moneda }} {{ unit.gastos.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Modal del formulario -->
      <div v-if="showForm" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showForm = false"></div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form @submit.prevent="saveUnit" class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ editingUnit ? 'Editar Unidad' : 'Nueva Unidad' }}
              </h3>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
                  <input
                      v-model="form.proyecto"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Torre</label>
                  <input
                      v-model="form.torre"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                  <input
                      v-model="form.unidad"
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
                  <label class="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input
                      v-model.number="form.precio"
                      type="number"
                      required
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Pie Inicial</label>
                  <input
                      v-model.number="form.pieInicial"
                      type="number"
                      required
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gastos</label>
                  <input
                      v-model.number="form.gastos"
                      type="number"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Seguros</label>
                  <input
                      v-model.number="form.seguros"
                      type="number"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Comisiones</label>
                  <input
                      v-model.number="form.comisiones"
                      type="number"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <!-- URL de imagen -->
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">URL de Imagen (opcional)</label>
                  <input
                      v-model="form.imageUrl"
                      type="url"
                      placeholder="https://..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <!-- Subida de archivo -->
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Subir imagen (PNG, JPG, WEBP, GIF, SVG) máx. {{ Math.round(MAX_FILE_BYTES/1024) }}KB</label>
                  <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.gif,.svg,image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      @change="onFileChange"
                      class="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  />
                  <div class="mt-2 flex items-center gap-3" v-if="form.imageUrl">
                    <img :src="safeSrc(form.imageUrl)" alt="preview" class="w-20 h-12 object-cover rounded border" @error="onImgError" />
                    <button type="button" @click="clearImage" class="text-xs text-red-600 hover:underline">Quitar imagen</button>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">Si subes un archivo, tendrá prioridad sobre la URL (se guardará como base64 en la unidad).</p>
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
                  {{ editingUnit ? 'Actualizar' : 'Crear' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </LayoutMain>
</template>
