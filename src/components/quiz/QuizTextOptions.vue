<script setup lang="ts">
import { computed } from 'vue';
import type { Country } from '../../types/country';
import type { AnswerResult, GameModeId, GamePhase } from '../../types/game';

const props = defineProps<{
  options: Array<Country | string>;
  mode: GameModeId;
  phase: GamePhase;
  result: AnswerResult | null;
  answersVisible: boolean;
}>();

const emit = defineEmits<{
  answer: [option: Country | string];
}>();

function optionLabel(option: Country | string): string {
  return typeof option === 'string' ? option : option.name;
}

function optionKey(option: Country | string): string {
  return optionLabel(option);
}

function resultKey(value: Country | string | null | undefined): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value.name;
}

function resultClass(option: Country | string): string {
  if (props.phase !== 'result' || !props.result) return '';

  const key = optionKey(option);
  const correct = resultKey(props.result.correctAnswer);
  const selected = resultKey(props.result.selectedAnswer);

  if (key === correct) return 'correct-answer';
  if (key === selected) return 'incorrect-answer';
  return 'other-answer';
}

function buttonLabel(option: Country | string): string {
  if (props.answersVisible || props.phase !== 'question' || props.mode === 'time') {
    return optionLabel(option);
  }

  return '???';
}

const answersLocked = computed(
  () => props.phase === 'question' && !props.answersVisible && props.mode !== 'time'
);

const isResultPhase = computed(() => props.phase === 'result');
const isDisabled = computed(() => answersLocked.value || isResultPhase.value);
</script>

<template>
  <div class="quiz-text-options">
    <button
      v-for="option in options"
      :key="optionKey(option)"
      class="quiz-text-options__btn"
      :class="[
        resultClass(option),
        {
          'quiz-text-options__btn--hidden': answersLocked,
          'quiz-text-options__btn--result': isResultPhase,
        },
      ]"
      type="button"
      :disabled="isDisabled"
      @click="emit('answer', option)"
    >
      {{ buttonLabel(option) }}
    </button>
  </div>
</template>

<style scoped>
.quiz-text-options {
  display: grid;
  width: 100%;
  max-width: 720px;
  margin-inline: auto;
  gap: var(--space-gap);
  box-sizing: border-box;
}

.quiz-text-options__btn {
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
  line-height: 1.2;
  padding: var(--space-inner) 12px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.quiz-text-options__btn:hover:not(:disabled):not(.quiz-text-options__btn--result) {
  background: var(--bg-tertiary);
  box-shadow: 0 6px 20px var(--shadow);
}

.quiz-text-options__btn--hidden:disabled,
.quiz-text-options__btn--result:disabled {
  cursor: default;
  opacity: 1;
  pointer-events: none;
}

.quiz-text-options__btn.correct-answer {
  border-color: var(--color-answer-correct-strong);
  background: linear-gradient(135deg, var(--color-answer-correct), #22c55e);
  color: #ffffff;
}

.quiz-text-options__btn.incorrect-answer {
  border-color: var(--color-answer-wrong-strong);
  background: linear-gradient(135deg, var(--color-answer-wrong), #ef4444);
  color: #ffffff;
}

.quiz-text-options__btn.other-answer {
  border-color: var(--color-answer-muted-strong);
  background: linear-gradient(135deg, var(--color-answer-muted), #6b7280);
  color: #ffffff;
  opacity: 0.65;
}

.quiz-text-options__btn.correct-answer:hover:not(:disabled),
.quiz-text-options__btn.correct-answer:disabled {
  background: linear-gradient(135deg, var(--color-answer-correct), #22c55e);
  border-color: var(--color-answer-correct-strong);
  box-shadow: none;
}

.quiz-text-options__btn.incorrect-answer:hover:not(:disabled),
.quiz-text-options__btn.incorrect-answer:disabled {
  background: linear-gradient(135deg, var(--color-answer-wrong), #ef4444);
  border-color: var(--color-answer-wrong-strong);
  box-shadow: none;
}

.quiz-text-options__btn.other-answer:hover:not(:disabled),
.quiz-text-options__btn.other-answer:disabled {
  background: linear-gradient(135deg, var(--color-answer-muted), #6b7280);
  border-color: var(--color-answer-muted-strong);
  opacity: 0.65;
  box-shadow: none;
}

@media (max-width: 640px) {
  .quiz-text-options {
    width: 100%;
    max-width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding: 0;
  }

  .quiz-text-options__btn {
    min-height: 48px;
    padding: 10px 8px;
    font-size: var(--font-sm);
  }
}
</style>
