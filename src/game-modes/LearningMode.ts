import { BaseGameMode } from './BaseGameMode';
import type { CountriesAPI } from '../services/CountriesAPI';
import type { Country } from '../types/country';
import type { AnswerResult, GameStats } from '../types/game';

export class LearningMode extends BaseGameMode<never, Country> {
  private currentIndex = 0;
  private countries: Country[] = [];

  constructor(countriesAPI: CountriesAPI) {
    super(countriesAPI);
  }

  async startGame(): Promise<void> {
    this.setState('Loading');

    try {
      if (!this.countriesAPI.isReady()) {
        await this.countriesAPI.loadCountries();
      }

      this.resetScore();
      this.countries = [...this.countriesAPI.getCountries()];
      this.shuffleArray(this.countries);
      this.currentIndex = 0;
      await this.generateQuestion();
    } catch (error) {
      console.error('Error starting learning mode game:', error);
      this.setState('Idle');
      throw error;
    }
  }

  resetGame(): void {
    this.resetScore();
    this.state.currentQuestion = null;
    this.state.options = [];
    this.state.correctAnswer = null;
    this.state.isAnswered = false;
    this.currentIndex = 0;
    this.countries = [];
    this.setState('Loading');
  }

  async generateQuestion(): Promise<void> {
    try {
      if (this.countries.length === 0) {
        console.error('No countries available for learning mode');
        this.setState('Idle');
        return;
      }

      if (this.currentIndex >= this.countries.length) {
        this.currentIndex = 0;
      }

      const country = this.countries[this.currentIndex];
      if (!country) {
        console.error(`Country at index ${this.currentIndex} is undefined`);
        this.setState('Idle');
        return;
      }

      this.currentIndex++;
      this.state.currentQuestion = country;
      this.state.correctAnswer = country;
      this.state.isAnswered = false;

      this.setState('Question');
    } catch (error) {
      console.error('Error generating learning mode question:', error);
      throw error;
    }
  }

  answerQuestion(): AnswerResult<Country> | null {
    this.setState('Result');
    return null;
  }

  nextQuestion(): boolean {
    void this.generateQuestion();
    return true;
  }

  getGameStats(): GameStats {
    return {
      score: this.getScore(),
      currentIndex: this.currentIndex,
      totalCountries: this.countries.length,
      percentage:
        this.countries.length > 0 ? Math.round((this.currentIndex / this.countries.length) * 100) : 0,
      isFinished: false,
      mode: 'learning',
    };
  }

  getCurrentCountry(): Country | null {
    return this.state.currentQuestion;
  }

  getProgress() {
    return {
      current: this.currentIndex,
      total: this.countries.length,
      percentage:
        this.countries.length > 0 ? Math.round((this.currentIndex / this.countries.length) * 100) : 0,
    };
  }

  private shuffleArray(array: Country[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
