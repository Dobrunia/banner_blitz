<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useAnswersVisibility } from '../../composables/useAnswersVisibility';
import { usesAnswerToggle, usesAutoCountdown } from '../../constants/gameFlow';
import type { Country } from '../../types/country';
import type { AnswerResult, GameModeId, GamePhase } from '../../types/game';
import QuizResultAdvance from './QuizResultAdvance.vue';
import QuizRevealAnswersButton from './QuizRevealAnswersButton.vue';
import QuizTextOptions from './QuizTextOptions.vue';

const props = defineProps<{
  mode: GameModeId;
  phase: GamePhase;
  options: Array<Country | string>;
  result: AnswerResult | null;
  questionKey?: string | null;
}>();

defineEmits<{
  answer: [option: Country | string];
  next: [];
}>();

const { phase, mode } = toRefs(props);
const showAnswerToggle = computed(() => usesAnswerToggle(mode.value));
const autoCountdown = computed(() => usesAutoCountdown(mode.value));

const { answersVisible } = useAnswersVisibility(phase, showAnswerToggle);
</script>

<template>
  <div class="quiz-answer-footer">
    <QuizTextOptions
      :options="options"
      :mode="mode"
      :phase="phase"
      :result="result"
      :answers-visible="answersVisible"
      @answer="$emit('answer', $event)"
    />

    <QuizResultAdvance
      v-if="phase === 'result'"
      :key="questionKey ?? undefined"
      :active="phase === 'result'"
      :auto-countdown="autoCountdown"
      @next="$emit('next')"
    />

    <QuizRevealAnswersButton
      v-if="showAnswerToggle"
      v-model="answersVisible"
      :disabled="phase === 'result'"
    />
  </div>
</template>

<style scoped>
.quiz-answer-footer {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}
</style>
