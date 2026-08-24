// Splash Screen Component - Loads before main application
export const SPLASH_IMAGE_URL = new URL('./assets/SplashScreen.gif', import.meta.url).href;

class SplashScreenComponent {
  constructor() {
    this.splashElement = null;
    this.isEnabled = localStorage.getItem('markdownViewer_splashEnabled') !== 'false';
    this.splashDuration = parseInt(localStorage.getItem('markdownViewer_splashDuration') || '1');
    this.minDisplayTime = this.splashDuration * 1000; // Convert to milliseconds
    this.startTime = performance.now();

    // Apply the saved theme before the application markup is painted. The full
    // theme stylesheet is loaded later by StyleManager, but this prevents a
    // bright startup cover from flashing for users who selected dark mode.
    const savedTheme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    
    if (this.isEnabled) {
      document.body.classList.add('splash-visible');
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
        <img src="${SPLASH_IMAGE_URL}" alt="Markdown Editor" class="splash-image">
        <div class="splash-progress">
          <div class="progress-bar"></div>
        </div>
      </div>
    `;

    // Insert at beginning of body
    document.body.insertBefore(this.splashElement, document.body.firstChild);
  }

  showSplash() {
    if (this.splashElement) {
      this.splashElement.classList.add('active');
    }
  }

  hideSplash() {
    if (!this.splashElement) {
      document.body.classList.remove('splash-visible');
      return;
    }
    
    const elapsedTime = performance.now() - this.startTime;
    const remainingTime = Math.max(0, this.minDisplayTime - elapsedTime);
    
    setTimeout(() => {
      this.splashElement.classList.add('fade-out');
      
      setTimeout(() => {
        if (this.splashElement && this.splashElement.parentNode) {
          this.splashElement.parentNode.removeChild(this.splashElement);
        }
        document.body.classList.remove('splash-visible');
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
