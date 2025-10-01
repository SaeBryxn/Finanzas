<script setup lang="ts">
import LayoutMain from '@/components/LayoutMain.vue'
import BaseCard from '@/components/BaseCard.vue'
</script>

<template>
  <LayoutMain>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Ayuda y Documentación</h1>
        <p class="text-sm text-gray-600 mt-1">Guía de uso del sistema CreditApp</p>
      </div>

      <!-- Getting Started -->
      <BaseCard title="Primeros Pasos" subtitle="Cómo empezar a usar el sistema">
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="bg-primary-100 text-primary-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h3 class="font-medium text-gray-900">Configurar Tasas</h3>
              <p class="text-sm text-gray-600">Vaya a la sección Configuración para definir las tasas de interés y entidades bancarias.</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="bg-primary-100 text-primary-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h3 class="font-medium text-gray-900">Registrar Clientes</h3>
              <p class="text-sm text-gray-600">Agregue la información de sus clientes en la sección Clientes.</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="bg-primary-100 text-primary-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h3 class="font-medium text-gray-900">Añadir Unidades</h3>
              <p class="text-sm text-gray-600">Registre las unidades inmobiliarias disponibles para la venta.</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="bg-primary-100 text-primary-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
            <div>
              <h3 class="font-medium text-gray-900">Simular Créditos</h3>
              <p class="text-sm text-gray-600">Use el simulador para calcular cuotas y métricas financieras.</p>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Features Overview -->
      <BaseCard title="Características Principales" subtitle="Funcionalidades disponibles en el sistema">
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
              <i class="pi pi-calculator mr-2 text-primary-600"></i>
              Motor Financiero Avanzado
            </h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Método francés vencido (30/360)</li>
              <li>• Cálculo de TCEA y TIR</li>
              <li>• Duración y duración modificada</li>
              <li>• Análisis de convexidad</li>
              <li>• Períodos de gracia</li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
              <i class="pi pi-users mr-2 text-primary-600"></i>
              Gestión de Clientes
            </h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Registro completo de datos</li>
              <li>• Información de ingresos</li>
              <li>• Historial de simulaciones</li>
              <li>• Seguimiento de propuestas</li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
              <i class="pi pi-building mr-2 text-primary-600"></i>
              Inventario de Unidades
            </h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Catálogo de propiedades</li>
              <li>• Precios y condiciones</li>
              <li>• Gastos adicionales</li>
              <li>• Múltiples monedas</li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
              <i class="pi pi-chart-line mr-2 text-primary-600"></i>
              Reportes y Análisis
            </h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Cronogramas detallados</li>
              <li>• Métricas financieras</li>
              <li>• Historial completo</li>
              <li>• Auditoría de actividades</li>
            </ul>
          </div>
        </div>
      </BaseCard>

      <!-- Financial Concepts -->
      <BaseCard title="Conceptos Financieros" subtitle="Explicación de las métricas utilizadas">
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-900">TCEA (Tasa de Costo Efectivo Anual)</h4>
            <p class="text-sm text-gray-600">Representa el costo total del crédito, incluyendo todos los gastos asociados, expresado en términos anuales.</p>
          </div>
          
          <div>
            <h4 class="font-medium text-gray-900">TIR (Tasa Interna de Retorno)</h4>
            <p class="text-sm text-gray-600">Es la tasa de descuento que hace que el VPN de los flujos de efectivo sea igual a cero.</p>
          </div>
          
          <div>
            <h4 class="font-medium text-gray-900">Duración</h4>
            <p class="text-sm text-gray-600">Mide la sensibilidad del precio de un instrumento financiero a los cambios en las tasas de interés.</p>
          </div>
          
          <div>
            <h4 class="font-medium text-gray-900">Convexidad</h4>
            <p class="text-sm text-gray-600">Mide la curvatura de la relación precio-rendimiento, complementando la medida de duración.</p>
          </div>
        </div>
      </BaseCard>

      <!-- Support -->
      <BaseCard title="Soporte Técnico" subtitle="Información de contacto y recursos adicionales">
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="text-sm text-gray-600">
            <p class="mb-2">Para soporte técnico o consultas sobre el uso del sistema:</p>
            <div class="space-y-1">
              <p><strong>Email:</strong> soporte@creditapp.com</p>
              <p><strong>Teléfono:</strong> +51 1 234-5678</p>
              <p><strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </LayoutMain>
</template>