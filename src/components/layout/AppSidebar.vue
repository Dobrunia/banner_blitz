<script setup lang="ts">
import NavGroup from './NavGroup.vue';
import { ART_MODE_IDS, ART_MODE_LABELS, GEOGRAPHY_MODE_IDS, GEOGRAPHY_MODE_LABELS } from '../../constants/gameModes';
import type { GameModeId } from '../../types/game';
import type { ThemeName } from '../../composables/useTheme';

const geographyModes = GEOGRAPHY_MODE_IDS.map((id) => ({
  id,
  label: GEOGRAPHY_MODE_LABELS[id],
}));

const artModes = ART_MODE_IDS.map((id) => ({
  id,
  label: ART_MODE_LABELS[id],
}));

defineProps<{
  isOpen: boolean;
  currentMode: GameModeId | null;
  theme: ThemeName;
  geographyExpanded: boolean;
  artExpanded: boolean;
}>();

defineEmits<{
  toggleTheme: [];
  toggleGeography: [];
  toggleArt: [];
  switchMode: [mode: GameModeId];
  resetAll: [];
}>();
</script>

<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-content">
      <nav class="sidebar-nav" aria-label="Режимы игры">
        <button class="nav-item theme-toggle-btn" type="button" @click="$emit('toggleTheme')">
          {{ theme === 'dark' ? '☀️ Светлая тема' : '🌙 Темная тема' }}
        </button>

        <div class="nav-divider" />

        <NavGroup title="🌍 География" :expanded="geographyExpanded" @toggle="$emit('toggleGeography')">
          <button
            v-for="mode in geographyModes"
            :key="mode.id"
            class="nav-item"
            :class="{ active: currentMode === mode.id }"
            type="button"
            @click="$emit('switchMode', mode.id)"
          >
            {{ mode.label }}
          </button>
        </NavGroup>

        <NavGroup title="🎨 Искусство" :expanded="artExpanded" @toggle="$emit('toggleArt')">
          <button
            v-for="mode in artModes"
            :key="mode.id"
            class="nav-item"
            :class="{ active: currentMode === mode.id }"
            type="button"
            @click="$emit('switchMode', mode.id)"
          >
            {{ mode.label }}
          </button>
        </NavGroup>

        <div class="nav-divider" />

        <button class="nav-item reset-menu-btn" type="button" @click="$emit('resetAll')">
          🔄 Начать сначала
        </button>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: -300px;
  z-index: var(--z-sidebar);
  width: 300px;
  height: 100vh;
  background: var(--bg-secondary);
  box-shadow: 2px 0 20px var(--shadow);
  transition: transform 0.3s ease;
  backdrop-filter: blur(20px);
}

.sidebar.open {
  transform: translateX(300px);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 80px var(--space-block) var(--space-block);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-gap);
}

.nav-item {
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: var(--font-md);
  padding: var(--space-inner) var(--space-block);
  text-align: left;
}

.nav-item:hover {
  background: var(--bg-tertiary);
}

.nav-item.active {
  background: var(--gradient-app);
  box-shadow: 0 4px 12px var(--shadow);
  color: #ffffff;
  font-weight: 700;
}

.nav-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--space-inner) 0;
}

:deep(.nav-group-content .nav-item) {
  display: block;
  width: 100%;
  border-left: 3px solid transparent;
  border-radius: 0;
  background: transparent;
  font-size: var(--font-md);
  padding: var(--space-inner) var(--space-block) var(--space-inner) 32px;
}

:deep(.nav-group-content .nav-item:hover) {
  background: var(--bg-tertiary);
  border-left-color: var(--accent);
}

:deep(.nav-group-content .nav-item.active) {
  background: var(--bg-tertiary);
  border-left: 4px solid var(--accent);
  box-shadow:
    inset 0 0 0 1px var(--accent),
    0 0 12px color-mix(in srgb, var(--accent) 35%, transparent);
  color: var(--text-primary);
  font-weight: 700;
}

@media (max-width: 640px) {
  .sidebar {
    left: -82vw;
    width: 82vw;
  }

  .sidebar.open {
    transform: translateX(82vw);
  }
}
</style>
