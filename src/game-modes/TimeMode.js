// Режим игры "На время"
import { BaseGameMode } from './BaseGameMode.js';

export class TimeMode extends BaseGameMode {
  constructor(countriesAPI, timeLimit = 30) {
    super(countriesAPI);
    this.timeLimit = timeLimit; // время в секундах
    this.timeLeft = timeLimit;
    this.timer = null;
    this.isGameActive = false;
  }

  async startGame() {
    this.setState('Loading');

    try {
      if (!this.countriesAPI.isReady()) {
        await this.countriesAPI.loadCountries();
      }

      this.resetScore();
      this.timeLeft = this.timeLimit;
      this.isGameActive = false; // Не запускаем сразу

      this.setState('Ready'); // Готов к старту
    } catch (error) {
      console.error('Error starting time mode game:', error);
      this.setState('Idle');
      throw error;
    }
  }

  async beginGame() {
    this.isGameActive = true;
    await this.generateQuestion();
    this.startTimer();
  }

  resetGame() {
    this.stopTimer();
    this.resetScore();
    this.state.currentQuestion = null;
    this.state.options = [];
    this.state.correctAnswer = null;
    this.state.isAnswered = false;
    this.timeLeft = this.timeLimit;
    this.isGameActive = false;
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
      console.error('Error generating time mode question:', error);
      throw error;
    }
  }

  answerQuestion(selectedCountry) {
    if (this.state.isAnswered || !this.state.correctAnswer || !this.isGameActive) {
      return null;
    }

    this.state.isAnswered = true;
    this.state.score.total++;

    const isCorrect = selectedCountry.name === this.state.correctAnswer.name;

    if (isCorrect) {
      this.state.score.correct++;
    } else {
      this.state.score.incorrect++;
      // Штраф за неправильный ответ - отнимаем 2 секунды
      this.timeLeft = Math.max(0, this.timeLeft - 2);
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
    if (!this.isGameActive) {
      return false;
    }

    // Если время еще есть, генерируем новый вопрос
    if (this.timeLeft > 0) {
      this.generateQuestion();
      return true;
    } else {
      // Время закончилось
      this.endGame();
      return false;
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.isGameActive) {
        this.timeLeft--;

        // Уведомляем слушателей об обновлении времени
        this.notifyListeners();

        if (this.timeLeft <= 0) {
          this.endGame();
        }
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  endGame() {
    this.stopTimer();
    this.isGameActive = false;
    this.setState('Idle');
  }

  getTimeLeft() {
    return this.timeLeft;
  }

  getTimeLimit() {
    return this.timeLimit;
  }

  isGameActive() {
    return this.isGameActive;
  }

  getGameStats() {
    const totalCountries = this.countriesAPI.getCountries().length;
    return {
      score: this.getScore(),
      timeLeft: this.timeLeft,
      timeLimit: this.timeLimit,
      totalCountries,
      percentage:
        this.state.score.total > 0
          ? Math.round((this.state.score.correct / this.state.score.total) * 100)
          : 0,
      isFinished: !this.isGameActive,
      mode: 'time',
    };
  }
}
