import { BaseGameMode } from './BaseGameMode';
import type { CountriesAPI } from '../../services/CountriesAPI';
import type { Country } from '../../types/country';
import type { AnswerResult, GameStats } from '../../types/game';

export class CapitalMode extends BaseGameMode<string, string> {
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
      console.error('Error starting capital mode game:', error);
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

      if (!correctCountry.capital) {
        return this.generateQuestion();
      }

      const wrongCapitals = this.getRandomCapitals(3, correctCountry.capital);

      this.state.options = [correctCountry.capital, ...wrongCapitals].sort(() => Math.random() - 0.5);
      this.state.currentQuestion = correctCountry;
      this.state.correctAnswer = correctCountry.capital;
      this.state.isAnswered = false;

      this.setState('Question');
    } catch (error) {
      console.error('Error generating capital mode question:', error);
      throw error;
    }
  }

  getRandomCapitals(count: number, excludeCapital: string): string[] {
    const capitals = this.countriesAPI
      .getCountries()
      .map((country) => country.capital)
      .filter((capital): capital is string => Boolean(capital) && capital !== excludeCapital)
      .filter((capital, index, all) => all.indexOf(capital) === index);

    return [...capitals].sort(() => Math.random() - 0.5).slice(0, count);
  }

  answerQuestion(selectedCapital: string): AnswerResult<string> | null {
    if (this.state.isAnswered || !this.state.correctAnswer) {
      return null;
    }

    this.state.isAnswered = true;
    this.state.score.total++;

    const isCorrect = selectedCapital === this.state.correctAnswer;

    if (isCorrect) {
      this.state.score.correct++;
    } else {
      this.state.score.incorrect++;
    }

    this.setState('Result');

    return {
      isCorrect,
      correctAnswer: this.state.correctAnswer,
      selectedAnswer: selectedCapital,
    };
  }

  nextQuestion(): boolean {
    const totalCountries = this.countriesAPI.getCountries().length;

    if (this.usedCountries.size >= totalCountries) {
      this.setState('Idle');
      return false;
    }

    void this.generateQuestion();
    return true;
  }

  isGameFinished(): boolean {
    const totalCountries = this.countriesAPI.getCountries().length;
    return this.usedCountries.size >= totalCountries;
  }

  getGameStats(): GameStats {
    const totalCountries = this.countriesAPI.getCountries().length;

    return {
      score: this.getScore(),
      totalCountries,
      usedCountries: this.usedCountries.size,
      percentage:
        this.state.score.total > 0
          ? Math.round((this.state.score.correct / this.state.score.total) * 100)
          : 0,
      isFinished: this.isGameFinished(),
      mode: 'capital',
    };
  }

  getCurrentCountry(): Country | null {
    return this.state.currentQuestion;
  }
}
