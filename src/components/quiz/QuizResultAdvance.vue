<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  active: boolean;
  autoCountdown: boolean;
}>();

const emit = defineEmits<{
  next: [];
}>();

const COUNTDOWN_START = 3;

const countdown = ref(COUNTDOWN_START);
const autoAdvance = ref(true);
let timer: ReturnType<typeof setInterval> | null = null;

function clearTimer(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function cancelAuto(): void {
  autoAdvance.value = false;
  clearTimer();
}

function goNext(): void {
  clearTimer();
  emit('next');
}

function startCountdown(): void {
  clearTimer();
  autoAdvance.value = true;
  countdown.value = COUNTDOWN_START;

  timer = setInterval(() => {
    if (!autoAdvance.value) return;

    if (countdown.value <= 1) {
      clearTimer();
      emit('next');
      return;
    }

    countdown.value -= 1;
  }, 1000);
}

watch(
  () => [props.active, props.autoCountdown] as const,
  ([isActive, withCountdown]) => {
    clearTimer();

    if (!isActive) return;

    if (withCountdown) {
      startCountdown();
    } else {
      autoAdvance.value = false;
    }
  },
  { immediate: true }
);

onUnmounted(clearTimer);
</script>

<template>
  <div
    v-if="active"
    class="quiz-result-advance"
    :class="{ 'quiz-result-advance--pause': !autoCountdown }"
  >
    <template v-if="autoCountdown">
      <div
        class="quiz-result-advance__fuse"
        :class="{ 'quiz-result-advance__fuse--paused': !autoAdvance }"
      >
        <div class="quiz-result-advance__fuse-track" aria-hidden="true">
          <div class="quiz-result-advance__fuse-fill" />
          <span class="quiz-result-advance__spark">🔥</span>
        </div>
        <span class="quiz-result-advance__count" aria-live="polite">
          {{ autoAdvance ? countdown : '—' }}
        </span>
      </div>

      <button
        v-if="autoAdvance"
        class="quiz-result-advance__cancel"
        type="button"
        aria-label="Отменить автопереход"
        @click="cancelAuto"
      >
        ×
      </button>
    </template>

    <p v-else class="quiz-result-advance__pause-label">⏸ Пауза</p>

    <button class="quiz-result-advance__next" type="button" @click="goNext">Далее</button>
  </div>
</template>

<style scoped>
.quiz-result-advance {
  display: flex;
  width: 100%;
  max-width: 720px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto var(--space-gap);
  box-sizing: border-box;
}

.quiz-result-advance--pause {
  padding: 8px 12px;
  border: 2px dashed var(--accent);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--bg-secondary) 90%, var(--accent));
  box-shadow: 0 0 16px color-mix(in srgb, var(--accent) 30%, transparent);
}

.quiz-result-advance__pause-label {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-sm);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.quiz-result-advance__fuse {
  display: flex;
  flex: 1;
  min-width: 120px;
  max-width: 200px;
  align-items: center;
  gap: 8px;
}

.quiz-result-advance__fuse-track {
  position: relative;
  overflow: hidden;
  flex: 1;
  height: 8px;
  border-radius: var(--radius-round);
  background: var(--bg-tertiary);
}

.quiz-result-advance__fuse-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-answer-wrong), var(--accent));
  transform-origin: left center;
  animation: quiz-fuse-burn 3s linear forwards;
}

.quiz-result-advance__fuse--paused .quiz-result-advance__fuse-fill {
  animation-play-state: paused;
}

.quiz-result-advance__spark {
  position: absolute;
  top: 50%;
  right: 0;
  font-size: 12px;
  transform: translate(50%, -50%);
  animation: quiz-spark-flicker 0.35s ease-in-out infinite alternate;
}

.quiz-result-advance__fuse--paused .quiz-result-advance__spark {
  animation: none;
  opacity: 0.35;
}

.quiz-result-advance__count {
  min-width: 1.25rem;
  color: var(--text-primary);
  font-size: var(--font-md);
  font-weight: 700;
  line-height: 1;
}

.quiz-result-advance__next {
  min-height: 40px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--gradient-accent);
  color: #ffffff;
  cursor: pointer;
  font-size: var(--font-sm);
  font-weight: 700;
  padding: 6px 14px;
}

.quiz-result-advance--pause .quiz-result-advance__next {
  min-height: 44px;
  padding: 8px 20px;
  font-size: var(--font-md);
}

.quiz-result-advance__cancel {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-round);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

@keyframes quiz-fuse-burn {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

@keyframes quiz-spark-flicker {
  from {
    opacity: 0.7;
    transform: translate(50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(50%, -50%) scale(1.1);
  }
}

@media (max-width: 640px) {
  .quiz-result-advance {
    width: 100%;
    max-width: 100%;
    gap: 6px;
    margin-bottom: 8px;
    padding: 0;
  }

  .quiz-result-advance__fuse {
    min-width: 100px;
    max-width: 140px;
  }

  .quiz-result-advance__count,
  .quiz-result-advance__pause-label {
    font-size: 11px;
  }

  .quiz-result-advance__next {
    min-height: 36px;
    padding: 4px 10px;
    font-size: 11px;
  }

  .quiz-result-advance--pause .quiz-result-advance__next {
    min-height: 40px;
    font-size: var(--font-sm);
  }

  .quiz-result-advance__cancel {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .quiz-result-advance__fuse-fill,
  .quiz-result-advance__spark {
    animation: none;
  }
}
</style>
