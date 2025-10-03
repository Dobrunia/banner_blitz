// Классический режим игры (все страны по очереди)
import { BaseGameMode } from './BaseGameMode.js';

export class ClassicMode extends BaseGameMode {
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
      console.error('Error starting classic mode game:', error);
      this.setState('Idle');
      throw error;
    }
  }

  async beginGame() {
    // Для классического режима сразу начинаем игру
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

      // Получаем 3 неправильных варианта
      const wrongOptions = this.countriesAPI.getRandomCountries(3, correctCountry);

      // Создаем массив вариантов и перемешиваем
      this.state.options = [correctCountry, ...wrongOptions].sort(() => Math.random() - 0.5);

      this.state.currentQuestion = correctCountry;
      this.state.correctAnswer = correctCountry;
      this.state.isAnswered = false;

      this.setState('Question');
    } catch (error) {
      console.error('Error generating classic mode question:', error);
      throw error;
    }
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
      mode: 'classic',
    };
  }
}
