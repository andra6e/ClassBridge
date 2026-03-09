<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  GraduationCap,
  Users,
  Heart,
  FileText,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  Layers,
} from 'lucide-vue-next'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title,
} from 'chart.js'
import reportesApi from '../../api/reportes.api'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title)

const router = useRouter()
const datos = ref(null)
const cargando = ref(true)
const errorMsg = ref('')

const stats = computed(() => {
  if (!datos.value) return []
  const r = datos.value.resumen
  return [
    { clave: 'estudiantes', titulo: 'Estudiantes', valor: r.totalEstudiantes, icono: GraduationCap, color: '#4f46e5', ruta: '/admin/estudiantes' },
    { clave: 'maestros', titulo: 'Maestros', valor: r.totalMaestros, icono: Users, color: '#2563eb', ruta: '/admin/maestros' },
    { clave: 'padres', titulo: 'Padres', valor: r.totalPadres, icono: Heart, color: '#0ea5e9', ruta: '/admin/padres' },
    { clave: 'matriculas', titulo: 'Matrículas Activas', valor: r.totalMatriculas, icono: FileText, color: '#3b82f6', ruta: '/admin/matriculas' },
  ]
})

const chartAsistencia = computed(() => {
  if (!datos.value?.asistenciaPorGrado?.length) return null
  const labels = datos.value.asistenciaPorGrado.map(a => a.grado)
  return {
    data: {
      labels,
      datasets: [
        {
          label: 'Presentes',
          data: datos.value.asistenciaPorGrado.map(a => a.presentes),
          backgroundColor: '#6366f1',
          borderRadius: 6,
          barPercentage: 0.6,
        },
        {
          label: 'Ausentes',
          data: datos.value.asistenciaPorGrado.map(a => a.ausentes),
          backgroundColor: '#e5e7eb',
          borderRadius: 6,
          barPercentage: 0.6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: 'Inter', size: 12 } } } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { family: 'Inter', size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
      },
    },
  }
})

const chartJustificantes = computed(() => {
  if (!datos.value?.justificantes) return null
  const j = datos.value.justificantes
  return {
    data: {
      labels: ['Pendientes', 'Aprobados', 'Rechazados'],
      datasets: [{
        data: [j.pendientes, j.aprobados, j.rechazados],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
        borderWidth: 0,
        spacing: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { family: 'Inter', size: 12 } } } },
    },
  }
})

const chartEstudiantes = computed(() => {
  if (!datos.value?.estudiantesPorGrado?.length) return null
  return {
    data: {
      labels: datos.value.estudiantesPorGrado.map(e => e.grado),
      datasets: [{
        label: 'Estudiantes',
        data: datos.value.estudiantesPorGrado.map(e => e.total),
        backgroundColor: '#818cf8',
        borderRadius: 6,
        barPercentage: 0.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { family: 'Inter', size: 11 } } },
        y: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
      },
    },
  }
})

const accesos = [
  { titulo: 'Grados y Asignaciones', desc: 'Gestiona grados y asigna maestros', ruta: '/admin/grados', icono: Layers },
  { titulo: 'Matrículas', desc: 'Inscribe estudiantes en grados', ruta: '/admin/matriculas', icono: FileText },
]

onMounted(async () => {
  try {
    const res = await reportesApi.estadisticasAdmin()
    datos.value = res.data.data
  } catch (err) {
    errorMsg.value = 'Error al cargar estadísticas'
  }
  cargando.value = false
})
</script>

<template>
  <div>
    <div class="cabecera-dash">
      <div>
        <h1 class="titulo-pagina">Panel de Administración</h1>
        <p class="subtitulo-pagina">Resumen general del sistema ClassBridge</p>
      </div>
    </div>

    <div v-if="cargando" class="cargando-centro"><span class="spinner spinner-grande"></span></div>

    <div v-else-if="errorMsg" class="alerta alerta-error">{{ errorMsg }}</div>

    <template v-else-if="datos">
      <div class="stats-grid">
        <div
          v-for="s in stats"
          :key="s.clave"
          class="stat-card"
          @click="router.push(s.ruta)"
        >
          <div class="stat-icono" :style="{ background: s.color + '12', color: s.color }">
            <component :is="s.icono" :size="22" :stroke-width="2.2" />
          </div>
          <div class="stat-contenido">
            <span class="stat-valor">{{ s.valor }}</span>
            <span class="stat-etiqueta">{{ s.titulo }}</span>
          </div>
          <svg class="stat-flecha" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      <div class="metricas-rapidas">
        <div class="metrica-card">
          <div class="metrica-icono" style="background: #e8eeff; color: #4f46e5;">
            <CheckCircle2 :size="18" :stroke-width="2.2" />
          </div>
          <div>
            <span class="metrica-valor">{{ datos.resumen.tasaAsistencia }}%</span>
            <span class="metrica-label">Tasa de asistencia</span>
          </div>
        </div>
        <div class="metrica-card">
          <div class="metrica-icono" style="background: #dbeafe; color: #2563eb;">
            <BookOpen :size="18" :stroke-width="2.2" />
          </div>
          <div>
            <span class="metrica-valor">{{ datos.resumen.totalContenidos }}</span>
            <span class="metrica-label">Clases registradas</span>
          </div>
        </div>
        <div class="metrica-card">
          <div class="metrica-icono" style="background: #e0f2fe; color: #0ea5e9;">
            <MessageSquare :size="18" :stroke-width="2.2" />
          </div>
          <div>
            <span class="metrica-valor">{{ datos.resumen.totalConversacionesIA }}</span>
            <span class="metrica-label">Conversaciones IA</span>
          </div>
        </div>
        <div class="metrica-card">
          <div class="metrica-icono" style="background: #eff6ff; color: #3b82f6;">
            <AlertTriangle :size="18" :stroke-width="2.2" />
          </div>
          <div>
            <span class="metrica-valor">{{ datos.justificantes.pendientes }}</span>
            <span class="metrica-label">Justificantes pendientes</span>
          </div>
        </div>
      </div>

      <div class="graficas-grid">
        <div class="grafica-card tarjeta">
          <h3 class="grafica-titulo">Asistencia por Grado</h3>
          <p class="grafica-subtitulo">Presentes vs Ausentes por grado</p>
          <div class="grafica-contenedor">
            <Bar v-if="chartAsistencia" :data="chartAsistencia.data" :options="chartAsistencia.options" />
            <p v-else class="mensaje-vacio">Sin datos de asistencia</p>
          </div>
        </div>

        <div class="grafica-card tarjeta">
          <h3 class="grafica-titulo">Justificantes</h3>
          <p class="grafica-subtitulo">Estado de justificantes enviados</p>
          <div class="grafica-contenedor grafica-donut">
            <Doughnut v-if="chartJustificantes" :data="chartJustificantes.data" :options="chartJustificantes.options" />
            <p v-else class="mensaje-vacio">Sin justificantes</p>
          </div>
        </div>
      </div>

      <div class="grafica-card tarjeta" style="margin-bottom: 24px;">
        <h3 class="grafica-titulo">Estudiantes por Grado</h3>
        <p class="grafica-subtitulo">Distribución de matrículas activas</p>
        <div class="grafica-contenedor">
          <Bar v-if="chartEstudiantes" :data="chartEstudiantes.data" :options="chartEstudiantes.options" />
          <p v-else class="mensaje-vacio">Sin datos</p>
        </div>
      </div>

      <h2 class="seccion-titulo">Acceso Rápido</h2>
      <div class="accesos-grid">
        <div
          v-for="acc in accesos"
          :key="acc.ruta"
          class="acceso-card"
          @click="router.push(acc.ruta)"
        >
          <div class="acceso-icono">
            <component :is="acc.icono" :size="20" :stroke-width="2.2" />
          </div>
          <div>
            <h3 class="acceso-titulo">{{ acc.titulo }}</h3>
            <p class="acceso-desc">{{ acc.desc }}</p>
          </div>
          <svg class="acceso-flecha" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cabecera-dash {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border: 1px solid var(--gris-200);
  border-radius: var(--radio);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all var(--transicion);
}

.stat-card:hover {
  border-color: var(--gris-300);
  box-shadow: var(--sombra-md);
}

.stat-icono {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-contenido {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-valor {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--gris-900);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.stat-etiqueta {
  font-size: 0.8125rem;
  color: var(--gris-500);
  font-weight: 500;
}

.stat-flecha {
  color: var(--gris-300);
  flex-shrink: 0;
}

.metricas-rapidas {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metrica-card {
  background: white;
  border: 1px solid var(--gris-200);
  border-radius: var(--radio);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.metrica-icono {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metrica-valor {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gris-900);
  display: block;
  line-height: 1.2;
}

.metrica-label {
  font-size: 0.75rem;
  color: var(--gris-500);
}

.graficas-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
  margin-bottom: 20px;
}

.grafica-card {
  padding: 24px;
}

.grafica-titulo {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--gris-900);
  margin-bottom: 2px;
}

.grafica-subtitulo {
  font-size: 0.8125rem;
  color: var(--gris-500);
  margin-bottom: 20px;
}

.grafica-contenedor {
  height: 260px;
  position: relative;
}

.grafica-donut {
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seccion-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gris-900);
  margin-bottom: 12px;
}

.accesos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.acceso-card {
  background: white;
  border: 1px solid var(--gris-200);
  border-radius: var(--radio);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all var(--transicion);
}

.acceso-card:hover {
  border-color: var(--primario-200);
  box-shadow: var(--sombra);
}

.acceso-icono {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--primario-claro);
  color: var(--primario);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.acceso-titulo {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gris-800);
  margin-bottom: 2px;
}

.acceso-desc {
  font-size: 0.75rem;
  color: var(--gris-500);
}

.acceso-flecha {
  color: var(--gris-300);
  margin-left: auto;
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .metricas-rapidas { grid-template-columns: repeat(2, 1fr); }
  .graficas-grid { grid-template-columns: 1fr; }
}
</style>
