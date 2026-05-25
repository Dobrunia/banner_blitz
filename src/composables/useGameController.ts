import { computed, ref } from 'vue';
import { CountriesAPI } from '../services/CountriesAPI';
import { PaintingsAPI } from '../services/PaintingsAPI';
import {
  CapitalMode,
  ClassicMode,
  FlagsMode,
  LearningMode,
  PaintingArtistMode,
  RegionMode,
  SurvivalMode,
  TimeMode,
} from '../game-modes';
import { quizMediaFromCountry } from '../utils/quizMedia';
import { MODE_LABELS } from '../constants/gameModes';
import type { Country, RegionName } from '../types/country';
import type { AnswerResult, GameMode, GameModeId, GamePhase, GameState, GameStats } from '../types/game';

type ModeMap = Record<GameModeId, GameMode>;

const DEFAULT_STATS: GameStats = {
  score: { correct: 0, incorrect: 0, total: 0 },
  percentage: 0,
  isFinished: false,
  mode: 'classic',
  totalCountries: 0,
};

const phaseByState: Record<GameState['currentState'], GamePhase> = {
  Idle: 'idle',
  Loading: 'loading',
  Ready: 'ready',
  RegionSelection: 'region-selection',
  Learning: 'question',
  Question: 'question',
  Result: 'result',
};

export function createGameController() {
  const countriesAPI = new CountriesAPI();
  const paintingsAPI = new PaintingsAPI();
  const gameModes: ModeMap = {
    time: new TimeMode(countriesAPI, 30),
    survival: new SurvivalMode(countriesAPI),
    classic: new ClassicMode(countriesAPI),
    flags: new FlagsMode(countriesAPI),
    region: new RegionMode(countriesAPI),
    learning: new LearningMode(countriesAPI),
    capital: new CapitalMode(countriesAPI),
    'art-guess-artist': new PaintingArtistMode(paintingsAPI),
  };

  const currentMode = ref<GameModeId | null>(null);
  const isBootstrapping = ref(false);
  const state = ref<GameState>({
    currentState: 'Idle',
    score: { correct: 0, incorrect: 0, total: 0 },
    currentQuestion: null,
    options: [],
    correctAnswer: null,
    isAnswered: false,
    quizMedia: null,
    questionKey: null,
  });
  const stats = ref<GameStats>({ ...DEFAULT_STATS });
  const lastResult = ref<AnswerResult | null>(null);
  const resultsModal = ref<GameStats | null>(null);
  const errorMessage = ref('');
  const timeLeft = ref(0);

  const listener = (nextState: GameState) => {
    state.value = nextState;
    stats.value = currentGameMode().getGameStats();
    timeLeft.value = stats.value.timeLeft ?? 0;

    if (
      currentMode.value &&
      nextState.currentState === 'Idle' &&
      stats.value.isFinished &&
      currentMode.value === 'time'
    ) {
      resultsModal.value = stats.value;
    }
  };

  const timeListener = {
    onTimeUpdate(nextTimeLeft: number, correctAnswers: number) {
      timeLeft.value = nextTimeLeft;
      stats.value = {
        ...stats.value,
        timeLeft: nextTimeLeft,
        score: {
          ...stats.value.score,
          correct: correctAnswers,
        },
      };
    },
  };

  Object.values(gameModes).forEach((mode) => {
    mode.addListener(listener);
  });
  gameModes.time.addListener(timeListener);

  const gamePhase = computed<GamePhase>(() => {
    if (isBootstrapping.value) return 'loading';
    if (!currentMode.value) return 'welcome';
    return phaseByState[state.value.currentState];
  });

  const currentModeLabel = computed(() =>
    currentMode.value ? MODE_LABELS[currentMode.value] : null
  );

  const currentQuestion = computed(() => state.value.currentQuestion);
  const questionMedia = computed(
    () => state.value.quizMedia ?? quizMediaFromCountry(state.value.currentQuestion)
  );
  const questionPrompt = computed(() => {
    if (currentMode.value === 'capital' && state.value.currentQuestion) {
      return `Какая столица у ${state.value.currentQuestion.name}?`;
    }

    if (currentMode.value === 'learning' && state.value.currentQuestion) {
      return state.value.currentQuestion.name;
    }

    if (currentMode.value === 'art-guess-artist') {
      return 'Кто автор этой картины?';
    }

    if (state.value.currentQuestion) {
      return 'Какая это страна?';
    }

    return '';
  });
  const questionKey = computed(
    () => state.value.questionKey ?? state.value.currentQuestion?.name ?? null
  );
  const options = computed(() => state.value.options);
  const scoreText = computed(() => {
    if (!currentMode.value) return '';
    return formatScore(currentMode.value, stats.value, timeLeft.value);
  });
  function currentGameMode(): GameMode {
    if (!currentMode.value) {
      throw new Error('Game mode is not selected');
    }

    return gameModes[currentMode.value];
  }

  async function init(): Promise<void> {
    isBootstrapping.value = true;
    errorMessage.value = '';

    try {
      if (!countriesAPI.isReady()) {
        await countriesAPI.loadCountries();
      }

      if (!paintingsAPI.isReady()) {
        await paintingsAPI.loadPaintings();
      }

      currentMode.value = null;
    } catch (error) {
      console.error('Failed to bootstrap app:', error);
      errorMessage.value = 'Не удалось загрузить данные.';
    } finally {
      isBootstrapping.value = false;
    }
  }

  async function startCurrentMode(): Promise<void> {
    if (!currentMode.value) return;

    lastResult.value = null;
    resultsModal.value = null;
    errorMessage.value = '';

    try {
      await currentGameMode().startGame();
      stats.value = currentGameMode().getGameStats();
      timeLeft.value = stats.value.timeLeft ?? 0;
    } catch (error) {
      console.error('Failed to start game:', error);
      errorMessage.value = 'Не удалось загрузить данные.';
    }
  }

  async function begin(): Promise<void> {
    const mode = currentGameMode();

    if (mode.beginGame) {
      await mode.beginGame();
      stats.value = mode.getGameStats();
      timeLeft.value = stats.value.timeLeft ?? 0;
    }
  }

  async function switchMode(mode: GameModeId): Promise<void> {
    currentMode.value = mode;
    state.value = gameModes[mode].getState();
    await startCurrentMode();
  }

  function answer(answerValue: Country | string): void {
    if (gamePhase.value === 'result') return;

    const result = currentGameMode().answerQuestion(answerValue);
    if (result) {
      lastResult.value = result;
      stats.value = currentGameMode().getGameStats();
    }
  }

  function next(): void {
    const mode = currentGameMode();
    const currentStats = mode.getGameStats();

    if (currentStats.isFinished) {
      resultsModal.value = currentStats;
      return;
    }

    const hasNext = mode.nextQuestion();
    stats.value = mode.getGameStats();

    if (!hasNext) {
      resultsModal.value = stats.value;
    } else {
      lastResult.value = null;
    }
  }

  function selectRegion(region: RegionName): void {
    if (currentMode.value !== 'region') return;

    (gameModes.region as RegionMode).selectRegion(region);
    stats.value = gameModes.region.getGameStats();
  }

  async function resetAll(): Promise<void> {
    Object.values(gameModes).forEach((mode) => mode.resetGame());
    currentMode.value = null;
    lastResult.value = null;
    resultsModal.value = null;
    state.value = {
      currentState: 'Idle',
      score: { correct: 0, incorrect: 0, total: 0 },
      currentQuestion: null,
      options: [],
      correctAnswer: null,
      isAnswered: false,
      quizMedia: null,
      questionKey: null,
    };
  }

  function closeResults(): void {
    resultsModal.value = null;
  }

  return {
    currentMode,
    currentModeLabel,
    gamePhase,
    state,
    stats,
    lastResult,
    resultsModal,
    errorMessage,
    currentQuestion,
    questionMedia,
    questionPrompt,
    questionKey,
    options,
    scoreText,
    init,
    begin,
    switchMode,
    answer,
    next,
    selectRegion,
    resetAll,
    closeResults,
  };
}

export type GameController = ReturnType<typeof createGameController>;

function formatScore(mode: GameModeId, stats: GameStats, currentTimeLeft: number): string {
  if (mode === 'time') {
    return `${stats.score.correct}/${currentTimeLeft || stats.timeLeft || 0}с`;
  }

  if (mode === 'survival') {
    return `${stats.score.correct}`;
  }

  if (mode === 'flags') {
    return `${stats.score.correct}/${stats.score.total}`;
  }

  if (mode === 'region') {
    return `${stats.score.correct}/${stats.totalCountries ?? 0}`;
  }

  return `${stats.score.correct}/${stats.totalCountries ?? 0}`;
}
