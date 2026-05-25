<script setup lang="ts">
import type { RegionName } from '../../types/country';

const regions: Array<{ id: RegionName; label: string }> = [
  { id: 'Европа', label: '🇪🇺 Европа' },
  { id: 'Азия', label: '🌏 Азия' },
  { id: 'Африка', label: '🌍 Африка' },
  { id: 'Северная Америка', label: '🇺🇸 Северная Америка' },
  { id: 'Южная Америка', label: '🇧🇷 Южная Америка' },
  { id: 'Океания', label: '🌊 Океания' },
];

defineEmits<{
  select: [region: RegionName];
}>();
</script>

<template>
  <div class="game-screen">
    <main class="game-main">
      <section class="region-selection">
        <h3>🌍 Выберите регион</h3>
        <div class="region-buttons">
          <button
            v-for="region in regions"
            :key="region.id"
            class="region-btn"
            type="button"
            @click="$emit('select', region.id)"
          >
            {{ region.label }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.game-screen {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-block);
  padding: 0 var(--space-block) var(--space-block);
}

.game-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-block);
  text-align: center;
}

.region-selection {
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

.region-selection h3 {
  margin-bottom: var(--space-inner);
  font-size: var(--font-lg);
}

.region-buttons {
  display: grid;
  width: 100%;
  gap: var(--space-gap);
}

.region-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
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

.region-btn:hover {
  background: var(--bg-tertiary);
  box-shadow: 0 6px 20px var(--shadow);
}

@media (max-width: 640px) {
  .game-screen {
    padding: var(--space-gap);
  }
}
</style>
