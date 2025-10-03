// Режим игры "На выживание" (бесконечный)
import { BaseGameMode } from './BaseGameMode.js';

export class SurvivalMode extends BaseGameMode {
  constructor(countriesAPI) {
    super(countriesAPI);
    this.lives = 3; // количество жизней
    this.maxLives = 3;
  }

  async startGame() {
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

  async beginGame() {
    // Для режима выживания сразу начинаем игру
    await this.generateQuestion();
  }

  resetGame() {
    this.resetScore();
    this.state.currentQuestion = null;
    this.state.options = [];
    this.state.correctAnswer = null;
    this.state.isAnswered = false;
    this.lives = this.maxLives;
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
      console.error('Error generating survival mode question:', error);
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
      this.lives--; // Теряем жизнь за неправильный ответ
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
    // Если жизни закончились, игра окончена
    if (this.lives <= 0) {
      this.setState('Idle');
      return false;
    }

    // Генерируем новый вопрос (бесконечный режим)
    this.generateQuestion();
    return true;
  }

  getLives() {
    return this.lives;
  }

  getMaxLives() {
    return this.maxLives;
  }

  isGameFinished() {
    return this.lives <= 0;
  }

  getGameStats() {
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
