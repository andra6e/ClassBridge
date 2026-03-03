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
  background: linear-gradient(135deg, var(--primario) 0%, #7c3aed 100%);
}

.layout-app {
  display: flex;
  min-height: 100vh;
}

.layout-contenido {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
}

.layout-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
