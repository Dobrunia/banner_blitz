// Main application entry point
import './style.css';
import { CountriesAPI } from './countries.js';
import { GameLogic } from './gameLogic.js';
import { UI } from './ui.js';

class FlagQuizApp {
  constructor() {
    this.countriesAPI = new CountriesAPI();
    this.gameLogic = new GameLogic(this.countriesAPI);
    this.ui = new UI(this.gameLogic);

    this.init();
  }

  async init() {
    console.log('Initializing Flag Quiz App...');

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
    const result = this.gameLogic.answerQuestion(selectedCountry);
    this.ui.showResult(result);
  }

  nextQuestion() {
    const stats = this.gameLogic.getGameStats();

    if (stats.isFinished) {
      this.ui.showGameFinished(stats);
    } else {
      this.gameLogic.nextQuestion();
    }
  }

  handleGameState(state) {
    console.log('Game state changed:', state.currentState);

    switch (state.currentState) {
      case 'Loading':
        this.ui.showLoading();
        break;

      case 'Question':
        this.ui.showGame();
        this.ui.updateScore(state.score);
        if (state.currentQuestion && state.options) {
          this.ui.displayQuestion(state.currentQuestion, state.options);
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

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
