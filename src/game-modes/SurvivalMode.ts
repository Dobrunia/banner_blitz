import { BaseGameMode } from './BaseGameMode';
import type { CountriesAPI } from '../services/CountriesAPI';
import type { Country } from '../types/country';
import type { AnswerResult, GameStats } from '../types/game';

export class SurvivalMode extends BaseGameMode<Country, Country> {
  private lives = 3;
  private readonly maxLives = 3;

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
      this.lives = this.maxLives;
      await this.generateQuestion();
    } catch (error) {
      console.error('Error starting survival mode game:', error);
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
    this.lives = this.maxLives;
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
      console.error('Error generating survival mode question:', error);
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
      this.lives--;
    }

    this.setState('Result');

    return {
      isCorrect,
      correctAnswer: this.state.correctAnswer,
      selectedAnswer: selectedCountry,
    };
  }

  nextQuestion(): boolean {
    if (this.lives <= 0) {
      this.setState('Idle');
      return false;
    }

    void this.generateQuestion();
    return true;
  }

  getLives(): number {
    return this.lives;
  }

  getMaxLives(): number {
    return this.maxLives;
  }

  isGameFinished(): boolean {
    return this.lives <= 0;
  }

  getGameStats(): GameStats {
    return {
      score: this.getScore(),
      lives: this.lives,
      maxLives: this.maxLives,
      percentage:
        this.state.score.total > 0
          ? Math.round((this.state.score.correct / this.state.score.total) * 100)
          : 0,
      isFinished: this.isGameFinished(),
      mode: 'survival',
    };
  }
}
