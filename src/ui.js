// UI management and DOM manipulation
export class UI {
  constructor(gameLogic = null) {
    this.gameLogic = gameLogic;
    this.currentMode = 'flag';
    this.isAnswered = false;
    this.isAnswerShown = false;
    this.elements = {
      // Sidebar
      burger: document.getElementById('burger'),
      sidebar: document.getElementById('sidebar'),
      overlay: document.getElementById('overlay'),
      // closeSidebar: document.getElementById('close-sidebar'),
      navGame: document.getElementById('nav-game'),
      navFlags: document.getElementById('nav-flags'),
      navReset: document.getElementById('nav-reset'),

      // Game elements
      gameScreen: document.getElementById('game-screen'),
      flagsScreen: document.getElementById('flags-screen'),
      loadingScreen: document.getElementById('loading-screen'),
      score: document.getElementById('score'),
      flagsScore: document.getElementById('flags-score'),
      flag: document.getElementById('flag'),
      question: document.getElementById('question'),
      options: document.getElementById('options'),
      // Flags game elements
      flagsQuestion: document.getElementById('flags-question'),
      flagsContainer: document.getElementById('flags-container'),
      flagsOptions: document.getElementById('flags-options'),

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
    // this.elements.closeSidebar.addEventListener('click', () => this.closeSidebar());
    this.elements.overlay.addEventListener('click', () => this.closeSidebar());
    this.elements.navGame.addEventListener('click', () => {
      this.setActiveNavItem(this.elements.navGame);
      this.closeSidebar();
      this.dispatchEvent('switchToFlagMode');
    });
    this.elements.navFlags.addEventListener('click', () => {
      this.setActiveNavItem(this.elements.navFlags);
      this.closeSidebar();
      this.dispatchEvent('switchToFlagsMode');
    });
    this.elements.navReset.addEventListener('click', () => {
      this.closeSidebar();
      this.dispatchEvent('resetAllGames');
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

  setActiveNavItem(activeItem) {
    // Убираем active со всех кнопок
    this.elements.navGame.classList.remove('active');
    this.elements.navFlags.classList.remove('active');

    // Добавляем active к выбранной кнопке
    activeItem.classList.add('active');
  }

  // Game UI
  setupGame() {
    // Обработчики кнопок перенесены в меню
  }

  showGame() {
    this.elements.gameScreen.style.display = 'flex';
    this.elements.flagsScreen.style.display = 'none';
    this.elements.loadingScreen.style.display = 'none';
  }

  showFlagsGame() {
    this.elements.flagsScreen.style.display = 'flex';
    this.elements.gameScreen.style.display = 'none';
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

    // Сбрасываем флаг показа ответа
    this.isAnswerShown = false;

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
        // Если ответ уже показан - переходим к следующему вопросу
        if (this.isAnswerShown) {
          this.dispatchEvent('nextQuestion');
          return;
        }

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
    this.isAnswerShown = true;

    if (this.currentMode === 'flags') {
      // Для режима флагов - подсвечиваем флаги
      this.highlightFlags(result);
    } else {
      // Для обычного режима - подсвечиваем кнопки ответов
      this.highlightAnswerButtons(result);
    }
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

  // Flags game methods
  displayFlagsQuestion(question, options) {
    if (!question || !options || options.length !== 4) {
      console.error('Invalid flags question data:', question, options);
      return;
    }

    // Сбрасываем состояние ответа
    this.isAnswered = false;

    // Set question text - показываем название страны
    this.elements.flagsQuestion.textContent = question.name;

    // Clear and create flags
    this.elements.flagsContainer.innerHTML = '';

    options.forEach((option, index) => {
      const flagDiv = document.createElement('div');
      flagDiv.className = 'flag-item';
      flagDiv.dataset.country = option.name;

      const flagImg = document.createElement('img');
      flagImg.className = 'flag-img';
      flagImg.src = option.flag_url;
      flagImg.alt = `Флаг ${option.name}`;

      // Add error handling for flag loading
      flagImg.onerror = () => {
        console.warn(`Failed to load flag for ${option.name}`);
        flagImg.style.display = 'none';
      };

      flagImg.onload = () => {
        flagImg.style.display = 'block';
      };

      flagDiv.appendChild(flagImg);

      // Добавляем обработчик клика на флаг
      flagDiv.addEventListener('click', () => {
        if (!this.isAnswered) {
          this.isAnswered = true;
          this.dispatchEvent('answerQuestion', option);
        } else {
          // Если ответ уже показан - переходим к следующему вопросу
          this.dispatchEvent('nextQuestion');
        }
      });

      this.elements.flagsContainer.appendChild(flagDiv);
    });

    // Убираем кнопки с названиями - пользователь выбирает флаги напрямую
    this.elements.flagsOptions.innerHTML = '';
  }

  updateFlagsScore(score) {
    // Показываем правильные ответы (зеленым) / всего попыток
    this.elements.flagsScore.innerHTML = `<span style="color: #4CAF50;">${score.correct}</span>/<span>${score.total}</span>`;
  }

  highlightFlags(result) {
    const { isCorrect, correctAnswer, selectedAnswer } = result;
    const flagItems = this.elements.flagsContainer.querySelectorAll('.flag-item');

    flagItems.forEach((flagItem) => {
      const countryName = flagItem.dataset.country;

      if (countryName === correctAnswer.name) {
        // Правильный ответ - зеленый
        flagItem.style.border = '4px solid #4CAF50';
        flagItem.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.5)';
      } else if (countryName === selectedAnswer.name && !isCorrect) {
        // Выбранный неправильный ответ - красный
        flagItem.style.border = '4px solid #f44336';
        flagItem.style.boxShadow = '0 0 20px rgba(244, 67, 54, 0.5)';
      } else {
        // Остальные флаги - серый
        flagItem.style.border = '4px solid #9e9e9e';
        flagItem.style.boxShadow = '0 0 10px rgba(158, 158, 158, 0.3)';
        flagItem.style.opacity = '0.6';
      }
    });
  }

  highlightAnswerButtons(result) {
    const { isCorrect, correctAnswer, selectedAnswer } = result;
    const buttons = document.querySelectorAll('.option-btn');

    buttons.forEach((button) => {
      const countryName = button.dataset.country;

      // Сбрасываем стили
      button.classList.remove('correct-answer', 'incorrect-answer', 'other-answer');

      if (countryName === correctAnswer.name) {
        // Правильный ответ - зеленый
        button.classList.add('correct-answer');
      } else if (countryName === selectedAnswer.name) {
        // Выбранный неправильный ответ - красный
        button.classList.add('incorrect-answer');
      } else {
        // Остальные кнопки - серый
        button.classList.add('other-answer');
      }

      // Делаем кнопки кликабельными для следующего вопроса
      button.style.cursor = 'pointer';
    });
  }
}
