import { BaseGameMode } from './BaseGameMode';
import type { CountriesAPI } from '../services/CountriesAPI';
import type { Country } from '../types/country';
import type { AnswerResult, GameStats } from '../types/game';

export class FlagsMode extends BaseGameMode<Country, Country> {
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
      await this.generateQuestion();
    } catch (error) {
      console.error('Error starting flags mode game:', error);
      this.setState('Idle');
      throw error;
    }
  }

  async beginGame(): Promise<void> {
    await this.generateQuestion();
  }

  resetGame(): void {
    this.resetScore();
    this.state.currentQuestion = null;
    this.state.options = [];
    this.state.correctAnswer = null;
    this.state.isAnswered = false;
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
      console.error('Error generating flags mode question:', error);
      throw error;
    }
  }

  answerQuestion(selectedCountry: Country): AnswerResult<Country> | null {
    if (this.state.isAnswered || !this.state.correctAnswer) {
      return null;
    }

    this.state.isAnswered = true;
    this.state.score.total++;

    const isCorrect = selectedCountry.name === this.state.correctAnswer.name;

    if (isCorrect) {
      this.state.score.correct++;
    } else {
      this.state.score.incorrect++;
    }

    this.setState('Result');

    return {
      isCorrect,
      correctAnswer: this.state.correctAnswer,
      selectedAnswer: selectedCountry,
    };
  }

  nextQuestion(): boolean {
    void this.generateQuestion();
    return true;
  }

  getGameStats(): GameStats {
    const totalCountries = this.countriesAPI.getCountries().length;

    return {
      score: this.getScore(),
      totalCountries,
      percentage:
        this.state.score.total > 0
          ? Math.round((this.state.score.correct / this.state.score.total) * 100)
          : 0,
      isFinished: false,
      mode: 'flags',
    };
  }
}
