<script setup lang="ts">
import BouncingEmojis from './BouncingEmojis.vue';
import FloatingShapes from './FloatingShapes.vue';
</script>

<template>
  <div class="welcome-backdrop">
    <FloatingShapes />
    <BouncingEmojis />
  </div>
</template>

<style scoped>
.welcome-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}
</style>
