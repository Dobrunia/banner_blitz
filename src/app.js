// Main application entry point
import './style.css';
import { CountriesAPI } from './countries.js';
import { GameLogic, FlagsGameLogic } from './gameLogic.js';
import { UI } from './ui.js';

class FlagQuizApp {
  constructor() {
    this.countriesAPI = new CountriesAPI();
    this.gameLogic = new GameLogic(this.countriesAPI);
    this.flagsGameLogic = new FlagsGameLogic(this.countriesAPI);
    this.ui = new UI(this.gameLogic);
    this.currentMode = 'flag'; // 'flag' или 'flags'

    this.init();
  }

  async init() {
    // Set up event listeners
    this.setupEventListeners();

    // Set up game state listener
    this.gameLogic.addListener((state) => this.handleGameState(state));

    // Start the game
    try {
      await this.startGame();
    } catch (error) {
      console.error('Failed to start game:', error);
      this.showError('Не удалось загрузить данные. Проверьте подключение к интернету.');
    }
  }

  setupEventListeners() {
    // Game events
    document.addEventListener('resetGame', () => this.resetGame());
    document.addEventListener('answerQuestion', (e) => this.answerQuestion(e.detail));
    document.addEventListener('nextQuestion', () => this.nextQuestion());

    // Mode switching
    document.addEventListener('switchToFlagMode', () => this.switchToFlagMode());
    document.addEventListener('switchToFlagsMode', () => this.switchToFlagsMode());
    document.addEventListener('resetAllGames', () => this.resetAllGames());

    // Touch events for mobile
    document.addEventListener(
      'touchstart',
      (e) => {
        // Prevent zoom on double tap
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  async startGame() {
    this.ui.showLoading();
    await this.gameLogic.startGame();
  }

  async resetGame() {
    this.gameLogic.resetGame();
    // Wait a bit for UI to update, then start new game
    setTimeout(async () => {
      try {
        await this.startGame();
      } catch (error) {
        console.error('Failed to restart game:', error);
        this.showError('Не удалось перезапустить игру.');
      }
    }, 100);
  }

  answerQuestion(selectedCountry) {
    const gameLogic = this.currentMode === 'flags' ? this.flagsGameLogic : this.gameLogic;
    const result = gameLogic.answerQuestion(selectedCountry);
    this.ui.showResult(result);
  }

  nextQuestion() {
    if (this.currentMode === 'flags') {
      // Бесконечный режим для флагов
      this.flagsGameLogic.nextQuestion();
    } else {
      // Обычный режим для флага
      const stats = this.gameLogic.getGameStats();
      if (stats.isFinished) {
        this.ui.showGameFinished(stats);
      } else {
        this.gameLogic.nextQuestion();
      }
    }
  }

  handleGameState(state) {
    switch (state.currentState) {
      case 'Loading':
        this.ui.showLoading();
        break;

      case 'Question':
        if (this.currentMode === 'flag') {
          this.ui.showGame();
          this.ui.updateScore(state.score);
          if (state.currentQuestion && state.options) {
            this.ui.displayQuestion(state.currentQuestion, state.options);
          }
        } else if (this.currentMode === 'flags') {
          this.ui.showFlagsGame();
          this.ui.updateFlagsScore(state.score);
          if (state.options) {
            this.ui.displayFlagsQuestion(state.currentQuestion, state.options);
          }
        }
        break;

      case 'Result':
        // Result is handled by the answerQuestion method
        break;

      case 'Idle':
        // Game finished or not started
        break;

      default:
        console.warn('Unknown game state:', state.currentState);
    }
  }

  switchToFlagMode() {
    this.currentMode = 'flag';
    this.ui.gameLogic = this.gameLogic;
    this.gameLogic.addListener((state) => this.handleGameState(state));
    this.ui.setActiveNavItem(this.ui.elements.navGame);
    this.ui.showGame();
    this.startGame();
  }

  switchToFlagsMode() {
    this.currentMode = 'flags';
    this.ui.gameLogic = this.flagsGameLogic;
    this.flagsGameLogic.addListener((state) => this.handleGameState(state));
    this.ui.setActiveNavItem(this.ui.elements.navFlags);
    this.ui.showFlagsGame();
    // Запускаем игру в режиме флагов
    this.startFlagsGame();
  }

  async startFlagsGame() {
    this.ui.showLoading();
    await this.flagsGameLogic.startGame();
  }

  resetAllGames() {
    // Сбрасываем обе игры
    this.gameLogic.resetGame();
    this.flagsGameLogic.resetGame();

    // Перезапускаем текущую игру
    if (this.currentMode === 'flag') {
      this.startGame();
    } else if (this.currentMode === 'flags') {
      this.startFlagsGame();
    }
  }

  showError(message) {
    // Create a simple error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <div class="error-content">
        <h3>Ошибка</h3>
        <p>${message}</p>
        <button onclick="location.reload()">Перезагрузить</button>
      </div>
    `;

    document.body.appendChild(errorDiv);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FlagQuizApp();
});
