import { BaseGameMode } from './BaseGameMode';
import type { CountriesAPI } from '../services/CountriesAPI';
import type { Country } from '../types/country';
import type { AnswerResult, GameStats, TimeListener } from '../types/game';

export class TimeMode extends BaseGameMode<Country, Country> {
  private readonly timeLimit: number;
  private timeLeft: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private active = false;

  constructor(countriesAPI: CountriesAPI, timeLimit = 30) {
    super(countriesAPI);
    this.timeLimit = timeLimit;
    this.timeLeft = timeLimit;
  }

  async startGame(): Promise<void> {
    this.setState('Loading');

    try {
      if (!this.countriesAPI.isReady()) {
        await this.countriesAPI.loadCountries();
      }

      this.resetScore();
      this.timeLeft = this.timeLimit;
      this.active = false;
      this.setState('Ready');
    } catch (error) {
      console.error('Error starting time mode game:', error);
      this.setState('Idle');
      throw error;
    }
  }

  async beginGame(): Promise<void> {
    this.active = true;
    await this.generateQuestion();
    this.startTimer();
  }

  resetGame(): void {
    this.stopTimer();
    this.resetScore();
    this.state.currentQuestion = null;
    this.state.options = [];
    this.state.correctAnswer = null;
    this.state.isAnswered = false;
    this.timeLeft = this.timeLimit;
    this.active = false;
    this.setState('Loading');
  }

  async generateQuestion(): Promise<void> {
    try {
      const correctCountry = this.getRandomCountryAvoidingUsed();
      const wrongOptions = this.countriesAPI.getRandomCountries(3, correctCountry);

      this.state.options = [correctCountry, ...wrongOptions].sort(() => Math.random() - 0.5);
      this.state.currentQuestion = correctCountry;
      this.state.correctAnswer = correctCountry;
      this.state.isAnswered = false;

      this.setState('Question');
    } catch (error) {
      console.error('Error generating time mode question:', error);
      throw error;
    }
  }

  answerQuestion(selectedCountry: Country): AnswerResult<Country> | null {
    if (this.state.isAnswered || !this.state.correctAnswer || !this.active) {
      return null;
    }

    this.state.isAnswered = true;
    this.state.score.total++;

    const isCorrect = selectedCountry.name === this.state.correctAnswer.name;

    if (isCorrect) {
      this.state.score.correct++;
    } else {
      this.state.score.incorrect++;
      this.timeLeft = Math.max(0, this.timeLeft - 2);
    }

    this.pauseTimer();
    this.setState('Result');

    return {
      isCorrect,
      correctAnswer: this.state.correctAnswer,
      selectedAnswer: selectedCountry,
    };
  }

  nextQuestion(): boolean {
    if (!this.active) {
      return false;
    }

    if (this.timeLeft > 0) {
      void this.generateQuestion();
      this.resumeTimer();
      return true;
    }

    this.endGame();
    return false;
  }

  startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (!this.active) return;

      this.timeLeft--;
      this.notifyTimeUpdate();

      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  pauseTimer(): void {
    this.stopTimer();
  }

  resumeTimer(): void {
    if (this.active && this.timeLeft > 0 && !this.timer) {
      this.startTimer();
    }
  }

  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  endGame(): void {
    this.stopTimer();
    this.active = false;
    this.setState('Idle');
  }

  notifyTimeUpdate(): void {
    this.listeners.forEach((listener) => {
      if (typeof listener !== 'function' && 'onTimeUpdate' in listener) {
        (listener as TimeListener).onTimeUpdate(this.timeLeft, this.state.score.correct);
      }
    });
  }

  getTimeLeft(): number {
    return this.timeLeft;
  }

  getTimeLimit(): number {
    return this.timeLimit;
  }

  isActive(): boolean {
    return this.active;
  }

  getGameStats(): GameStats {
    const totalCountries = this.countriesAPI.getCountries().length;

    return {
      score: this.getScore(),
      timeLeft: this.timeLeft,
      timeLimit: this.timeLimit,
      totalCountries,
      percentage:
        this.state.score.total > 0
          ? Math.round((this.state.score.correct / this.state.score.total) * 100)
          : 0,
      isFinished: !this.active,
      mode: 'time',
    };
  }
}
