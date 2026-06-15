<script setup lang="ts">
import { computed } from 'vue';
import { usesAutoCountdown } from '../../constants/gameFlow';
import type { Country } from '../../types/country';
import type { AnswerResult, GamePhase } from '../../types/game';
import QuizResultAdvance from './QuizResultAdvance.vue';

const props = defineProps<{
  question: Country | null;
  options: Country[];
  phase: GamePhase;
  result: AnswerResult | null;
}>();

defineEmits<{
  answer: [option: Country];
  next: [];
}>();

function optionClass(option: Country): string {
  if (props.phase !== 'result' || !props.result) return '';

  const correct = props.result.correctAnswer as Country;
  const selected = props.result.selectedAnswer as Country;

  if (option.name === correct.name) return 'correct-answer';
  if (option.name === selected.name) return 'incorrect-answer';
  return 'other-answer';
}

const isResultPhase = computed(() => props.phase === 'result');
</script>

<template>
  <div class="quiz-image-options-screen">
    <main class="quiz-image-options-screen__main">
      <h2 class="quiz-image-options-screen__prompt">{{ question?.name || 'Какая страна?' }}</h2>

      <QuizResultAdvance
        v-if="phase === 'result'"
        :key="question?.name"
        :active="phase === 'result'"
        :auto-countdown="usesAutoCountdown('flags')"
        @next="$emit('next')"
      />

      <div class="quiz-image-options-screen__grid">
        <button
          v-for="option in options"
          :key="option.name"
          class="quiz-image-options-screen__option"
          :class="[optionClass(option), { 'quiz-image-options-screen__option--result': isResultPhase }]"
          type="button"
          :disabled="isResultPhase"
          @click="$emit('answer', option)"
        >
          <img
            class="quiz-image-options-screen__image"
            :src="option.flag_url"
            :alt="`Вариант: ${option.name}`"
          />
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.quiz-image-options-screen {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  flex-direction: column;
  gap: var(--space-gap);
  min-height: 0;
  overflow: hidden;
  padding: 0 var(--space-block) var(--space-block);
}

.quiz-image-options-screen__main {
  display: flex;
  width: 100%;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-gap);
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  text-align: center;
}

.quiz-image-options-screen__prompt {
  width: auto;
  max-width: calc(100vw - 20px);
  margin-inline: auto;
  color: var(--text-primary);
  font-size: var(--font-lg);
  text-align: center;
  text-shadow: 0 2px 4px var(--shadow);
}

.quiz-image-options-screen__grid {
  display: grid;
  width: min(100%, 760px);
  margin-inline: auto;
  grid-template-columns: repeat(2, minmax(130px, 1fr));
  gap: var(--space-gap);
}

.quiz-image-options-screen__option {
  display: flex;
  min-height: 140px;
  align-items: center;
  justify-content: center;
  border: 4px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  cursor: pointer;
  padding: var(--space-inner);
}

.quiz-image-options-screen__option:hover:not(:disabled):not(.quiz-image-options-screen__option--result) {
  border-color: var(--accent);
  box-shadow: 0 6px 20px var(--shadow);
}

.quiz-image-options-screen__option--result:disabled {
  cursor: default;
  pointer-events: none;
}

.quiz-image-options-screen__image {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
}

.quiz-image-options-screen__option.correct-answer {
  border-color: var(--accent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 55%, transparent);
}

.quiz-image-options-screen__option.incorrect-answer {
  border-color: var(--color-flag-wrong);
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.5);
}

.quiz-image-options-screen__option.other-answer {
  border-color: var(--color-flag-muted);
  box-shadow: 0 0 10px rgba(158, 158, 158, 0.3);
  opacity: 0.6;
}

.quiz-image-options-screen__option.correct-answer:hover:not(:disabled),
.quiz-image-options-screen__option.correct-answer:disabled {
  border-color: var(--accent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 55%, transparent);
}

.quiz-image-options-screen__option.incorrect-answer:hover:not(:disabled),
.quiz-image-options-screen__option.incorrect-answer:disabled {
  border-color: var(--color-flag-wrong);
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.5);
}

.quiz-image-options-screen__option.other-answer:hover:not(:disabled),
.quiz-image-options-screen__option.other-answer:disabled {
  border-color: var(--color-flag-muted);
  box-shadow: 0 0 10px rgba(158, 158, 158, 0.3);
  opacity: 0.6;
}

@media (max-width: 640px) {
  .quiz-image-options-screen {
    padding: 0 10px var(--space-gap);
  }

  .quiz-image-options-screen__main {
    justify-content: flex-start;
    padding-top: 4px;
  }

  .quiz-image-options-screen__grid {
    width: 100%;
    gap: 8px;
  }

  .quiz-image-options-screen__option {
    min-height: 96px;
    padding: 8px;
  }

  .quiz-image-options-screen__image {
    max-height: 80px;
  }
}
</style>
