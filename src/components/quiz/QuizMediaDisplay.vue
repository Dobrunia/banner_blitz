<script setup lang="ts">
import { ref, watch } from 'vue';
import type { QuizMedia } from '../../types/quiz-ui';

const props = defineProps<{
  media: QuizMedia | null;
  loadingLabel?: string;
  unavailableLabel?: string;
}>();

const failed = ref(false);
const loading = ref(false);
const imageReady = ref(false);

watch(
  () => props.media?.imageUrl,
  (url) => {
    failed.value = false;
    imageReady.value = false;

    if (!url) {
      loading.value = false;
      return;
    }

    loading.value = true;
    const img = new Image();

    img.onload = () => {
      if (props.media?.imageUrl !== url) return;
      imageReady.value = true;
      loading.value = false;
    };

    img.onerror = () => {
      if (props.media?.imageUrl !== url) return;
      failed.value = true;
      loading.value = false;
    };

    img.src = url;
  },
  { immediate: true }
);
</script>

<template>
  <div class="quiz-media">
    <div
      v-if="media && loading"
      class="quiz-media__loader"
      aria-busy="true"
      :aria-label="loadingLabel ?? 'Загрузка изображения'"
    >
      <div class="quiz-media__spinner" />
    </div>

    <div v-else-if="media && failed" class="quiz-media__placeholder">
      <span>
        {{ unavailableLabel ?? 'Изображение недоступно' }}<br />
        <small v-if="media.title">{{ media.title }}</small>
      </span>
    </div>

    <img
      v-else-if="media && imageReady"
      class="quiz-media__image"
      :src="media.imageUrl"
      :alt="media.alt ?? media.title ?? 'Изображение вопроса'"
    />
  </div>
</template>

<style scoped>
.quiz-media {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.quiz-media__loader {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.quiz-media__spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--accent);
  border-radius: var(--radius-round);
  animation: quiz-media-spin 0.8s linear infinite;
}

.quiz-media__image {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-md);
  box-shadow: 0 10px 30px var(--shadow);
  object-fit: contain;
}

.quiz-media__placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--color-placeholder-border);
  border-radius: var(--radius-md);
  background: var(--color-placeholder-bg);
  color: var(--text-muted);
  font-size: var(--font-md);
  font-weight: 700;
  padding: var(--space-block);
  text-align: center;
}

@keyframes quiz-media-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .quiz-media__spinner {
    animation: none;
    border-top-color: var(--border-color);
  }
}
</style>
