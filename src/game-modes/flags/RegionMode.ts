import { BaseGameMode } from './BaseGameMode';
import type { CountriesAPI } from '../../services/CountriesAPI';
import type { Country, RegionName } from '../../types/country';
import type { AnswerResult, GameStats } from '../../types/game';

export class RegionMode extends BaseGameMode<Country, Country> {
  private selectedRegion: RegionName | null = null;
  private readonly availableRegions: RegionName[] = [
    'Европа',
    'Азия',
    'Африка',
    'Северная Америка',
    'Южная Америка',
    'Океания',
  ];

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
      this.selectedRegion = null;
      this.setState('RegionSelection');
    } catch (error) {
      console.error('Error starting region mode game:', error);
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
    this.selectedRegion = null;
    this.setState('Loading');
  }

  selectRegion(region: RegionName): void {
    this.selectedRegion = region;
    void this.generateQuestion();
  }

  async generateQuestion(): Promise<void> {
    try {
      if (!this.selectedRegion) {
        throw new Error('No region selected');
      }

      const regionCountries = this.getRegionCountries();

      if (regionCountries.length === 0) {
        throw new Error(`No countries found for region: ${this.selectedRegion}`);
      }

      let correctCountry: Country;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        const randomIndex = Math.floor(Math.random() * regionCountries.length);
        correctCountry = regionCountries[randomIndex];
        attempts++;
      } while (this.usedCountries.has(correctCountry.name) && attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        this.usedCountries.clear();
        const randomIndex = Math.floor(Math.random() * regionCountries.length);
        correctCountry = regionCountries[randomIndex];
      }

      this.usedCountries.add(correctCountry.name);

      const wrongOptions = this.getRandomCountriesFromRegion(3, correctCountry, regionCountries);

      this.state.options = [correctCountry, ...wrongOptions].sort(() => Math.random() - 0.5);
      this.state.currentQuestion = correctCountry;
      this.state.correctAnswer = correctCountry;
      this.state.isAnswered = false;

      this.setState('Question');
    } catch (error) {
      console.error('Error generating region mode question:', error);
      throw error;
    }
  }

  getRandomCountriesFromRegion(count: number, exclude: Country, regionCountries: Country[]): Country[] {
    return regionCountries
      .filter((country) => country.name !== exclude.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
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
    if (this.usedCountries.size >= this.getRegionCountries().length) {
      this.setState('Idle');
      return false;
    }

    void this.generateQuestion();
    return true;
  }

  getAvailableRegions(): RegionName[] {
    return this.availableRegions;
  }

  getSelectedRegion(): RegionName | null {
    return this.selectedRegion;
  }

  isGameFinished(): boolean {
    if (!this.selectedRegion) return false;
    return this.usedCountries.size >= this.getRegionCountries().length;
  }

  getGameStats(): GameStats {
    const regionCountries = this.getRegionCountries();

    return {
      score: this.getScore(),
      selectedRegion: this.selectedRegion,
      totalCountries: regionCountries.length,
      usedCountries: this.usedCountries.size,
      percentage:
        this.state.score.total > 0
          ? Math.round((this.state.score.correct / this.state.score.total) * 100)
          : 0,
      isFinished: this.isGameFinished(),
      mode: 'region',
    };
  }

  private getRegionCountries(): Country[] {
    return this.countriesAPI
      .getCountries()
      .filter((country) => country.region === this.selectedRegion);
  }
}
