<script setup>
const secciones = [
  { titulo: 'Maestros', descripcion: 'Crear y gestionar maestros', ruta: '/admin/maestros', color: '#4f46e5' },
  { titulo: 'Grupos', descripcion: 'Crear grupos y asignar maestros', ruta: '/admin/grupos', color: '#0891b2' },
  { titulo: 'Estudiantes', descripcion: 'Registrar y buscar estudiantes', ruta: '/admin/estudiantes', color: '#16a34a' },
  { titulo: 'Matriculas', descripcion: 'Inscribir y retirar estudiantes de grupos', ruta: '/admin/matriculas', color: '#f59e0b' },
]
</script>

<template>
  <div class="contenedor-pagina">
    <h1 class="titulo-pagina">Administracion</h1>
    <div class="admin-grid">
      <router-link v-for="s in secciones" :key="s.ruta" :to="s.ruta" class="admin-tarjeta">
        <div class="admin-barra" :style="{ background: s.color }"></div>
        <div class="admin-cuerpo">
          <h3>{{ s.titulo }}</h3>
          <p>{{ s.descripcion }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
.admin-tarjeta { background: white; border-radius: var(--radio); box-shadow: var(--sombra); overflow: hidden; text-decoration: none; color: inherit; transition: transform 0.15s, box-shadow 0.15s; }
.admin-tarjeta:hover { transform: translateY(-2px); box-shadow: var(--sombra-md); }
.admin-barra { height: 4px; }
.admin-cuerpo { padding: 20px; }
.admin-cuerpo h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 4px; }
.admin-cuerpo p { color: var(--gris-500); font-size: 0.85rem; }
</style>
