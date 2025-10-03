// Режим игры "Регионы" - выбор региона и вопросы по нему
import { BaseGameMode } from './BaseGameMode.js';

export class RegionMode extends BaseGameMode {
  constructor(countriesAPI) {
    super(countriesAPI);
    this.selectedRegion = null;
    this.availableRegions = [
      'Европа',
      'Азия',
      'Африка',
      'Северная Америка',
      'Южная Америка',
      'Океания',
    ];
  }

  async startGame() {
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

  resetGame() {
    this.resetScore();
    this.state.currentQuestion = null;
    this.state.options = [];
    this.state.correctAnswer = null;
    this.state.isAnswered = false;
    this.selectedRegion = null;
    this.setState('Loading');
  }

  selectRegion(region) {
    this.selectedRegion = region;
    this.generateQuestion();
  }

  async generateQuestion() {
    try {
      if (!this.selectedRegion) {
        throw new Error('No region selected');
      }

      // Получаем страны выбранного региона
      const regionCountries = this.countriesAPI
        .getCountries()
        .filter((country) => country.region === this.selectedRegion);

      if (regionCountries.length === 0) {
        throw new Error(`No countries found for region: ${this.selectedRegion}`);
      }

      // Получаем случайную страну из региона, избегая повторений
      let correctCountry;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        const randomIndex = Math.floor(Math.random() * regionCountries.length);
        correctCountry = regionCountries[randomIndex];
        attempts++;
      } while (this.usedCountries.has(correctCountry.name) && attempts < maxAttempts);

      // Если все страны региона использованы, сбрасываем список
      if (attempts >= maxAttempts) {
        this.usedCountries.clear();
        const randomIndex = Math.floor(Math.random() * regionCountries.length);
        correctCountry = regionCountries[randomIndex];
      }

      // Отмечаем страну как использованную
      this.usedCountries.add(correctCountry.name);

      // Получаем 3 неправильных варианта из того же региона
      const wrongOptions = this.getRandomCountriesFromRegion(3, correctCountry, regionCountries);

      // Создаем массив вариантов и перемешиваем
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

  getRandomCountriesFromRegion(count, exclude, regionCountries) {
    let availableCountries = regionCountries;

    // Exclude specific country if provided
    if (exclude) {
      availableCountries = regionCountries.filter((country) => country.name !== exclude.name);
    }

    // Shuffle and take the requested number
    const shuffled = [...availableCountries].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  answerQuestion(selectedCountry) {
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
    this.notifyListeners();

    return {
      isCorrect,
      correctAnswer: this.state.correctAnswer,
      selectedAnswer: selectedCountry,
    };
  }

  nextQuestion() {
    // Проверяем, есть ли еще страны в регионе
    const regionCountries = this.countriesAPI
      .getCountries()
      .filter((country) => country.region === this.selectedRegion);

    if (this.usedCountries.size >= regionCountries.length) {
      this.setState('Idle');
      return false; // Все страны региона пройдены
    }

    // Генерируем новый вопрос
    this.generateQuestion();
    return true;
  }

  getAvailableRegions() {
    return this.availableRegions;
  }

  getSelectedRegion() {
    return this.selectedRegion;
  }

  isGameFinished() {
    if (!this.selectedRegion) return false;

    const regionCountries = this.countriesAPI
      .getCountries()
      .filter((country) => country.region === this.selectedRegion);

    return this.usedCountries.size >= regionCountries.length;
  }

  getGameStats() {
    const regionCountries = this.countriesAPI
      .getCountries()
      .filter((country) => country.region === this.selectedRegion);

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
}
