// UI management and DOM manipulation
export class UI {
  constructor(gameLogic = null) {
    this.gameLogic = gameLogic;
    this.elements = {
      // Sidebar
      burger: document.getElementById('burger'),
      sidebar: document.getElementById('sidebar'),
      overlay: document.getElementById('overlay'),
      closeSidebar: document.getElementById('close-sidebar'),
      navGame: document.getElementById('nav-game'),

      // Game elements
      gameScreen: document.getElementById('game-screen'),
      loadingScreen: document.getElementById('loading-screen'),
      resetBtn: document.getElementById('reset-btn'),
      score: document.getElementById('score'),
      flag: document.getElementById('flag'),
      question: document.getElementById('question'),
      options: document.getElementById('options'),

      // Modal
      modal: document.getElementById('modal'),
      modalTitle: document.getElementById('modal-title'),
      modalText: document.getElementById('modal-text'),
      modalClose: document.getElementById('modal-close'),
    };

    this.isSidebarOpen = false;
    this.init();
  }

  init() {
    this.setupSidebar();
    this.setupGame();
    this.setupModal();
  }

  // Sidebar management
  setupSidebar() {
    this.elements.burger.addEventListener('click', () => this.toggleSidebar());
    this.elements.closeSidebar.addEventListener('click', () => this.closeSidebar());
    this.elements.overlay.addEventListener('click', () => this.closeSidebar());
    this.elements.navGame.addEventListener('click', () => {
      this.closeSidebar();
      this.showGame();
    });
  }

  toggleSidebar() {
    if (this.isSidebarOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    this.elements.sidebar.classList.add('open');
    this.elements.overlay.classList.add('active');
    this.isSidebarOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeSidebar() {
    this.elements.sidebar.classList.remove('open');
    this.elements.overlay.classList.remove('active');
    this.isSidebarOpen = false;
    document.body.style.overflow = '';
  }

  // Game UI
  setupGame() {
    this.elements.resetBtn.addEventListener('click', () => {
      this.dispatchEvent('resetGame');
    });
  }

  showGame() {
    this.elements.gameScreen.style.display = 'flex';
    this.elements.loadingScreen.style.display = 'none';
  }

  showLoading() {
    this.elements.gameScreen.style.display = 'none';
    this.elements.loadingScreen.style.display = 'flex';
  }

  updateScore(score) {
    const totalCountries = this.gameLogic ? this.gameLogic.countriesAPI.getCountries().length : 0;
    this.elements.score.textContent = `${score.correct}/${totalCountries}`;
  }

  displayQuestion(question, options) {
    // Check if question exists
    if (!question || !question.flag_url) {
      console.error('Invalid question data:', question);
      return;
    }

    // Set flag image with fallback handling
    this.elements.flag.alt = `Флаг ${question.name}`;
    this.elements.flag.style.display = 'block';

    // Try to load the flag with multiple fallback strategies
    this.loadFlagWithFallback(question);

    // Clear and create options
    this.elements.options.innerHTML = '';

    options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.textContent = option.name;
      button.dataset.country = option.name;

      button.addEventListener('click', () => {
        // Only allow answering if game is in Question state
        if (this.gameLogic && this.gameLogic.getState().currentState === 'Question') {
          this.dispatchEvent('answerQuestion', option);
        }
      });

      this.elements.options.appendChild(button);
    });
  }

  showResult(result) {
    const { isCorrect, correctAnswer, selectedAnswer } = result;

    // Remove previous color classes
    this.elements.modalTitle.classList.remove('correct', 'incorrect');

    this.elements.modalTitle.textContent = isCorrect ? 'Правильно!' : 'Неправильно!';
    this.elements.modalText.textContent = isCorrect
      ? `Отлично! Это действительно ${correctAnswer.name}.`
      : `Правильный ответ: ${correctAnswer.name}.`;

    // Add color class based on result
    if (isCorrect) {
      this.elements.modalTitle.classList.add('correct');
    } else {
      this.elements.modalTitle.classList.add('incorrect');
    }

    this.elements.modal.classList.add('show');
  }

  hideResult() {
    this.elements.modal.classList.remove('show');
  }

  showGameFinished(stats) {
    const { score, percentage, totalCountries } = stats;

    this.elements.modalTitle.textContent = 'Игра завершена!';
    this.elements.modalText.innerHTML = `
      <p>Правильных ответов: ${score.correct} из ${totalCountries}</p>
      <p>Неправильных ответов: ${score.incorrect}</p>
      <p>Процент правильных ответов: ${percentage}%</p>
    `;

    this.elements.modal.classList.add('show');
  }

  // Modal management
  setupModal() {
    this.elements.modalClose.addEventListener('click', () => {
      this.hideResult();
      this.dispatchEvent('nextQuestion');
    });

    this.elements.modal.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) {
        this.hideResult();
        this.dispatchEvent('nextQuestion');
      }
    });
  }

  // Event system
  dispatchEvent(eventName, data = null) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }

  // Utility methods
  addClass(element, className) {
    if (element) element.classList.add(className);
  }

  removeClass(element, className) {
    if (element) element.classList.remove(className);
  }

  toggleClass(element, className) {
    if (element) element.classList.toggle(className);
  }

  setText(element, text) {
    if (element) element.textContent = text;
  }

  setHTML(element, html) {
    if (element) element.innerHTML = html;
  }

  // Flag loading with fallback strategies
  loadFlagWithFallback(question) {
    const flagElement = this.elements.flag;
    let attempts = 0;
    const maxAttempts = 3;

    const tryLoadFlag = () => {
      attempts++;

      if (attempts === 1) {
        // First attempt: original URL
        flagElement.src = question.flag_url;
      } else if (attempts === 2) {
        // Second attempt: try SVG version if available
        flagElement.src = question.flag_svg || question.flag_url;
      } else if (attempts === 3) {
        // Third attempt: show placeholder with country name
        this.showFlagPlaceholder(question.name);
        return;
      }

      flagElement.onload = () => {
        console.log(`Flag loaded successfully for ${question.name} (attempt ${attempts})`);
      };

      flagElement.onerror = () => {
        console.warn(`Failed to load flag for ${question.name} (attempt ${attempts})`);
        if (attempts < maxAttempts) {
          setTimeout(tryLoadFlag, 100); // Small delay before retry
        } else {
          this.showFlagPlaceholder(question.name);
        }
      };
    };

    tryLoadFlag();
  }

  showFlagPlaceholder(countryName) {
    const flagElement = this.elements.flag;
    flagElement.style.display = 'flex';
    flagElement.style.alignItems = 'center';
    flagElement.style.justifyContent = 'center';
    flagElement.style.backgroundColor = '#f0f0f0';
    flagElement.style.border = '2px dashed #ccc';
    flagElement.style.color = '#666';
    flagElement.style.fontSize = '18px';
    flagElement.style.fontWeight = 'bold';
    flagElement.style.textAlign = 'center';
    flagElement.style.padding = '20px';
    flagElement.innerHTML = `Флаг недоступен<br><small>${countryName}</small>`;
  }
}
