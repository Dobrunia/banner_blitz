import type { CountriesAPI } from '../services/CountriesAPI';
import type { Country } from '../types/country';
import type { AnswerResult, GameListener, GameState, GameStats, StateListener } from '../types/game';

export abstract class BaseGameMode<TOption = Country, TAnswer = Country> {
  protected countriesAPI: CountriesAPI;
  protected state: GameState<TOption, TAnswer>;
  protected listeners: GameListener[] = [];
  protected usedCountries = new Set<string>();

  constructor(countriesAPI: CountriesAPI) {
    this.countriesAPI = countriesAPI;
    this.state = {
      currentState: 'Idle',
      score: { correct: 0, incorrect: 0, total: 0 },
      currentQuestion: null,
      options: [],
      correctAnswer: null,
      isAnswered: false,
    };
  }

  protected setState(newState: GameState<TOption, TAnswer>['currentState']): void {
    this.state.currentState = newState;
    this.notifyListeners();
  }

  getState(): GameState<TOption, TAnswer> {
    return {
      ...this.state,
      score: { ...this.state.score },
      options: [...this.state.options],
    };
  }

  addListener(callback: GameListener): void {
    this.listeners.push(callback);
  }

  removeListener(callback: GameListener): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  protected notifyListeners(): void {
    this.listeners.forEach((listener) => {
      if (typeof listener === 'function') {
        (listener as StateListener)(this.getState() as GameState);
      }
    });
  }

  protected resetScore(): void {
    this.state.score = { correct: 0, incorrect: 0, total: 0 };
    this.usedCountries.clear();
  }

  protected getRandomCountryAvoidingUsed(): Country {
    const allCountries = this.countriesAPI.getCountries();

    if (this.usedCountries.size >= allCountries.length) {
      this.usedCountries.clear();
    }

    let attempts = 0;
    const maxAttempts = 100;
    let country: Country;

    do {
      country = this.countriesAPI.getRandomCountry();
      attempts++;
    } while (this.usedCountries.has(country.name) && attempts < maxAttempts);

    this.usedCountries.add(country.name);
    return country;
  }

  getScore() {
    return { ...this.state.score };
  }

  getCurrentQuestion(): Country | null {
    return this.state.currentQuestion;
  }

  getOptions(): TOption[] {
    return [...this.state.options];
  }

  isReady(): boolean {
    return this.countriesAPI.isReady();
  }

  abstract startGame(): Promise<void>;
  abstract resetGame(): void;
  abstract answerQuestion(answer: TAnswer): AnswerResult<TAnswer> | null;
  abstract nextQuestion(): boolean;
  abstract getGameStats(): GameStats;
}
