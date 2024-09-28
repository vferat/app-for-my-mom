<script setup>
import HelloWorld from './components/Game.vue'
import Game from './components/Game.vue'
</script>

<template>
  <div class="container flex">
    <div class="row">
      <Game/>
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
