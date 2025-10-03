// Main application with game modes support
import './style.css';
import { CountriesAPI } from './countries.js';
import { TimeMode, SurvivalMode, ClassicMode, FlagsMode, RegionMode } from './game-modes/index.js';
import { UI } from './ui.js';

class FlagQuizAppModes {
  constructor() {
    this.countriesAPI = new CountriesAPI();
    this.gameModes = {
      time: new TimeMode(this.countriesAPI, 30), // 30 секунд
      survival: new SurvivalMode(this.countriesAPI),
      classic: new ClassicMode(this.countriesAPI),
      flags: new FlagsMode(this.countriesAPI),
      region: new RegionMode(this.countriesAPI),
    };
    this.currentMode = 'classic'; // по умолчанию классический режим
    this.ui = new UI(this.gameModes[this.currentMode]);

    this.init();
  }

  async init() {
    // Set up event listeners
    this.setupEventListeners();

    // Set up game state listener for current mode
    this.gameModes[this.currentMode].addListener((state) => {
      this.handleGameState(state);
      // Дополнительно обновляем счетчик для режима "На время"
      if (this.currentMode === 'time') {
        this.updateScore();
      }
    });

    // Start the game
    try {
      await this.startGame();
    } catch (error) {
      console.error('Failed to start game:', error);
      this.showError('Не удалось загрузить данные.');
    }
  }

  setupEventListeners() {
    // Game events
    document.addEventListener('resetGame', () => this.resetGame());
    document.addEventListener('answerQuestion', (e) => this.answerQuestion(e.detail));
    document.addEventListener('nextQuestion', () => this.nextQuestion());
    document.addEventListener('beginGame', () => this.beginGame());

    // Mode switching
    document.addEventListener('switchToClassicMode', () => this.switchToMode('classic'));
    document.addEventListener('switchToTimeMode', () => this.switchToMode('time'));
    document.addEventListener('switchToSurvivalMode', () => this.switchToMode('survival'));
    document.addEventListener('switchToFlagsMode', () => this.switchToMode('flags'));
    document.addEventListener('switchToRegionMode', () => this.switchToMode('region'));
    document.addEventListener('selectRegion', (e) => this.selectRegion(e.detail));
    document.addEventListener('resetAllGames', () => this.resetAllGames());

    // Touch events for mobile
    document.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  async startGame() {
    this.ui.showLoading();
    await this.gameModes[this.currentMode].startGame();
  }

  async beginGame() {
    await this.gameModes[this.currentMode].beginGame();
    // Показываем сердечки для режима выживания после начала игры
    if (this.currentMode === 'survival') {
      this.ui.showLivesIndicator();
    }
  }

  selectRegion(region) {
    if (this.currentMode === 'region') {
      this.gameModes[this.currentMode].selectRegion(region);
    }
  }

  async resetGame() {
    this.gameModes[this.currentMode].resetGame();
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
    const result = this.gameModes[this.currentMode].answerQuestion(selectedCountry);
    if (result) {
      this.ui.showResult(result);
    }
  }

  nextQuestion() {
    const stats = this.gameModes[this.currentMode].getGameStats();

    if (stats.isFinished) {
      this.ui.showGameFinished(stats);
    } else {
      this.gameModes[this.currentMode].nextQuestion();
    }
  }

  handleGameState(state) {
    switch (state.currentState) {
      case 'Loading':
        this.ui.showLoading();
        break;

      case 'Ready':
        this.ui.showReadyScreen();
        this.updateScore();
        break;

      case 'RegionSelection':
        this.ui.showRegionSelection();
        break;

      case 'Question':
        if (this.currentMode === 'flags') {
          this.ui.showFlagsGame();
          this.updateScore();
          if (state.currentQuestion && state.options) {
            this.ui.displayFlagsQuestion(state.currentQuestion, state.options);
          }
        } else {
          this.ui.showGame();
          this.updateScore();
          if (state.currentQuestion && state.options) {
            this.ui.displayQuestion(state.currentQuestion, state.options);
          }
          // Показываем сердечки для режима выживания
          if (this.currentMode === 'survival') {
            this.ui.showLivesIndicator();
          }
        }
        break;

      case 'Result':
        // Result is handled by the answerQuestion method
        this.updateScore(); // Обновляем счетчик и в состоянии Result
        break;

      case 'Idle':
        // Game finished or not started
        break;

      default:
        console.warn('Unknown game state:', state.currentState);
    }
  }

  updateScore() {
    const stats = this.gameModes[this.currentMode].getGameStats();
    const score = stats.score;

    // Обновляем счет в зависимости от режима
    if (this.currentMode === 'time') {
      this.ui.elements.score.innerHTML = `
        <span style="color: #4CAF50;">${score.correct}</span>/${stats.timeLeft}с
      `;
    } else if (this.currentMode === 'survival') {
      // Показываем только правильные ответы для режима выживания
      this.ui.elements.score.textContent = `${score.correct}`;
    } else if (this.currentMode === 'flags') {
      this.ui.elements.flagsScore.innerHTML = `
        <span style="color: #4CAF50;">${score.correct}</span>/<span>${score.total}</span>
      `;
    } else {
      // classic mode
      this.ui.elements.score.textContent = `${score.correct}/${stats.totalCountries}`;
    }
  }

  switchToMode(mode) {
    if (!this.gameModes[mode]) {
      console.error('Unknown game mode:', mode);
      return;
    }

    this.currentMode = mode;
    this.ui.gameLogic = this.gameModes[mode];
    this.ui.currentMode = mode; // Обновляем режим в UI

    // Скрываем сердечки при переключении режимов
    this.ui.hideLivesIndicator();

    this.gameModes[mode].addListener((state) => {
      this.handleGameState(state);
      // Дополнительно обновляем счетчик для режима "На время"
      if (mode === 'time') {
        this.updateScore();
      }
      // Показываем сердечки для режима выживания
      if (mode === 'survival') {
        this.ui.showLivesIndicator();
      }
    });

    // Обновляем UI в зависимости от режима
    if (mode === 'classic') {
      this.ui.setActiveNavItem(this.ui.elements.navClassic);
    } else if (mode === 'time') {
      this.ui.setActiveNavItem(this.ui.elements.navTime);
    } else if (mode === 'survival') {
      this.ui.setActiveNavItem(this.ui.elements.navSurvival);
    } else if (mode === 'flags') {
      this.ui.setActiveNavItem(this.ui.elements.navFlags);
    } else if (mode === 'region') {
      this.ui.setActiveNavItem(this.ui.elements.navRegion);
    }

    this.startGame();
  }

  resetAllGames() {
    // Сбрасываем все режимы
    Object.values(this.gameModes).forEach((mode) => mode.resetGame());

    // Перезапускаем текущий режим
    this.startGame();
  }

  showError(message) {
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
  new FlagQuizAppModes();
});
