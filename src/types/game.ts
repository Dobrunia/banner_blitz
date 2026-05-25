import type { Country, RegionName } from './country';
import type { QuizMedia } from './quiz-ui';

export type GameModeId =
  | 'classic'
  | 'time'
  | 'survival'
  | 'flags'
  | 'region'
  | 'learning'
  | 'capital'
  | 'art-guess-artist';

export type GameStateName = 'Idle' | 'Loading' | 'Ready' | 'RegionSelection' | 'Learning' | 'Question' | 'Result';

export type GamePhase =
  | 'welcome'
  | 'idle'
  | 'loading'
  | 'ready'
  | 'region-selection'
  | 'question'
  | 'result';

export interface Score {
  correct: number;
  incorrect: number;
  total: number;
}

export interface GameState<TOption = Country | string, TAnswer = Country | string> {
  currentState: GameStateName;
  score: Score;
  currentQuestion: Country | null;
  options: TOption[];
  correctAnswer: TAnswer | null;
  isAnswered: boolean;
  quizMedia?: QuizMedia | null;
  questionKey?: string | null;
}

export interface AnswerResult<TAnswer = Country | string> {
  isCorrect: boolean;
  correctAnswer: TAnswer;
  selectedAnswer: TAnswer;
}

export interface GameStats {
  score: Score;
  percentage: number;
  isFinished: boolean;
  mode: GameModeId;
  totalCountries?: number;
  usedCountries?: number;
  timeLeft?: number;
  timeLimit?: number;
  lives?: number;
  maxLives?: number;
  selectedRegion?: RegionName | null;
  currentIndex?: number;
}

export type StateListener = (state: GameState) => void;

export interface TimeListener {
  onTimeUpdate: (timeLeft: number, correctAnswers: number) => void;
}

export type GameListener = StateListener | TimeListener;

export interface GameMode {
  startGame(): Promise<void>;
  beginGame?(): Promise<void>;
  resetGame(): void;
  answerQuestion(answer: Country | string): AnswerResult | null;
  nextQuestion(): boolean;
  getGameStats(): GameStats;
  getState(): GameState;
  addListener(listener: GameListener): void;
  removeListener(listener: GameListener): void;
}
