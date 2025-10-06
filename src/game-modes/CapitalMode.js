// Режим угадывания столиц (показывается флаг + название страны, нужно угадать столицу)
import { BaseGameMode } from './BaseGameMode.js';

export class CapitalMode extends BaseGameMode {
  constructor(countriesAPI) {
    super(countriesAPI);
    this.usedCountries = new Set(); // отслеживаем использованные страны
  }

  async startGame() {
    this.setState('Loading');

    try {
      if (!this.countriesAPI.isReady()) {
        await this.countriesAPI.loadCountries();
      }

      this.resetScore();
      this.usedCountries.clear();
      await this.generateQuestion();
    } catch (error) {
      console.error('Error starting capital mode game:', error);
      this.setState('Idle');
      throw error;
    }
  }

  async beginGame() {
    // Для режима столиц сразу начинаем игру
    await this.generateQuestion();
  }

  resetGame() {
    this.resetScore();
    this.state.currentQuestion = null;
    this.state.options = [];
    this.state.correctAnswer = null;
    this.state.isAnswered = false;
    this.usedCountries.clear();
    this.setState('Loading');
  }

  async generateQuestion() {
    try {
      // Получаем случайную страну, избегая повторений
      const correctCountry = this.getRandomCountryAvoidingUsed();

      // Проверяем, что у страны есть столица
      if (!correctCountry.capital) {
        // Если у страны нет столицы, берем другую
        return this.generateQuestion();
      }

      // Получаем 3 неправильных варианта столиц
      const wrongCapitals = this.getRandomCapitals(3, correctCountry.capital);

      // Создаем массив вариантов и перемешиваем
      this.state.options = [correctCountry.capital, ...wrongCapitals].sort(
        () => Math.random() - 0.5
      );

      this.state.currentQuestion = correctCountry;
      this.state.correctAnswer = correctCountry.capital;
      this.state.isAnswered = false;

      this.setState('Question');
    } catch (error) {
      console.error('Error generating capital mode question:', error);
      throw error;
    }
  }

  getRandomCapitals(count, excludeCapital) {
    const allCountries = this.countriesAPI.getCountries();
    const capitals = allCountries
      .map((country) => country.capital)
      .filter((capital) => capital && capital !== excludeCapital)
      .filter((capital, index, arr) => arr.indexOf(capital) === index); // убираем дубликаты

    // Перемешиваем и берем нужное количество
    const shuffled = [...capitals].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  answerQuestion(selectedCapital) {
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
    this.notifyListeners();

    return {
      isCorrect,
      correctAnswer: this.state.correctAnswer,
      selectedAnswer: selectedCapital,
    };
  }

  nextQuestion() {
    const totalCountries = this.countriesAPI.getCountries().length;

    // Если прошли все страны, игра окончена
    if (this.usedCountries.size >= totalCountries) {
      this.setState('Idle');
      return false;
    }

    // Генерируем новый вопрос
    this.generateQuestion();
    return true;
  }

  isGameFinished() {
    const totalCountries = this.countriesAPI.getCountries().length;
    return this.usedCountries.size >= totalCountries;
  }

  getGameStats() {
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
}
