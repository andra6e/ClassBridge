<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SideBar from './components/layout/SideBar.vue'
import TopBar from './components/layout/TopBar.vue'

const route = useRoute()
const esLogin = computed(() => route.name === 'login')
</script>

<template>
  <div v-if="esLogin" class="layout-login">
    <router-view />
  </div>

  <div v-else class="layout-app">
    <SideBar />
    <div class="layout-contenido">
      <TopBar />
      <main class="layout-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gris-50);
}

.layout-app {
  display: flex;
  min-height: 100vh;
  background: var(--gris-50);
}

.layout-contenido {
  flex: 1;
  margin-left: var(--sidebar-ancho);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-main {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
}
</style>
