<script setup>
import { computed, onMounted, ref } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import reportesApi from '../api/reportes.api'
import { useAuthStore } from '../store/auth.store'
import Boton from '../components/ui/Boton.vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
)

const auth = useAuthStore()
const cargando = ref(false)
const error = ref('')
const data = ref(null)

const hoy = new Date()
const hoyISO = hoy.toISOString().slice(0, 10)
const hace30 = new Date(hoy)
hace30.setDate(hace30.getDate() - 29)

const desde = ref(hace30.toISOString().slice(0, 10))
const hasta = ref(hoyISO)

const esAdmin = computed(() => auth.rolUsuario === 'admin')

const resumenCards = computed(() => {
  if (!data.value?.resumen) return []
  const r = data.value.resumen

  const cardsBase = [
    { label: 'Presentes', value: r.presentes ?? 0, color: 'var(--exito)' },
    { label: 'Ausentes', value: r.ausentes ?? 0, color: 'var(--peligro)' },
    { label: 'Tasa asistencia', value: r.tasaAsistencia !== null && r.tasaAsistencia !== undefined ? `${r.tasaAsistencia}%` : '—', color: 'var(--primario)' },
    { label: 'Clases registradas', value: r.totalClases ?? 0, color: 'var(--azul-600)' },
    { label: 'Justificantes pendientes', value: r.justificantesPendientes ?? 0, color: '#f59e0b' },
  ]

  if (esAdmin.value) {
    cardsBase.push(
      { label: 'Total estudiantes', value: r.totalEstudiantes ?? 0, color: '#6366f1' },
      { label: 'Total maestros', value: r.totalMaestros ?? 0, color: '#0ea5e9' },
      { label: 'Total padres', value: r.totalPadres ?? 0, color: '#10b981' },
    )
  } else {
    cardsBase.push({ label: 'Estudiantes activos (mi grado)', value: r.totalEstudiantesActivos ?? 0, color: '#6366f1' })
  }

  return cardsBase
})

const chartAsistencia = computed(() => {
  const serie = data.value?.asistenciaSerie || []
  return {
    data: {
      labels: serie.map((i) => i.fecha),
      datasets: [
        {
          label: 'Presentes',
          data: serie.map((i) => i.presentes),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.15)',
          fill: true,
          tension: 0.25,
        },
        {
          label: 'Ausentes',
          data: serie.map((i) => i.ausentes),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.12)',
          fill: true,
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
    },
  }
})

const chartJustificantes = computed(() => {
  const j = data.value?.justificantes || { pendientes: 0, aprobados: 0, rechazados: 0 }
  return {
    data: {
      labels: ['Pendientes', 'Aprobados', 'Rechazados'],
      datasets: [{
        data: [j.pendientes || 0, j.aprobados || 0, j.rechazados || 0],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { position: 'bottom' } },
    },
  }
})

const chartContenidosMateria = computed(() => {
  const items = data.value?.contenidosPorMateria || []
  return {
    data: {
      labels: items.map((i) => i.materia),
      datasets: [{
        label: 'Clases',
        data: items.map((i) => i.total),
        backgroundColor: '#6366f1',
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    },
  }
})

const chartMatriculasGrado = computed(() => {
  const items = data.value?.matriculasPorGrado || []
  return {
    data: {
      labels: items.map((i) => i.grado),
      datasets: [{
        label: 'Matrículas activas',
        data: items.map((i) => i.total),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    },
  }
})

const chartAusenciasTop = computed(() => {
  const items = data.value?.estudiantesAusenciasTop || []
  return {
    data: {
      labels: items.map((i) => i.estudiante),
      datasets: [{
        label: 'Ausencias',
        data: items.map((i) => i.ausencias),
        backgroundColor: '#ef4444',
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
    },
  }
})

function validarRango() {
  if (!desde.value || !hasta.value) {
    error.value = 'Selecciona un rango de fechas válido'
    return false
  }
  if (desde.value > hasta.value) {
    error.value = 'La fecha desde no puede ser mayor que hasta'
    return false
  }
  return true
}

async function cargar() {
  if (!validarRango()) return
  cargando.value = true
  error.value = ''
  try {
    const params = { desde: desde.value, hasta: hasta.value }
    const res = esAdmin.value
      ? await reportesApi.moduloAdmin(params)
      : await reportesApi.moduloMaestro(params)

    data.value = res.data?.data || null
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar reportes'
  } finally {
    cargando.value = false
  }
}

function exportarExcel() {
  if (!data.value) return

  const wb = XLSX.utils.book_new()

  const resumenRows = [
    ['Métrica', 'Valor'],
    ...resumenCards.value.map((c) => [c.label, c.value]),
  ]
  const resumenSheet = XLSX.utils.aoa_to_sheet(resumenRows)
  XLSX.utils.book_append_sheet(wb, resumenSheet, 'Resumen')

  const asistenciaRows = [
    ['Fecha', 'Presentes', 'Ausentes'],
    ...(data.value.asistenciaSerie || []).map((r) => [r.fecha, r.presentes, r.ausentes]),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(asistenciaRows), 'Asistencia')

  const contenidosRows = [
    ['Materia', 'Total clases'],
    ...(data.value.contenidosPorMateria || []).map((r) => [r.materia, r.total]),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(contenidosRows), 'Contenidos')

  const ausenciasRows = [
    ['Estudiante', 'Ausencias'],
    ...(data.value.estudiantesAusenciasTop || []).map((r) => [r.estudiante, r.ausencias]),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ausenciasRows), 'Top Ausencias')

  if (esAdmin.value) {
    const matRows = [
      ['Grado', 'Matrículas activas'],
      ...(data.value.matriculasPorGrado || []).map((r) => [r.grado, r.total]),
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(matRows), 'Matrículas')
  }

  XLSX.writeFile(wb, `reportes-${auth.rolUsuario}-${desde.value}-a-${hasta.value}.xlsx`)
}

function exportarPdf() {
  if (!data.value) return

  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text(`Reportes ${esAdmin.value ? 'Administrador' : 'Maestro'}`, 14, 15)
  doc.setFontSize(10)
  doc.text(`Rango: ${desde.value} a ${hasta.value}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [['Métrica', 'Valor']],
    body: resumenCards.value.map((c) => [c.label, String(c.value)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 70, 229] },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Fecha', 'Presentes', 'Ausentes']],
    body: (data.value.asistenciaSerie || []).map((r) => [r.fecha, r.presentes, r.ausentes]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Estudiante', 'Ausencias']],
    body: (data.value.estudiantesAusenciasTop || []).map((r) => [r.estudiante, r.ausencias]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [239, 68, 68] },
  })

  doc.save(`reportes-${auth.rolUsuario}-${desde.value}-a-${hasta.value}.pdf`)
}

onMounted(cargar)
</script>

<template>
  <div>
    <div class="cabecera-pagina cabecera-reportes">
      <div>
        <h1 class="titulo-pagina">Módulo de Reportes</h1>
        <p class="subtitulo-pagina">
          {{ esAdmin ? 'Vista ejecutiva para administración' : 'Vista analítica para tu grado' }}
        </p>
      </div>
      <div class="acciones-cabecera">
        <Boton variante="secundario" @click="exportarExcel">Exportar Excel</Boton>
        <Boton variante="fantasma" @click="exportarPdf">Exportar PDF</Boton>
      </div>
    </div>

    <div class="tarjeta filtros-card">
      <div class="filtros-grid">
        <div class="campo-grupo">
          <label class="campo-etiqueta">Desde</label>
          <input v-model="desde" type="date" class="campo-select" :max="hoyISO" />
        </div>
        <div class="campo-grupo">
          <label class="campo-etiqueta">Hasta</label>
          <input v-model="hasta" type="date" class="campo-select" :max="hoyISO" />
        </div>
        <div class="filtros-btn">
          <Boton @click="cargar" :cargando="cargando">Actualizar reportes</Boton>
        </div>
      </div>
      <p v-if="data?.grado && !esAdmin" class="info-grado">
        Grado: <strong>{{ data.grado.nombre }}</strong> · Año escolar: <strong>{{ data.grado.anioEscolar }}</strong>
      </p>
      <p v-if="data?.mensaje" class="alerta alerta-error">{{ data.mensaje }}</p>
      <p v-if="error" class="alerta alerta-error">{{ error }}</p>
    </div>

    <div v-if="cargando" class="tarjeta cargando-centro"><span class="spinner spinner-grande"></span></div>

    <template v-else-if="data">
      <div class="stats-grid">
        <div v-for="c in resumenCards" :key="c.label" class="stat-card">
          <span class="stat-valor" :style="{ color: c.color }">{{ c.value }}</span>
          <span class="stat-label">{{ c.label }}</span>
        </div>
      </div>

      <div class="graficas-grid">
        <div class="tarjeta grafica-card">
          <h3>Tendencia de Asistencia</h3>
          <div class="grafica-wrap"><Line :data="chartAsistencia.data" :options="chartAsistencia.options" /></div>
        </div>

        <div class="tarjeta grafica-card">
          <h3>Estado de Justificantes</h3>
          <div class="grafica-wrap grafica-donut"><Doughnut :data="chartJustificantes.data" :options="chartJustificantes.options" /></div>
        </div>

        <div class="tarjeta grafica-card">
          <h3>Contenido por Materia</h3>
          <div class="grafica-wrap"><Bar :data="chartContenidosMateria.data" :options="chartContenidosMateria.options" /></div>
        </div>

        <div class="tarjeta grafica-card" v-if="esAdmin">
          <h3>Matrículas activas por Grado</h3>
          <div class="grafica-wrap"><Bar :data="chartMatriculasGrado.data" :options="chartMatriculasGrado.options" /></div>
        </div>

        <div class="tarjeta grafica-card" :class="{ 'grafica-ancha': !esAdmin }">
          <h3>Top ausencias por Estudiante</h3>
          <div class="grafica-wrap"><Bar :data="chartAusenciasTop.data" :options="chartAusenciasTop.options" /></div>
        </div>
      </div>

      <div class="tarjeta">
        <h3 class="tabla-titulo">Detalle de ausencias</h3>
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Ausencias</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in data.estudiantesAusenciasTop" :key="item.estudiante">
                <td>{{ item.estudiante }}</td>
                <td>{{ item.ausencias }}</td>
              </tr>
              <tr v-if="!data.estudiantesAusenciasTop?.length">
                <td colspan="2" class="tabla-vacio">Sin ausencias en el rango seleccionado</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cabecera-reportes {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.acciones-cabecera {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filtros-card {
  margin-bottom: 16px;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(160px, 1fr));
  gap: 10px;
}

.filtros-btn {
  display: flex;
  align-items: end;
}

.info-grado {
  margin-top: 10px;
  font-size: 0.875rem;
  color: var(--gris-600);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.stat-card {
  background: white;
  border: 1px solid var(--gris-200);
  border-radius: var(--radio);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-valor {
  font-size: 1.55rem;
  font-weight: 800;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--gris-500);
}

.graficas-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.grafica-card {
  padding: 14px;
}

.grafica-card h3 {
  font-size: 0.92rem;
  margin-bottom: 10px;
  color: var(--gris-800);
}

.grafica-wrap {
  height: 300px;
}

.grafica-donut {
  max-height: 300px;
}

.grafica-ancha {
  grid-column: 1 / -1;
}

.tabla-titulo {
  margin: 2px 0 10px;
  font-size: 0.94rem;
  color: var(--gris-800);
}

.tabla-vacio {
  text-align: center;
  color: var(--gris-500);
  padding: 16px;
}

@media (max-width: 960px) {
  .graficas-grid {
    grid-template-columns: 1fr;
  }

  .filtros-grid {
    grid-template-columns: 1fr;
  }
}
</style>
