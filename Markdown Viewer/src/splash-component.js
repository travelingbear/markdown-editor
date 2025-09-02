// Splash Screen Component - Loads before main application
class SplashScreenComponent {
  constructor() {
    this.splashElement = null;
    this.isEnabled = localStorage.getItem('markdownViewer_splashEnabled') !== 'false';
    this.splashDuration = parseInt(localStorage.getItem('markdownViewer_splashDuration') || '1');
    this.minDisplayTime = this.splashDuration * 1000; // Convert to milliseconds
    this.startTime = performance.now();
    
    if (this.isEnabled) {
      this.createSplashScreen();
      this.showSplash();
    }
  }

  createSplashScreen() {
    // Create splash screen element
    this.splashElement = document.createElement('div');
    this.splashElement.id = 'splash-screen';
    this.splashElement.className = 'splash-screen active';
    
    this.splashElement.innerHTML = `
      <div class="splash-content">
        <img src="assets/SplashScreen.gif" alt="Markdown Editor" class="splash-image">
        <div class="splash-progress">
          <div class="progress-bar"></div>
        </div>
      </div>
    `;

    // Add styles
    this.addSplashStyles();
    
    // Insert at beginning of body
    document.body.insertBefore(this.splashElement, document.body.firstChild);
  }

  addSplashStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .splash-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      
      .splash-screen.active {
        opacity: 1;
      }
      

      
      .splash-screen.fade-out {
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      
      .splash-content {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        transform: none;
        animation: none;
      }
      
      .splash-image {
        max-width: 90vw;
        max-height: 70vh;
        transform: none;
        animation: none;
      }
      
      .splash-progress {
        width: 200px;
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        overflow: hidden;
      }
      
      .progress-bar {
        height: 100%;
        background: #007acc;
        border-radius: 2px;
        width: 0%;
        animation: progressAnimation 1.3s ease-out forwards;
      }
      
      @keyframes progressAnimation {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      
      /* Dark theme support */
      [data-theme="dark"] .splash-screen {
        background: #1e1e1e;
      }
      
      [data-theme="dark"] .splash-progress {
        background: #333;
      }
    `;
    
    document.head.appendChild(style);
  }

  showSplash() {
    if (this.splashElement) {
      this.splashElement.classList.add('active');
    }
  }

  hideSplash() {
    if (!this.splashElement) return;
    
    const elapsedTime = performance.now() - this.startTime;
    const remainingTime = Math.max(0, this.minDisplayTime - elapsedTime);
    
    setTimeout(() => {
      this.splashElement.classList.add('fade-out');
      
      setTimeout(() => {
        if (this.splashElement && this.splashElement.parentNode) {
          this.splashElement.parentNode.removeChild(this.splashElement);
        }
      }, 500);
    }, remainingTime);
  }

  updateProgress(percentage, message) {
    if (!this.splashElement) return;
    
    const progressBar = this.splashElement.querySelector('.progress-bar');
    const messageEl = this.splashElement.querySelector('.splash-info p');
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    
    if (messageEl && message) {
      messageEl.textContent = message;
    }
  }
}

// Initialize splash screen immediately when script loads
window.splashScreen = new SplashScreenComponent();