// Game logic and state management
export class GameLogic {
  constructor(countriesAPI) {
    this.countriesAPI = countriesAPI;
    this.state = {
      currentState: 'Idle', // Idle, Loading, Question, Answering, Result, Next
      score: { correct: 0, incorrect: 0, total: 0 },
      currentQuestion: null,
      options: [],
      correctAnswer: null,
      isAnswered: false,
    };

    this.listeners = [];
  }

  // State management
  setState(newState) {
    this.state.currentState = newState;
    this.notifyListeners();
  }

  getState() {
    return { ...this.state };
  }

  // Event system
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.getState()));
  }

  // Game actions
  async startGame() {
    this.setState('Loading');

    try {
      if (!this.countriesAPI.isReady()) {
        await this.countriesAPI.loadCountries();
      }

      this.resetScore();
      await this.generateQuestion();
    } catch (error) {
      console.error('Error starting game:', error);
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
    this.setState('Loading');
  }

  resetScore() {
    this.state.score = { correct: 0, incorrect: 0, total: 0 };
    // Don't notify listeners here, it will be called when question is generated
  }

  async generateQuestion() {
    try {
      // Get random country
      const correctCountry = this.countriesAPI.getRandomCountry();

      // Get 3 wrong options
      const wrongOptions = this.countriesAPI.getRandomCountries(3, correctCountry);

      // Create options array and shuffle
      this.state.options = [correctCountry, ...wrongOptions].sort(() => Math.random() - 0.5);

      this.state.currentQuestion = correctCountry;
      this.state.correctAnswer = correctCountry;
      this.state.isAnswered = false;

      this.setState('Question');
    } catch (error) {
      console.error('Error generating question:', error);
      throw error;
    }
  }

  answerQuestion(selectedCountry) {
    if (this.state.isAnswered || !this.state.correctAnswer) return;

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
    if (this.state.score.total >= this.countriesAPI.getCountries().length) {
      this.setState('Idle');
      return false; // Game finished
    }

    this.generateQuestion();
    return true; // Continue game
  }

  getScore() {
    return { ...this.state.score };
  }

  getCurrentQuestion() {
    return this.state.currentQuestion;
  }

  getOptions() {
    return [...this.state.options];
  }

  isGameFinished() {
    return this.state.score.total >= this.countriesAPI.getCountries().length;
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
      isFinished: this.isGameFinished(),
    };
  }
}
