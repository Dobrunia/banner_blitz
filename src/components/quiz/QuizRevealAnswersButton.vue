<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  disabled: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

function toggle(): void {
  if (props.disabled) return;
  emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <div class="quiz-reveal-answers">
    <button
      class="quiz-reveal-answers__btn"
      type="button"
      :disabled="disabled"
      :title="modelValue ? 'Скрыть ответы' : 'Показать ответы'"
      @click="toggle"
    >
      {{ modelValue ? '🙈' : '👁️' }}
    </button>
  </div>
</template>

<style scoped>
.quiz-reveal-answers {
  display: flex;
  justify-content: center;
  margin-top: var(--space-gap);
}

.quiz-reveal-answers__btn {
  width: 54px;
  height: 54px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-round);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: var(--font-md);
  backdrop-filter: blur(10px);
}

.quiz-reveal-answers__btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--accent);
}

.quiz-reveal-answers__btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 640px) {
  .quiz-reveal-answers {
    margin-top: 4px;
  }

  .quiz-reveal-answers__btn {
    width: 48px;
    height: 48px;
  }
}
</style>
