<script setup lang="ts">
defineProps<{
  title: string;
  expanded: boolean;
}>();

defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <div class="nav-group" :class="{ expanded }">
    <button class="nav-group-header" type="button" @click="$emit('toggle')">
      <span class="nav-group-title">{{ title }}</span>
      <span class="nav-group-toggle">▼</span>
    </button>
    <div class="nav-group-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.nav-group {
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
}

.nav-group-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border: 0;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: var(--font-md);
  font-weight: 600;
  padding: var(--space-inner) var(--space-gap);
  text-align: left;
}

.nav-group-header:hover {
  background: var(--bg-primary);
}

.nav-group-toggle {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  transition: transform 0.3s ease;
}

.nav-group.expanded .nav-group-toggle {
  transform: rotate(180deg);
}

.nav-group-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.nav-group.expanded .nav-group-content {
  max-height: 500px;
}
</style>
