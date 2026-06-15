<script setup lang="ts">
defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <button class="burger-btn" type="button" :aria-expanded="isOpen" @click="$emit('toggle')">☰</button>
</template>

<style scoped>
.burger-btn {
  position: fixed;
  top: var(--space-block);
  left: var(--space-block);
  z-index: var(--z-burger);
  width: 50px;
  height: 50px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-round);
  background: var(--bg-secondary);
  color: var(--text-primary);
  box-shadow: 0 4px 12px var(--shadow);
  cursor: pointer;
  font-size: var(--font-md);
  backdrop-filter: blur(10px);
}

.burger-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent);
}

@media (max-width: 640px) {
  .burger-btn {
    top: var(--safe-top);
    left: max(8px, env(safe-area-inset-left, 0px));
    width: 44px;
    height: 44px;
  }
}
</style>
