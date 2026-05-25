<script setup lang="ts">
import { computed } from 'vue';
import type { Country } from '../../types/country';
import type { AnswerResult, GameModeId, GamePhase, GameStats } from '../../types/game';
import type { QuizMedia } from '../../types/quiz-ui';
import LearningPanel from '../game/LearningPanel.vue';
import LivesIndicator from '../game/LivesIndicator.vue';
import QuizAnswerFooter from './QuizAnswerFooter.vue';
import QuizMediaDisplay from './QuizMediaDisplay.vue';

const props = defineProps<{
  mode: GameModeId;
  phase: GamePhase;
  question: Country | null;
  questionMedia: QuizMedia | null;
  questionPrompt: string;
  questionKey: string | null;
  options: Array<Country | string>;
  result: AnswerResult | null;
  stats: GameStats;
}>();

defineEmits<{
  answer: [option: Country | string];
  next: [];
}>();

const isPaused = computed(() => props.mode === 'time' && props.phase === 'result');
const isArtMode = computed(() => props.mode === 'art-guess-artist');
</script>

<template>
  <div
    class="quiz-question-screen"
    :class="{
      'quiz-question-screen--paused': isPaused,
      'quiz-question-screen--learning': mode === 'learning',
      'quiz-question-screen--art': isArtMode,
    }"
  >
    <main class="quiz-question-screen__main">
      <div class="quiz-question-screen__content">
        <div v-if="mode === 'survival'" class="quiz-question-screen__lives">
          <LivesIndicator :lives="stats.lives ?? 3" :max-lives="stats.maxLives ?? 3" />
        </div>

        <div class="quiz-question-screen__media">
          <QuizMediaDisplay :media="questionMedia" />
        </div>

        <h2 class="quiz-question-screen__prompt">{{ questionPrompt }}</h2>
      </div>
    </main>

    <footer class="quiz-question-screen__footer">
      <LearningPanel v-if="mode === 'learning'" :country="question" @next="$emit('next')" />

      <QuizAnswerFooter
        v-else
        :mode="mode"
        :phase="phase"
        :options="options"
        :result="result"
        :question-key="questionKey"
        @answer="$emit('answer', $event)"
        @next="$emit('next')"
      />
    </footer>
  </div>
</template>

<style scoped>
.quiz-question-screen {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  flex-direction: column;
  gap: var(--space-block);
  padding: 0 var(--space-block) var(--space-block);
}

.quiz-question-screen__main {
  display: flex;
  width: 100%;
  flex: 1;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.quiz-question-screen__content {
  display: flex;
  width: 100%;
  max-width: 100%;
  flex-direction: column;
  align-items: center;
  margin-inline: auto;
  transition: opacity 0.2s ease, filter 0.2s ease;
}

.quiz-question-screen--paused .quiz-question-screen__content {
  opacity: 0.5;
  filter: saturate(0.6);
}

.quiz-question-screen__main {
  justify-content: center;
}

.quiz-question-screen__lives {
  flex-shrink: 0;
  min-height: 2.5rem;
  margin-bottom: var(--space-gap);
}

.quiz-question-screen__media {
  display: flex;
  flex-shrink: 0;
  width: min(78vw, 360px);
  height: 220px;
  align-items: center;
  justify-content: center;
  margin-inline: auto;
}

.quiz-question-screen__prompt {
  flex-shrink: 0;
  width: auto;
  max-width: min(92vw, 520px);
  min-height: 2.75em;
  margin-top: var(--space-gap);
  margin-inline: auto;
  color: var(--text-primary);
  font-size: var(--font-lg);
  line-height: 1.35;
  text-align: center;
  text-shadow: 0 2px 4px var(--shadow);
}

.quiz-question-screen__footer {
  display: flex;
  width: 100%;
  justify-content: center;
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .quiz-question-screen {
    padding-inline: 10px;
    padding-bottom: 10px;
  }

  .quiz-question-screen__main {
    align-items: center;
    padding-top: var(--space-gap);
  }

  .quiz-question-screen__content {
    align-items: center;
  }

  .quiz-question-screen__prompt {
    width: auto;
    max-width: calc(100vw - 20px);
    font-size: var(--font-md);
    min-height: 2.5em;
    text-align: center;
  }

  .quiz-question-screen__media {
    width: min(calc(100vw - 20px), 320px);
    height: 180px;
    margin-inline: auto;
  }
}

.quiz-question-screen--art .quiz-question-screen__media {
  width: min(88vw, 420px);
  height: min(52vw, 280px);
}
</style>
