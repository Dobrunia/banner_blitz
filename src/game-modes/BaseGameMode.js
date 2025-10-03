// Базовый класс для игровых режимов
export class BaseGameMode {
  constructor(countriesAPI) {
    this.countriesAPI = countriesAPI;
    this.state = {
      currentState: 'Idle',
      score: { correct: 0, incorrect: 0, total: 0 },
      currentQuestion: null,
      options: [],
      correctAnswer: null,
      isAnswered: false,
    };
    this.listeners = [];
    this.usedCountries = new Set(); // Отслеживаем использованные страны
  }

  setState(newState) {
    this.state.currentState = newState;
    this.notifyListeners();
  }

  getState() {
    return { ...this.state };
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.getState()));
  }

  resetScore() {
    this.state.score = { correct: 0, incorrect: 0, total: 0 };
    this.usedCountries.clear();
  }

  getRandomCountryAvoidingUsed() {
    const allCountries = this.countriesAPI.getCountries();

    // Если все страны использованы, сбрасываем список
    if (this.usedCountries.size >= allCountries.length) {
      this.usedCountries.clear();
    }

    // Получаем случайную страну, которую еще не использовали
    let attempts = 0;
    const maxAttempts = 100;
    let country;

    do {
      country = this.countriesAPI.getRandomCountry();
      attempts++;
    } while (this.usedCountries.has(country.name) && attempts < maxAttempts);

    // Отмечаем страну как использованную
    this.usedCountries.add(country.name);
    return country;
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

  isReady() {
    return this.countriesAPI.isReady();
  }

  // Абстрактные методы, которые должны быть реализованы в дочерних классах
  async startGame() {
    throw new Error('startGame method must be implemented');
  }

  resetGame() {
    throw new Error('resetGame method must be implemented');
  }

  answerQuestion(selectedCountry) {
    throw new Error('answerQuestion method must be implemented');
  }

  nextQuestion() {
    throw new Error('nextQuestion method must be implemented');
  }

  getGameStats() {
    throw new Error('getGameStats method must be implemented');
  }
}
