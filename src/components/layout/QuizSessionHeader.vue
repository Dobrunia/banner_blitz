<script setup lang="ts">
defineProps<{
  modeLabel: string | null;
  scoreText?: string;
}>();
</script>

<template>
  <header v-if="modeLabel || scoreText" class="quiz-session-header">
    <div class="quiz-session-header__inner">
      <p v-if="modeLabel" class="quiz-session-header__mode">{{ modeLabel }}</p>
      <p v-if="scoreText" class="quiz-session-header__score">{{ scoreText }}</p>
    </div>
  </header>
</template>

<style scoped>
.quiz-session-header {
  padding: var(--space-gap) var(--space-block);
  padding-left: 72px;
  box-sizing: border-box;
}

.quiz-session-header__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--space-gap);
  width: 100%;
}

.quiz-session-header__mode {
  grid-column: 2;
  justify-self: center;
  max-width: min(72vw, 520px);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  box-shadow: 0 4px 12px var(--shadow);
  color: var(--text-primary);
  font-size: var(--font-md);
  font-weight: 700;
  padding: var(--space-inner) 12px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.quiz-session-header__score {
  grid-column: 3;
  justify-self: end;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  box-shadow: 0 4px 12px var(--shadow);
  color: var(--text-primary);
  font-size: var(--font-md);
  font-weight: 700;
  padding: var(--space-inner) 12px;
  white-space: nowrap;
  backdrop-filter: blur(10px);
}

@media (max-width: 640px) {
  .quiz-session-header {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    padding: 6px 10px;
    padding-left: 48px;
  }

  .quiz-session-header__inner {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    width: auto;
    max-width: 100%;
  }

  .quiz-session-header__mode,
  .quiz-session-header__score {
    width: max-content;
    max-width: calc(100vw - 58px);
    border-width: 1px;
    box-shadow: 0 2px 6px var(--shadow);
    font-size: var(--font-sm);
    font-weight: 600;
    padding: 6px 10px;
    text-align: center;
    white-space: nowrap;
  }
}
</style>
