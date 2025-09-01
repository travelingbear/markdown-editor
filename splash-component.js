// Splash Screen Component - Loads before main application
class SplashScreenComponent {
  constructor() {
    this.splashElement = null;
    this.isEnabled = localStorage.getItem('markdownViewer_splashEnabled') !== 'false';
    this.minDisplayTime = 2000; // Minimum 2 seconds
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
        <div class="splash-logo">
          <img src="assets/SplashScreen.gif" alt="Markdown Editor" class="splash-image">
        </div>
        <div class="splash-info">
          <h1>Markdown Editor</h1>
          <p>Loading application...</p>
          <div class="splash-progress">
            <div class="progress-bar"></div>
          </div>
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
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
        color: white;
        max-width: 400px;
        padding: 2rem;
      }
      
      .splash-logo {
        margin-bottom: 2rem;
      }
      
      .splash-image {
        width: 120px;
        height: 120px;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }
      
      .splash-info h1 {
        font-size: 2.5rem;
        margin: 1rem 0 0.5rem 0;
        font-weight: 300;
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
      }
      
      .splash-info p {
        font-size: 1.1rem;
        margin-bottom: 2rem;
        opacity: 0.9;
      }
      
      .splash-progress {
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.2);
        border-radius: 2px;
        overflow: hidden;
      }
      
      .progress-bar {
        height: 100%;
        background: rgba(255,255,255,0.8);
        border-radius: 2px;
        width: 0%;
        animation: progressAnimation 2s ease-out forwards;
      }
      
      @keyframes progressAnimation {
        0% { width: 0%; }
        50% { width: 60%; }
        100% { width: 100%; }
      }
      
      /* Dark theme support */
      [data-theme="dark"] .splash-screen {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      }
    `;
    
    document.head.appendChild(style);
  }

  showSplash() {
    // Ensure splash is visible
    setTimeout(() => {
      if (this.splashElement) {
        this.splashElement.classList.add('active');
      }
    }, 50);
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