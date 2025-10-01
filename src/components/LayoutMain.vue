<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Topbar -->
    <header v-if="showTopbar" class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div :class="containerClass" class="flex items-center justify-between h-14">
        <!-- Brand -->
        <RouterLink to="/clientes" class="flex items-center gap-2">
          <i class="pi pi-dollar text-primary-600"></i>
          <span class="font-semibold">CreditApp</span>
        </RouterLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-1">
          <RouterLink
              v-for="item in menu"
              :key="item.to"
              :to="item.to"
              class="px-3 py-2 rounded-md text-sm font-medium"
              :class="navClass(item.to)"
          >
            <i :class="item.icon" class="mr-2"></i>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <!-- Right side -->
        <div class="flex items-center gap-2">
          <!-- Acciones inyectables desde la vista -->
          <slot name="actions" />
          <button
              v-if="isAuth"
              @click="logout"
              class="hidden md:inline-flex text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50"
          >
            Salir
          </button>
          <button
              @click="mobileOpen = !mobileOpen"
              class="md:hidden p-2 rounded hover:bg-gray-100"
              aria-label="Abrir menú"
          >
            <i class="pi pi-bars"></i>
          </button>
        </div>
      </div>

      <!-- Mobile nav -->
      <div v-if="mobileOpen" class="md:hidden border-t bg-white">
        <div :class="containerClass" class="py-2 space-y-1">
          <RouterLink
              v-for="item in menu"
              :key="item.to"
              :to="item.to"
              class="block px-3 py-2 rounded-md text-sm font-medium"
              :class="navClass(item.to)"
              @click="mobileOpen = false"
          >
            <i :class="item.icon" class="mr-2"></i>{{ item.label }}
          </RouterLink>

          <button
              v-if="isAuth"
              @click="logout"
              class="w-full text-left px-3 py-2 rounded-md text-sm border hover:bg-gray-50 mt-2"
          >
            Salir
          </button>
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main :class="containerClass" class="py-6">
      <slot />
    </main>

    <!-- Footer (opcional) -->
    <footer v-if="showFooter" class="border-t bg-white py-4 mt-8">
      <div :class="containerClass" class="text-xs text-gray-500">
        © {{ year }} CreditApp. Todos los derechos reservados.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface MenuItem { label: string; to: string; icon: string }

const props = withDefaults(defineProps<{
  fluid?: boolean
  showTopbar?: boolean
  showFooter?: boolean
}>(), {
  fluid: false,
  showTopbar: true,
  showFooter: false,
})

const containerClass = computed(() =>
    props.fluid ? 'max-w-none px-4 sm:px-6 lg:px-8'
        : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
)

const menu: MenuItem[] = [
  { label: 'Clientes',     to: '/clientes',   icon: 'pi pi-users' },
  { label: 'Unidades',     to: '/unidades',   icon: 'pi pi-building' },
  { label: 'Simulador',    to: '/simulador',  icon: 'pi pi-calculator' },
  { label: 'Historial',    to: '/historial',  icon: 'pi pi-history' },
  { label: 'Configuración',to: '/config',     icon: 'pi pi-cog' },
  { label: 'Auditoría',    to: '/auditoria',  icon: 'pi pi-list-check' },
  { label: 'Ayuda',        to: '/ayuda',      icon: 'pi pi-question-circle' },
]

const route = useRoute()
const router = useRouter()
const mobileOpen = ref(false)

const isActive = (to: string) => route.path === to
const navClass = (to: string) =>
    isActive(to) ? 'bg-primary-100 text-primary-700'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'

const auth = useAuthStore()
const isAuth = computed(() => auth?.isAuthenticated ?? false)
const logout = () => {
  auth.logout()
  router.push('/login')
}

const year = new Date().getFullYear()
</script>

<style scoped>
/* Puedes añadir detalles visuales aquí si lo deseas */
</style>
