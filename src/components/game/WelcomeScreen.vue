<script setup lang="ts">
import WelcomeBackdrop from '../decor/WelcomeBackdrop.vue';
</script>

<template>
  <div class="welcome-screen">
    <WelcomeBackdrop />

    <main class="welcome-screen__main">
      <section class="welcome-panel">
        <h1 class="welcome-title">Флаги стран</h1>
        <p class="welcome-text">
          Квиз для тех, кто любит узнавать новое. Выберите режим в меню слева и начинайте играть.
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.welcome-screen {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.welcome-screen__main {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-block);
  text-align: center;
}

.welcome-panel {
  width: 100%;
  max-width: 720px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--bg-secondary) 88%, transparent);
  padding: var(--space-block);
  backdrop-filter: blur(12px);
  animation: panel-glow 5s ease-in-out infinite;
}

.welcome-title {
  margin-bottom: var(--space-inner);
  font-size: var(--font-lg);
}

.welcome-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-md);
  line-height: 1.5;
}

@keyframes panel-glow {
  0%,
  100% {
    box-shadow: 0 8px 24px var(--shadow);
  }
  50% {
    box-shadow:
      0 12px 32px var(--shadow),
      0 0 24px color-mix(in srgb, var(--accent) 25%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .welcome-panel {
    animation: none;
  }
}

@media (max-width: 640px) {
  .welcome-screen__main {
    padding: var(--space-gap);
  }
}
</style>
