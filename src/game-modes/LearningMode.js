// Режим игры "Обучение" - изучение стран без таймера и очков
import { BaseGameMode } from './BaseGameMode.js';

export class LearningMode extends BaseGameMode {
  constructor(countriesAPI) {
    super(countriesAPI);
    this.currentIndex = 0;
    this.countries = [];
  }

  async startGame() {
    this.setState('Loading');

    try {
      if (!this.countriesAPI.isReady()) {
        await this.countriesAPI.loadCountries();
      }

      this.resetScore();
      this.countries = this.countriesAPI.getCountries();

      // Перемешиваем страны для случайного порядка
      this.shuffleArray(this.countries);

      this.currentIndex = 0;

      // Генерируем первый вопрос
      await this.generateQuestion();
    } catch (error) {
      console.error('Error starting learning mode game:', error);
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
    this.currentIndex = 0;
    this.countries = [];
    this.setState('Loading');
  }

  async generateQuestion() {
    try {
      if (!this.countries || this.countries.length === 0) {
        console.error('No countries available for learning mode');
        this.setState('Idle');
        return;
      }

      if (this.currentIndex >= this.countries.length) {
        // Все страны изучены, начинаем сначала
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

  answerQuestion(selectedCountry) {
    // В режиме обучения нет правильных/неправильных ответов
    // Просто переходим к следующей стране
    this.setState('Result');
    this.notifyListeners();
    return null;
  }

  nextQuestion() {
    // Переходим к следующей стране
    this.generateQuestion();
    return true;
  }

  getGameStats() {
    return {
      score: this.getScore(),
      currentIndex: this.currentIndex,
      totalCountries: this.countries.length,
      percentage:
        this.countries.length > 0
          ? Math.round((this.currentIndex / this.countries.length) * 100)
          : 0,
      isFinished: false, // Режим обучения бесконечный
      mode: 'learning',
    };
  }

  getCurrentCountry() {
    return this.state.currentQuestion;
  }

  getProgress() {
    return {
      current: this.currentIndex,
      total: this.countries.length,
      percentage:
        this.countries.length > 0
          ? Math.round((this.currentIndex / this.countries.length) * 100)
          : 0,
    };
  }

  // Метод для перемешивания массива (алгоритм Фишера-Йетса)
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
