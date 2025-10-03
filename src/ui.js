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
      navClassic: document.getElementById('nav-classic'),
      navTime: document.getElementById('nav-time'),
      navSurvival: document.getElementById('nav-survival'),
      navFlags: document.getElementById('nav-flags'),
      navRegion: document.getElementById('nav-region'),
      navLearning: document.getElementById('nav-learning'),
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
    };

    this.isSidebarOpen = false;
    this.init();
  }

  init() {
    this.setupSidebar();
    this.setupGame();
  }

  // Sidebar management
  setupSidebar() {
    this.elements.burger.addEventListener('click', () => this.toggleSidebar());
    // this.elements.closeSidebar.addEventListener('click', () => this.closeSidebar());
    this.elements.overlay.addEventListener('click', () => this.closeSidebar());
    this.elements.navClassic.addEventListener('click', () => {
      this.setActiveNavItem(this.elements.navClassic);
      this.closeSidebar();
      this.dispatchEvent('switchToClassicMode');
    });
    this.elements.navTime.addEventListener('click', () => {
      this.setActiveNavItem(this.elements.navTime);
      this.closeSidebar();
      this.dispatchEvent('switchToTimeMode');
    });
    this.elements.navSurvival.addEventListener('click', () => {
      this.setActiveNavItem(this.elements.navSurvival);
      this.closeSidebar();
      this.dispatchEvent('switchToSurvivalMode');
    });
    this.elements.navFlags.addEventListener('click', () => {
      this.setActiveNavItem(this.elements.navFlags);
      this.closeSidebar();
      this.dispatchEvent('switchToFlagsMode');
    });
    this.elements.navRegion.addEventListener('click', () => {
      this.setActiveNavItem(this.elements.navRegion);
      this.closeSidebar();
      this.dispatchEvent('switchToRegionMode');
    });
    this.elements.navLearning.addEventListener('click', () => {
      this.setActiveNavItem(this.elements.navLearning);
      this.closeSidebar();
      this.dispatchEvent('switchToLearningMode');
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
    this.elements.navClassic.classList.remove('active');
    this.elements.navTime.classList.remove('active');
    this.elements.navSurvival.classList.remove('active');
    this.elements.navFlags.classList.remove('active');
    this.elements.navRegion.classList.remove('active');
    this.elements.navLearning.classList.remove('active');

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

    // Очищаем режим обучения
    this.cleanupLearningMode();

    // Скрываем сердечки если не режим выживания
    if (this.currentMode !== 'survival') {
      this.hideLivesIndicator();
    }
  }

  showFlagsGame() {
    this.elements.flagsScreen.style.display = 'flex';
    this.elements.gameScreen.style.display = 'none';
    this.elements.loadingScreen.style.display = 'none';

    // Очищаем режим обучения
    this.cleanupLearningMode();

    // Скрываем сердечки в режиме флагов
    this.hideLivesIndicator();
  }

  showLoading() {
    this.elements.gameScreen.style.display = 'none';
    this.elements.loadingScreen.style.display = 'flex';

    // Скрываем сердечки при загрузке
    this.hideLivesIndicator();
  }

  showReadyScreen() {
    this.elements.gameScreen.style.display = 'flex';
    this.elements.flagsScreen.style.display = 'none';
    this.elements.loadingScreen.style.display = 'none';

    // Показываем только кнопку старт по центру
    this.elements.question.style.display = 'none';
    this.elements.flag.style.display = 'none';

    // Определяем правила в зависимости от режима
    let rulesText = '';
    if (this.currentMode === 'time') {
      rulesText = `
        <div class="game-rules">
          <h3>⏰ Режим "На время"</h3>
          <p>• Угадайте как можно больше флагов за 30 секунд</p>
          <p>• За неправильный ответ отнимается 2 секунды</p>
        </div>
      `;
    }

    // Создаем контейнер для центрирования кнопки
    this.elements.options.innerHTML = `
        <div class="start-container">
          ${rulesText}
          <button class="start-btn" onclick="document.dispatchEvent(new CustomEvent('beginGame'))">
            🚀 Начать игру
          </button>
        </div>
      `;
  }

  updateScore(score) {
    if (!this.gameLogic) return;

    const stats = score || this.gameLogic.getGameStats();
    let scoreText = '';

    if (this.currentMode === 'time') {
      // Для режима на время показываем время
      const timeLeft = stats.timeLeft || 0;
      scoreText = `${stats.score.correct}/${timeLeft}с`;

      // Обновляем только если изменился текст (избегаем мигания)
      if (this.elements.score.textContent !== scoreText) {
        this.elements.score.textContent = scoreText;
      }
    } else {
      if (this.currentMode === 'survival') {
        // Для режима выживания показываем только правильные ответы и жизни
        const lives = stats.lives || 3;
        scoreText = `${stats.score.correct} | ❤️ ${lives}`;
      } else if (this.currentMode === 'flags') {
        // Для режима 4 флага показываем правильные/всего
        const total =
          this.gameLogic && this.gameLogic.countriesAPI
            ? this.gameLogic.countriesAPI.getCountries().length
            : 0;
        scoreText = `${stats.score.correct}/${total}`;
      } else if (this.currentMode === 'region') {
        // Для режима регионов показываем правильные/всего в регионе
        if (stats.selectedRegion && stats.totalCountries) {
          scoreText = `${stats.score.correct}/${stats.totalCountries}`;
        } else {
          scoreText = `${stats.score.correct}/0`;
        }
      } else {
        // Для классического режима показываем правильные/всего стран
        const totalCountries =
          this.gameLogic && this.gameLogic.countriesAPI
            ? this.gameLogic.countriesAPI.getCountries().length
            : 0;
        scoreText = `${stats.score.correct}/${totalCountries}`;
      }

      this.elements.score.textContent = scoreText;
    }
  }

  // Отдельный метод для обновления только времени (без перерисовки)
  updateTimeOnly(timeLeft, correctAnswers) {
    if (this.currentMode !== 'time') return;

    const scoreText = `${correctAnswers}/${timeLeft}с`;

    // Обновляем только если изменился текст
    if (this.elements.score.textContent !== scoreText) {
      this.elements.score.textContent = scoreText;
    }
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

    // Показываем сердечки для режима выживания
    if (this.currentMode === 'survival') {
      this.showLivesIndicator();
    }

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

    // Обновляем сердечки для режима выживания
    if (this.currentMode === 'survival') {
      this.showLivesIndicator();
    }
  }

  showGameFinished(stats) {
    const { score, percentage, totalCountries } = stats;

    // Создаем модальное окно с результатами
    this.showResultsModal(stats);
  }

  showResultsModal(stats) {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'results-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>🎉 Игра завершена!</h2>
            <button class="modal-close">×</button>
          </div>
          <div class="modal-body">
            ${this.getResultsContent(stats)}
          </div>
           <div class="modal-footer">
             <button class="share-btn">
               📤 Поделиться результатом
             </button>
             <button class="play-again-btn">
               🔄 Играть снова
             </button>
           </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Добавляем обработчики событий
    const shareBtn = modal.querySelector('.share-btn');
    const playAgainBtn = modal.querySelector('.play-again-btn');
    const closeBtn = modal.querySelector('.modal-close');

    shareBtn.addEventListener('click', () => {
      const shareText = this.getShareText(stats);
      // Просто копируем в буфер обмена
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          this.showCustomNotification('Результат скопирован в буфер обмена!');
        })
        .catch(() => {
          // Fallback для старых браузеров
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          this.showCustomNotification('Результат скопирован в буфер обмена!');
        });
    });

    playAgainBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('resetAllGames'));
      modal.remove();
    });

    closeBtn.addEventListener('click', () => {
      modal.remove();
    });
  }

  getResultsContent(stats) {
    const { score, percentage, totalCountries, selectedRegion, timeLeft, lives } = stats;

    if (this.currentMode === 'time') {
      return `
        <div class="results-stats">
          <div class="stat-item">
            <span class="stat-label">⏰ Время:</span>
            <span class="stat-value">30 секунд</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">✅ Правильных ответов:</span>
            <span class="stat-value">${score.correct}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">❌ Неправильных ответов:</span>
            <span class="stat-value">${score.incorrect}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">📊 Точность:</span>
            <span class="stat-value">${percentage}%</span>
          </div>
        </div>
      `;
    } else if (this.currentMode === 'survival') {
      return `
        <div class="results-stats">
          <div class="stat-item">
            <span class="stat-label">✅ Правильных ответов:</span>
            <span class="stat-value">${score.correct}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">❌ Неправильных ответов:</span>
            <span class="stat-value">${score.incorrect}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">📊 Точность:</span>
            <span class="stat-value">${percentage}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">💀 Причина окончания:</span>
            <span class="stat-value">Закончились жизни</span>
          </div>
        </div>
      `;
    } else if (this.currentMode === 'region') {
      return `
        <div class="results-stats">
          <div class="stat-item">
            <span class="stat-label">🌍 Регион:</span>
            <span class="stat-value">${selectedRegion}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">✅ Правильных ответов:</span>
            <span class="stat-value">${score.correct}/${totalCountries}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">❌ Неправильных ответов:</span>
            <span class="stat-value">${score.incorrect}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">📊 Точность:</span>
            <span class="stat-value">${percentage}%</span>
          </div>
        </div>
      `;
    } else if (this.currentMode === 'flags') {
      return `
        <div class="results-stats">
          <div class="stat-item">
            <span class="stat-label">✅ Правильных ответов:</span>
            <span class="stat-value">${score.correct}/${totalCountries}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">❌ Неправильных ответов:</span>
            <span class="stat-value">${score.incorrect}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">📊 Точность:</span>
            <span class="stat-value">${percentage}%</span>
          </div>
        </div>
      `;
    } else {
      // Классический режим
      return `
        <div class="results-stats">
          <div class="stat-item">
            <span class="stat-label">✅ Правильных ответов:</span>
            <span class="stat-value">${score.correct}/${totalCountries}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">❌ Неправильных ответов:</span>
            <span class="stat-value">${score.incorrect}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">📊 Точность:</span>
            <span class="stat-value">${percentage}%</span>
          </div>
        </div>
      `;
    }
  }

  getShareText(stats) {
    const { score, percentage, selectedRegion } = stats;
    const siteUrl = 'https://chatup.su/';

    if (this.currentMode === 'time') {
      return `🎯 Режим "На время": ${score.correct} правильных ответов за 30 секунд! Точность: ${percentage}%\n\nИграй в "Флаги стран": ${siteUrl}`;
    } else if (this.currentMode === 'survival') {
      return `❤️ Режим "На выживание": ${score.correct} правильных ответов! Точность: ${percentage}%\n\nИграй в "Флаги стран": ${siteUrl}`;
    } else if (this.currentMode === 'region') {
      return `🌍 Режим "Регионы" (${selectedRegion}): ${score.correct} правильных ответов! Точность: ${percentage}%\n\nИграй в "Флаги стран": ${siteUrl}`;
    } else if (this.currentMode === 'flags') {
      return `🏳️ Режим "4 Флага": ${score.correct} правильных ответов! Точность: ${percentage}%\n\nИграй в "Флаги стран": ${siteUrl}`;
    } else {
      return `📚 Классический режим: ${score.correct} правильных ответов! Точность: ${percentage}%\n\nИграй в "Флаги стран": ${siteUrl}`;
    }
  }

  showGameResults(stats) {
    // Создаем модальное окно с результатами
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>🎉 Игра завершена!</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="score-display">
            <div class="score-item">
              <span class="score-label">Правильных ответов:</span>
              <span class="score-value">${stats.score.correct}</span>
            </div>
            <div class="score-item">
              <span class="score-label">Неправильных ответов:</span>
              <span class="score-value">${stats.score.incorrect}</span>
            </div>
            <div class="score-item">
              <span class="score-label">Точность:</span>
              <span class="score-value">${stats.percentage}%</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="share-btn">📤 Поделиться результатом</button>
          <button class="play-again-btn">🔄 Играть снова</button>
        </div>
      </div>
    `;

    // Добавляем модальное окно в DOM
    document.body.appendChild(modal);

    // Добавляем обработчики событий
    const shareBtn = modal.querySelector('.share-btn');
    const playAgainBtn = modal.querySelector('.play-again-btn');
    const closeBtn = modal.querySelector('.modal-close');

    shareBtn.addEventListener('click', () => {
      const shareText = this.getShareText(stats);
      // Просто копируем в буфер обмена
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          this.showCustomNotification('Результат скопирован в буфер обмена!');
        })
        .catch(() => {
          // Fallback для старых браузеров
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          this.showCustomNotification('Результат скопирован в буфер обмена!');
        });
    });

    playAgainBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('resetAllGames'));
      modal.remove();
    });

    closeBtn.addEventListener('click', () => {
      modal.remove();
    });

    // Закрытие по клику на overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  showCustomNotification(message) {
    // Создаем кастомное уведомление
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <span class="notification-text">${message}</span>
      </div>
    `;

    // Добавляем стили
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      font-weight: 500;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    // Добавляем в DOM
    document.body.appendChild(notification);

    // Анимация появления
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);

    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
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

  showLivesIndicator() {
    const stats = this.gameLogic.getGameStats();
    const lives = stats.lives || 3;
    const maxLives = stats.maxLives || 3;

    // Создаем индикатор жизней
    let livesHTML = '';
    for (let i = 0; i < maxLives; i++) {
      if (i < lives) {
        livesHTML += '<span class="life-heart">❤️</span>';
      } else {
        livesHTML += '<span class="life-heart lost">❤️</span>';
      }
    }

    // Добавляем индикатор жизней над флагом
    const livesContainer = document.createElement('div');
    livesContainer.className = 'lives-indicator';
    livesContainer.innerHTML = livesHTML;

    // Удаляем старый индикатор если есть
    const oldIndicator = document.querySelector('.lives-indicator');
    if (oldIndicator) {
      oldIndicator.remove();
    }

    // Добавляем новый индикатор в контейнер флага, но ПЕРЕД флагом
    const flagContainer = this.elements.flag.parentNode;
    flagContainer.insertBefore(livesContainer, this.elements.flag);
  }

  hideLivesIndicator() {
    // Удаляем индикатор жизней если он есть
    const oldIndicator = document.querySelector('.lives-indicator');
    if (oldIndicator) {
      oldIndicator.remove();
    }
  }

  showRegionSelection() {
    this.elements.gameScreen.style.display = 'flex';
    this.elements.flagsScreen.style.display = 'none';
    this.elements.loadingScreen.style.display = 'none';

    // Очищаем режим обучения
    this.cleanupLearningMode();

    // Скрываем флаг и вопрос
    this.elements.question.style.display = 'none';
    this.elements.flag.style.display = 'none';

    // Показываем счетчик
    this.updateScore();

    // Показываем выбор региона
    this.elements.options.innerHTML = `
       <div class="region-selection">
         <h3>🌍 Выберите регион</h3>
         <div class="region-buttons">
           <button class="region-btn" data-region="Европа">🇪🇺 Европа</button>
           <button class="region-btn" data-region="Азия">🌏 Азия</button>
           <button class="region-btn" data-region="Африка">🌍 Африка</button>
           <button class="region-btn" data-region="Северная Америка">🇺🇸 Северная Америка</button>
           <button class="region-btn" data-region="Южная Америка">🇧🇷 Южная Америка</button>
           <button class="region-btn" data-region="Океания">🌊 Океания</button>
         </div>
       </div>
     `;

    // Добавляем обработчики для кнопок регионов
    this.elements.options.querySelectorAll('.region-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const region = e.target.dataset.region;
        this.dispatchEvent('selectRegion', region);
      });
    });
  }

  showLearningMode() {
    this.elements.gameScreen.style.display = 'flex';
    this.elements.flagsScreen.style.display = 'none';
    this.elements.loadingScreen.style.display = 'none';

    // Скрываем флаг и вопрос
    this.elements.question.style.display = 'none';
    this.elements.flag.style.display = 'none';

    // Скрываем счетчик в режиме обучения
    this.elements.score.style.display = 'none';

    // Показываем стартовый экран обучения
    this.elements.options.innerHTML = `
       <div class="learning-mode">
         <h3>📖 Режим обучения</h3>
         <p>Изучайте страны без таймера и очков</p>
         <button class="start-btn" id="start-learning">🚀 Начать изучение</button>
       </div>
     `;

    // Добавляем обработчик для кнопки начала обучения
    const startBtn = document.getElementById('start-learning');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.dispatchEvent('beginGame');
      });
    }
  }

  showLearningQuestion(country) {
    if (
      !country ||
      !this.elements.options ||
      !this.elements.question ||
      !this.elements.flag ||
      !this.elements.gameScreen
    ) {
      console.error('Country is null or required elements missing');
      return;
    }

    // Скрываем счетчик в режиме обучения
    this.elements.score.style.display = 'none';

    // Добавляем класс learning-mode для стилизации
    this.elements.gameScreen.classList.add('learning-mode');
    this.elements.gameScreen.style.display = 'flex';
    this.elements.flagsScreen.style.display = 'none';
    this.elements.loadingScreen.style.display = 'none';

    // Показываем вопрос и флаг
    this.elements.question.style.display = 'block';
    this.elements.flag.style.display = 'block';
    this.elements.question.textContent = country.name;

    // Загружаем флаг
    this.loadFlagWithFallback(country);

    // Собираем дополнительную информацию о стране
    const additionalInfo = [];
    if (country.capital) additionalInfo.push(`🏛️ ${country.capital}`);
    if (country.language) additionalInfo.push(`🗣️ ${country.language}`);
    if (country.population) additionalInfo.push(`👥 ${country.population}`);
    if (country.region) additionalInfo.push(`🌍 ${country.region}`);

    // Показываем информацию о стране и кнопку "Следующая страна"
    this.elements.options.innerHTML = `
       <div class="learning-info">
         <div class="country-info">
           ${additionalInfo.map((info) => `<div class="info-item">${info}</div>`).join('')}
         </div>
         <button class="next-btn" id="next-country">➡️ Следующая страна</button>
       </div>
     `;

    // Добавляем обработчик для кнопки "Следующая страна"
    const nextBtn = document.getElementById('next-country');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.dispatchEvent('nextQuestion');
      });
    }
  }

  cleanupLearningMode() {
    // Удаляем элементы режима обучения
    const learningInfo = document.querySelector('.learning-info');
    if (learningInfo) learningInfo.remove();

    const nextBtn = document.getElementById('next-country');
    if (nextBtn) nextBtn.remove();

    // Очищаем текст вопроса
    if (this.elements.question) {
      this.elements.question.textContent = '';
      this.elements.question.style.display = 'block';
    }

    // Сбрасываем стили
    if (this.elements.gameScreen) this.elements.gameScreen.classList.remove('learning-mode');
    if (this.elements.flag) this.elements.flag.style.display = 'block';
    if (this.elements.score) this.elements.score.style.display = 'block';
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

// Глобальная функция для поделиться результатом
window.shareResults = function (text) {
  if (navigator.share) {
    // Используем Web Share API если доступен
    navigator
      .share({
        title: 'Результат игры "Флаги стран"',
        text: text,
        url: window.location.href,
      })
      .catch((err) => {
        console.log('Ошибка при поделиться:', err);
        fallbackShare(text);
      });
  } else {
    // Fallback для браузеров без Web Share API
    fallbackShare(text);
  }
};

function fallbackShare(text) {
  // Копируем текст в буфер обмена
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert('Результат скопирован в буфер обмена!');
    })
    .catch(() => {
      // Если не удалось скопировать, показываем текст для ручного копирования
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Результат скопирован в буфер обмена!');
    });
}
