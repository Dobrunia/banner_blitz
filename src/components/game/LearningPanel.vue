<script setup lang="ts">
import type { Country } from '../../types/country';

defineProps<{
  country: Country | null;
}>();

defineEmits<{
  next: [];
}>();
</script>

<template>
  <section class="learning-info">
    <div v-if="country" class="country-info">
      <div v-if="country.capital" class="info-item">🏛️ {{ country.capital }}</div>
      <div v-if="country.language" class="info-item">🗣️ {{ country.language }}</div>
      <div v-if="country.population" class="info-item">👥 {{ country.population }}</div>
      <div v-if="country.region" class="info-item">🌍 {{ country.region }}</div>
    </div>
    <button class="next-btn" type="button" @click="$emit('next')">➡️ Следующая страна</button>
  </section>
</template>

<style scoped>
.learning-info {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  padding: var(--space-block);
  text-align: center;
  backdrop-filter: blur(10px);
}

.country-info {
  display: grid;
  gap: var(--space-inner);
}

.info-item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-gap);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  padding: var(--space-inner);
}

.next-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 52px;
  margin-top: var(--space-block);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: var(--font-md);
  font-weight: 600;
  padding: var(--space-inner) var(--space-gap);
  backdrop-filter: blur(10px);
}

.next-btn:hover {
  background: var(--bg-tertiary);
  box-shadow: 0 6px 20px var(--shadow);
}

@media (max-width: 640px) {
  .learning-info {
    padding: var(--space-gap);
  }

  .info-item {
    font-size: var(--font-md);
  }

  .next-btn {
    min-height: 48px;
  }
}
</style>
