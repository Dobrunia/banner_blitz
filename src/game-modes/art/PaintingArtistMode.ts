import type { PaintingsAPI } from '../../services/PaintingsAPI';
import type { PaintingQuizItem } from '../../types/painting';
import type { AnswerResult, GameListener, GameMode, GameState, GameStats, StateListener } from '../../types/game';
import type { QuizMedia } from '../../types/quiz-ui';

export class PaintingArtistMode implements GameMode {
  private readonly paintingsAPI: PaintingsAPI;
  private usedPaintingIds = new Set<string>();
  private listeners: GameListener[] = [];

  private state: GameState<string, string> = {
    currentState: 'Idle',
    score: { correct: 0, incorrect: 0, total: 0 },
    currentQuestion: null,
    options: [],
    correctAnswer: null,
    isAnswered: false,
    quizMedia: null,
    questionKey: null,
  };

  constructor(paintingsAPI: PaintingsAPI) {
    this.paintingsAPI = paintingsAPI;
  }

  async startGame(): Promise<void> {
    this.setState('Loading');

    try {
      if (!this.paintingsAPI.isReady()) {
        await this.paintingsAPI.loadPaintings();
      }

      this.usedPaintingIds.clear();
      this.state.score = { correct: 0, incorrect: 0, total: 0 };
      await this.generateQuestion();
    } catch (error) {
      console.error('Error starting painting artist mode:', error);
      this.setState('Idle');
      throw error;
    }
  }

  resetGame(): void {
    this.usedPaintingIds.clear();
    this.state.currentQuestion = null;
    this.state.options = [];
    this.state.correctAnswer = null;
    this.state.isAnswered = false;
    this.state.quizMedia = null;
    this.state.questionKey = null;
    this.state.score = { correct: 0, incorrect: 0, total: 0 };
    this.setState('Loading');
  }

  answerQuestion(selectedArtist: string): AnswerResult<string> | null {
    if (this.state.isAnswered || !this.state.correctAnswer) return null;

    this.state.isAnswered = true;
    this.state.score.total++;

    const isCorrect = selectedArtist === this.state.correctAnswer;

    if (isCorrect) {
      this.state.score.correct++;
    } else {
      this.state.score.incorrect++;
    }

    this.setState('Result');

    return {
      isCorrect,
      correctAnswer: this.state.correctAnswer,
      selectedAnswer: selectedArtist,
    };
  }

  nextQuestion(): boolean {
    if (this.isGameFinished()) {
      this.setState('Idle');
      return false;
    }

    void this.generateQuestion();
    return true;
  }

  getGameStats(): GameStats {
    const total = this.paintingsAPI.getPaintings().length;

    return {
      score: { ...this.state.score },
      totalCountries: total,
      usedCountries: this.usedPaintingIds.size,
      percentage:
        this.state.score.total > 0
          ? Math.round((this.state.score.correct / this.state.score.total) * 100)
          : 0,
      isFinished: this.isGameFinished(),
      mode: 'art-guess-artist',
    };
  }

  getState(): GameState<string, string> {
    return {
      ...this.state,
      score: { ...this.state.score },
      options: [...this.state.options],
    };
  }

  addListener(listener: GameListener): void {
    this.listeners.push(listener);
  }

  removeListener(listener: GameListener): void {
    this.listeners = this.listeners.filter((item) => item !== listener);
  }

  private async generateQuestion(): Promise<void> {
    const painting = this.getRandomPaintingAvoidingUsed();
    const wrongArtists = this.paintingsAPI.getRandomArtists(3, painting.artist);

    this.state.options = [painting.artist, ...wrongArtists].sort(() => Math.random() - 0.5);
    this.state.correctAnswer = painting.artist;
    this.state.questionKey = painting.id;
    this.state.quizMedia = this.toQuizMedia(painting);
    this.state.isAnswered = false;

    this.setState('Question');
  }

  private getRandomPaintingAvoidingUsed(): PaintingQuizItem {
    const total = this.paintingsAPI.getPaintings().length;

    if (this.usedPaintingIds.size >= total) {
      this.usedPaintingIds.clear();
    }

    let painting = this.paintingsAPI.getRandomPainting(this.usedPaintingIds);
    let attempts = 0;

    while (this.usedPaintingIds.has(painting.id) && attempts < 50) {
      painting = this.paintingsAPI.getRandomPainting(this.usedPaintingIds);
      attempts++;
    }

    this.usedPaintingIds.add(painting.id);
    return painting;
  }

  private toQuizMedia(painting: PaintingQuizItem): QuizMedia {
    return {
      imageUrl: painting.imageUrl,
      title: painting.title,
      alt: `Картина: ${painting.title}`,
    };
  }

  private isGameFinished(): boolean {
    return this.usedPaintingIds.size >= this.paintingsAPI.getPaintings().length;
  }

  private setState(newState: GameState['currentState']): void {
    this.state.currentState = newState;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      if (typeof listener === 'function') {
        (listener as StateListener)(this.getState() as GameState);
      }
    });
  }
}
