<script setup lang="ts">
import type { GameStats } from '../../types/game';

const props = defineProps<{
  stats: GameStats;
}>();

defineEmits<{
  close: [];
  playAgain: [];
}>();

function modeTitle(): string {
  const titles = {
    classic: '📚 Классический режим',
    time: '⏰ Режим "На время"',
    survival: '❤️ Режим "На выживание"',
    flags: '🏳️ Режим "4 Флага"',
    region: `🌍 Режим "Регионы"${props.stats.selectedRegion ? ` (${props.stats.selectedRegion})` : ''}`,
    learning: '📖 Режим обучения',
    capital: '🏛️ Режим "Столицы"',
  };

  return titles[props.stats.mode];
}

async function share(): Promise<void> {
  const siteUrl = 'https://chatup.su/';
  const text = `${modeTitle()}: ${props.stats.score.correct} правильных ответов. Точность: ${props.stats.percentage}%\n\nИграй в "Флаги стран": ${siteUrl}`;

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}
</script>

<template>
  <div class="results-modal" role="dialog" aria-modal="true">
    <div class="modal-content">
      <div class="modal-header">
        <h2>🎉 Игра завершена!</h2>
        <button class="modal-close" type="button" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div class="results-stats">
          <div class="stat-item">
            <span class="stat-label">Режим:</span>
            <span class="stat-value">{{ modeTitle() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">✅ Правильных ответов:</span>
            <span class="stat-value">
              {{ stats.score.correct }}<template v-if="stats.totalCountries">/{{ stats.totalCountries }}</template>
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">❌ Неправильных ответов:</span>
            <span class="stat-value">{{ stats.score.incorrect }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">📊 Точность:</span>
            <span class="stat-value">{{ stats.percentage }}%</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="share-btn" type="button" @click="share">📤 Поделиться результатом</button>
        <button class="play-again-btn" type="button" @click="$emit('playAgain')">🔄 Играть снова</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--shadow);
  padding: var(--space-block);
}

.modal-content {
  width: min(92vw, 520px);
  max-height: 90vh;
  overflow: auto;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  box-shadow: 0 20px 60px var(--shadow);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-gap);
  padding: var(--space-block);
}

.modal-header {
  border-bottom: 1px solid var(--border-color);
}

.modal-body {
  padding: var(--space-block);
}

.modal-close {
  border: 0;
  background: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: var(--font-lg);
}

.results-stats {
  display: grid;
  gap: var(--space-inner);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-gap);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  padding: var(--space-inner);
}

.share-btn,
.play-again-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  color: #ffffff;
  cursor: pointer;
  font-size: var(--font-md);
  font-weight: 600;
  padding: var(--space-inner) var(--space-gap);
}

.share-btn {
  background: var(--gradient-accent);
}

.play-again-btn {
  background: var(--gradient-info);
}

.share-btn:hover,
.play-again-btn:hover {
  box-shadow: 0 6px 20px var(--shadow);
}
</style>
