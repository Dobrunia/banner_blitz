// Режим игры "4 Флага → 1 Страна"
import { BaseGameMode } from './BaseGameMode.js';

export class FlagsMode extends BaseGameMode {
  constructor(countriesAPI) {
    super(countriesAPI);
  }

  async startGame() {
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

  async beginGame() {
    // Для режима флагов сразу начинаем игру
    await this.generateQuestion();
  }

  resetGame() {
    this.resetScore();
    this.state.currentQuestion = null;
    this.state.options = [];
    this.state.correctAnswer = null;
    this.state.isAnswered = false;
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
      console.error('Error generating flags mode question:', error);
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
    // Бесконечный режим - всегда генерируем новый вопрос
    this.generateQuestion();
    return true;
  }

  getGameStats() {
    const totalCountries = this.countriesAPI.getCountries().length;
    return {
      score: this.getScore(),
      totalCountries,
      percentage:
        this.state.score.total > 0
          ? Math.round((this.state.score.correct / this.state.score.total) * 100)
          : 0,
      isFinished: false, // Бесконечный режим
      mode: 'flags',
    };
  }
}
