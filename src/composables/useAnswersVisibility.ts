import { ref, watch, type Ref } from 'vue';
import type { GamePhase } from '../types/game';

export function useAnswersVisibility(phase: Ref<GamePhase>, showAnswerToggle: Ref<boolean>) {
  const answersVisible = ref(false);

  watch(
    [phase, showAnswerToggle],
    ([currentPhase, hasToggle]) => {
      if (currentPhase === 'question') {
        answersVisible.value = !hasToggle;
      }
      if (currentPhase === 'result') {
        answersVisible.value = true;
      }
    },
    { immediate: true }
  );

  return { answersVisible };
}
