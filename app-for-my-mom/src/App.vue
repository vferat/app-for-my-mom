<script setup>
import HelloWorld from './components/Game.vue'
import Game from './components/Game.vue'
</script>

<template>
  <div class="container">
    <div class="row">
      <h1>App for my mom</h1>
    </div>

    <div class="row">
      <Game msg="Hello Vue 3 + Vite" />
    </div>

  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
