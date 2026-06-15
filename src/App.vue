<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import BurgerButton from './components/layout/BurgerButton.vue';
import AppSidebar from './components/layout/AppSidebar.vue';
import QuizSessionHeader from './components/layout/QuizSessionHeader.vue';
import QuizImageOptionsScreen from './components/quiz/QuizImageOptionsScreen.vue';
import QuizQuestionScreen from './components/quiz/QuizQuestionScreen.vue';
import LoadingScreen from './components/game/LoadingScreen.vue';
import ReadyScreen from './components/game/ReadyScreen.vue';
import WelcomeScreen from './components/game/WelcomeScreen.vue';
import RegionPicker from './components/game/RegionPicker.vue';
import ResultsModal from './components/game/ResultsModal.vue';
import { createGameController } from './composables/useGameController';
import { useTheme } from './composables/useTheme';
import type { Country, RegionName } from './types/country';
import type { GameModeId } from './types/game';

const controller = createGameController();
const { theme, toggleTheme } = useTheme();
const sidebarOpen = ref(false);
const geographyExpanded = ref(true);
const artExpanded = ref(true);

function closeSidebar(): void {
  sidebarOpen.value = false;
}

async function switchMode(mode: GameModeId): Promise<void> {
  closeSidebar();
  await controller.switchMode(mode);
}

async function resetAll(): Promise<void> {
  closeSidebar();
  await controller.resetAll();
}

function onTouchStart(event: TouchEvent): void {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}

watch(sidebarOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

onMounted(() => {
  document.addEventListener('touchstart', onTouchStart, { passive: false });
  void controller.init();
});

onUnmounted(() => {
  document.removeEventListener('touchstart', onTouchStart);
  document.body.style.overflow = '';
});
</script>

<template>
  <BurgerButton :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />

  <AppSidebar
    :is-open="sidebarOpen"
    :current-mode="controller.currentMode.value"
    :theme="theme"
    :geography-expanded="geographyExpanded"
    :art-expanded="artExpanded"
    @toggle-theme="toggleTheme"
    @toggle-geography="geographyExpanded = !geographyExpanded"
    @toggle-art="artExpanded = !artExpanded"
    @switch-mode="switchMode"
    @reset-all="resetAll"
  />

  <div class="app-overlay" :class="{ 'app-overlay--active': sidebarOpen }" @click="closeSidebar" />

  <main class="main-content">
    <LoadingScreen v-if="controller.gamePhase.value === 'loading'" />

    <template v-else>
      <QuizSessionHeader
        :mode-label="controller.currentModeLabel.value"
        :score-text="controller.scoreText.value || undefined"
      />

      <div class="main-content__view">
        <WelcomeScreen v-if="controller.gamePhase.value === 'welcome'" />

        <ReadyScreen
          v-else-if="controller.gamePhase.value === 'ready'"
          @begin="controller.begin"
        />

        <RegionPicker
          v-else-if="controller.gamePhase.value === 'region-selection'"
          @select="(region: RegionName) => controller.selectRegion(region)"
        />

        <QuizImageOptionsScreen
          v-else-if="controller.currentMode.value === 'flags'"
          :question="controller.currentQuestion.value"
          :options="(controller.options.value as Country[])"
          :phase="controller.gamePhase.value"
          :result="controller.lastResult.value"
          @answer="controller.answer"
          @next="controller.next"
        />

        <QuizQuestionScreen
          v-else-if="controller.currentMode.value"
          :mode="controller.currentMode.value!"
          :phase="controller.gamePhase.value"
          :question="controller.currentQuestion.value"
          :question-media="controller.questionMedia.value"
          :question-prompt="controller.questionPrompt.value"
          :question-key="controller.questionKey.value"
          :options="controller.options.value"
          :result="controller.lastResult.value"
          :stats="controller.stats.value"
          @answer="controller.answer"
          @next="controller.next"
        />
      </div>
    </template>

    <ResultsModal
      v-if="controller.resultsModal.value"
      :stats="controller.resultsModal.value"
      @close="controller.closeResults"
      @play-again="resetAll"
    />

    <div v-if="controller.errorMessage.value" class="app-error">
      <div class="app-error__content">
        <h3>Ошибка</h3>
        <p>{{ controller.errorMessage.value }}</p>
        <button class="app-error__btn" type="button" @click="controller.init">Перезагрузить</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.main-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.main-content__view {
  display: flex;
  width: 100%;
  flex: 1;
  flex-direction: column;
  align-items: center;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.main-content__view > * {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.app-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  visibility: hidden;
  background: var(--shadow);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.app-overlay--active {
  visibility: visible;
  opacity: 1;
}

.app-error {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  background: var(--shadow);
}

.app-error__content {
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  padding: var(--space-block);
  text-align: center;
}

.app-error__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  margin-top: var(--space-gap);
  padding: var(--space-inner) var(--space-gap);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--gradient-accent);
  color: #ffffff;
  cursor: pointer;
  font-size: var(--font-md);
  font-weight: 600;
}

@media (max-width: 640px) {
  .main-content {
    padding-top: var(--safe-top);
    padding-bottom: var(--safe-bottom);
    box-sizing: border-box;
  }
}
</style>
