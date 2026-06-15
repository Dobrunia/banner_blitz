<script setup lang="ts">
defineEmits<{
  begin: [];
}>();
</script>

<template>
  <div class="game-screen ready-screen">
    <main class="game-main">
      <div class="start-container">
        <div class="game-rules">
          <h3>⏰ Режим "На время"</h3>
          <p>• Угадайте как можно больше флагов за 30 секунд</p>
          <p>• За неправильный ответ отнимается 2 секунды</p>
        </div>
        <button class="start-btn" type="button" @click="$emit('begin')">🚀 Начать игру</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.game-screen {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-block);
  min-height: 0;
  overflow: hidden;
  padding: 0 var(--space-block) var(--space-block);
}

.game-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-block);
  width: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  text-align: center;
}

.start-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-gap);
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  padding: var(--space-block);
  backdrop-filter: blur(10px);
}

.game-rules {
  width: 100%;
  text-align: center;
}

.game-rules h3 {
  margin-bottom: var(--space-inner);
  font-size: var(--font-lg);
}

.game-rules p {
  margin: var(--space-inner) 0;
  color: var(--text-secondary);
  font-size: var(--font-md);
}

.start-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 220px;
  min-height: 52px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--gradient-accent);
  color: #ffffff;
  cursor: pointer;
  font-size: var(--font-md);
  font-weight: 600;
  padding: var(--space-inner) var(--space-gap);
}

.start-btn:hover {
  box-shadow: 0 6px 20px var(--shadow);
}

@media (max-width: 640px) {
  .game-screen {
    padding: var(--space-gap);
  }

  .game-main {
    justify-content: flex-start;
    padding-top: 8px;
  }
}
</style>
