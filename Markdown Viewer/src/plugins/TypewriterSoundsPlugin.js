/**
 * Typewriter Sounds Plugin - Adds typewriter sound effects while typing
 */
class TypewriterSoundsPlugin {
  constructor(pluginAPI) {
    this.pluginAPI = pluginAPI;
    this.isActive = false;
    this.typewriterAudio = null;
    this.keystrokeListener = null;
  }

  async init() {
    // Add settings integration
    this.addSettingsIntegration();
    
    // Inject settings UI
    this.injectSettingsUI();
    
    // Initialize typewriter sounds if enabled
    const typewriterSounds = localStorage.getItem('markdownViewer_typewriterSounds');
    if (typewriterSounds === 'enabled') {
      this.initTypewriterAudio();
    }
    
    this.isActive = true;
  }

  addSettingsIntegration() {
    // Initialize typewriter sound settings
    if (!localStorage.getItem('markdownViewer_typewriterSounds')) {
      localStorage.setItem('markdownViewer_typewriterSounds', 'disabled');
    }
    if (!localStorage.getItem('markdownViewer_typewriterVolume')) {
      localStorage.setItem('markdownViewer_typewriterVolume', '0.7');
    }
    if (!localStorage.getItem('markdownViewer_disableReturn')) {
      localStorage.setItem('markdownViewer_disableReturn', 'false');
    }
    if (!localStorage.getItem('markdownViewer_disableBackspace')) {
      localStorage.setItem('markdownViewer_disableBackspace', 'false');
    }
    if (!localStorage.getItem('markdownViewer_disableSpace')) {
      localStorage.setItem('markdownViewer_disableSpace', 'false');
    }
    if (!localStorage.getItem('markdownViewer_disableShift')) {
      localStorage.setItem('markdownViewer_disableShift', 'false');
    }
    
    // Register typewriter sound settings
    const typewriterSoundsExtension = {
      get: () => localStorage.getItem('markdownViewer_typewriterSounds') || 'disabled',
      set: (value) => localStorage.setItem('markdownViewer_typewriterSounds', value),
      metadata: {
        name: 'typewriterSounds',
        description: 'Typewriter sounds setting'
      }
    };
    this.pluginAPI.registerExtension('settings', typewriterSoundsExtension);
    
    const typewriterVolumeExtension = {
      get: () => localStorage.getItem('markdownViewer_typewriterVolume') || '0.7',
      set: (value) => localStorage.setItem('markdownViewer_typewriterVolume', value),
      metadata: {
        name: 'typewriterVolume',
        description: 'Typewriter volume setting'
      }
    };
    this.pluginAPI.registerExtension('settings', typewriterVolumeExtension);
  }

  injectSettingsUI() {
    const settingsContent = document.querySelector('.settings-content');
    if (!settingsContent) {
      return;
    }

    // Create typewriter sounds settings section
    this.settingsSection = document.createElement('div');
    this.settingsSection.className = 'settings-section';
    this.settingsSection.innerHTML = `
      <h3>Typewriter Sounds</h3>
      <div class="setting-item">
        <label>Typewriter Sounds</label>
        <div class="setting-control">
          <button id="typewriter-sounds-enabled-btn" class="setting-btn">Enabled</button>
          <button id="typewriter-sounds-disabled-btn" class="setting-btn">Disabled</button>
        </div>
      </div>
      <div class="setting-item">
        <label>Volume</label>
        <div class="setting-control">
          <input type="range" id="typewriter-volume-slider" min="0" max="1" step="0.1" value="0.7" style="width: 100px;">
          <span id="typewriter-volume-display">70%</span>
        </div>
      </div>
      <div class="setting-item">
        <label>Disable Return Sound</label>
        <div class="setting-control">
          <button id="disable-return-yes-btn" class="setting-btn">Yes</button>
          <button id="disable-return-no-btn" class="setting-btn">No</button>
        </div>
      </div>
      <div class="setting-item">
        <label>Disable Backspace Sound</label>
        <div class="setting-control">
          <button id="disable-backspace-yes-btn" class="setting-btn">Yes</button>
          <button id="disable-backspace-no-btn" class="setting-btn">No</button>
        </div>
      </div>
      <div class="setting-item">
        <label>Disable Space Sound</label>
        <div class="setting-control">
          <button id="disable-space-yes-btn" class="setting-btn">Yes</button>
          <button id="disable-space-no-btn" class="setting-btn">No</button>
        </div>
      </div>
      <div class="setting-item">
        <label>Disable Shift Sound</label>
        <div class="setting-control">
          <button id="disable-shift-yes-btn" class="setting-btn">Yes</button>
          <button id="disable-shift-no-btn" class="setting-btn">No</button>
        </div>
      </div>
    `;

    // Insert before plugins section
    const pluginsSection = settingsContent.querySelector('.settings-section:last-child');
    settingsContent.insertBefore(this.settingsSection, pluginsSection);

    // Add event listeners and update UI
    this.addSettingsListeners();
    this.updateSettingsUI();
  }

  addSettingsListeners() {
    // Typewriter sounds buttons
    document.getElementById('typewriter-sounds-enabled-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_typewriterSounds', 'enabled');
      this.updateSettingsUI();
      this.initTypewriterAudio();
    });
    document.getElementById('typewriter-sounds-disabled-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_typewriterSounds', 'disabled');
      this.updateSettingsUI();
      this.disableTypewriterAudio();
    });
    
    // Volume slider
    const volumeSlider = document.getElementById('typewriter-volume-slider');
    const volumeDisplay = document.getElementById('typewriter-volume-display');
    if (volumeSlider && volumeDisplay) {
      volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        localStorage.setItem('markdownViewer_typewriterVolume', volume.toString());
        volumeDisplay.textContent = Math.round(volume * 100) + '%';
        if (this.typewriterAudio) this.typewriterAudio.setVolume(volume);
      });
    }

    // Disable sound buttons
    document.getElementById('disable-return-yes-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_disableReturn', 'true');
      this.updateSettingsUI();
    });
    document.getElementById('disable-return-no-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_disableReturn', 'false');
      this.updateSettingsUI();
    });

    document.getElementById('disable-backspace-yes-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_disableBackspace', 'true');
      this.updateSettingsUI();
    });
    document.getElementById('disable-backspace-no-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_disableBackspace', 'false');
      this.updateSettingsUI();
    });

    document.getElementById('disable-space-yes-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_disableSpace', 'true');
      this.updateSettingsUI();
    });
    document.getElementById('disable-space-no-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_disableSpace', 'false');
      this.updateSettingsUI();
    });

    document.getElementById('disable-shift-yes-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_disableShift', 'true');
      this.updateSettingsUI();
    });
    document.getElementById('disable-shift-no-btn')?.addEventListener('click', () => {
      localStorage.setItem('markdownViewer_disableShift', 'false');
      this.updateSettingsUI();
    });
  }

  updateSettingsUI() {
    // Update typewriter buttons
    const typewriterSounds = localStorage.getItem('markdownViewer_typewriterSounds') || 'disabled';
    document.getElementById('typewriter-sounds-enabled-btn')?.classList.toggle('active', typewriterSounds === 'enabled');
    document.getElementById('typewriter-sounds-disabled-btn')?.classList.toggle('active', typewriterSounds === 'disabled');
    
    // Update volume slider
    const volume = parseFloat(localStorage.getItem('markdownViewer_typewriterVolume') || '0.7');
    const volumeSlider = document.getElementById('typewriter-volume-slider');
    const volumeDisplay = document.getElementById('typewriter-volume-display');
    if (volumeSlider) volumeSlider.value = volume;
    if (volumeDisplay) volumeDisplay.textContent = Math.round(volume * 100) + '%';

    // Update disable sound buttons
    const disableReturn = localStorage.getItem('markdownViewer_disableReturn') === 'true';
    document.getElementById('disable-return-yes-btn')?.classList.toggle('active', disableReturn);
    document.getElementById('disable-return-no-btn')?.classList.toggle('active', !disableReturn);

    const disableBackspace = localStorage.getItem('markdownViewer_disableBackspace') === 'true';
    document.getElementById('disable-backspace-yes-btn')?.classList.toggle('active', disableBackspace);
    document.getElementById('disable-backspace-no-btn')?.classList.toggle('active', !disableBackspace);

    const disableSpace = localStorage.getItem('markdownViewer_disableSpace') === 'true';
    document.getElementById('disable-space-yes-btn')?.classList.toggle('active', disableSpace);
    document.getElementById('disable-space-no-btn')?.classList.toggle('active', !disableSpace);

    const disableShift = localStorage.getItem('markdownViewer_disableShift') === 'true';
    document.getElementById('disable-shift-yes-btn')?.classList.toggle('active', disableShift);
    document.getElementById('disable-shift-no-btn')?.classList.toggle('active', !disableShift);
  }

  initTypewriterAudio() {
    if (!this.typewriterAudio) {
      this.typewriterAudio = new TypewriterSoundsAudio();
    }
    this.addKeystrokeListener();
  }
  
  disableTypewriterAudio() {
    if (this.keystrokeListener) {
      document.removeEventListener('keydown', this.keystrokeListener);
      this.keystrokeListener = null;
    }
    this.typewriterAudio = null;
  }
  
  addKeystrokeListener() {
    if (this.keystrokeListener) {
      document.removeEventListener('keydown', this.keystrokeListener);
    }
    
    this.keystrokeListener = (e) => {
      const activeElement = document.activeElement;
      const isInMonaco = activeElement && (
        activeElement.classList.contains('monaco-editor') ||
        activeElement.closest('.monaco-editor') ||
        activeElement.classList.contains('inputarea') ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement.contentEditable === 'true')
      );
      
      if (!isInMonaco || !this.typewriterAudio) {
        return;
      }
      
      const key = e.key;
      
      // Check if specific sounds are disabled
      if (key === 'Enter' && localStorage.getItem('markdownViewer_disableReturn') === 'true') return;
      if (key === 'Backspace' && localStorage.getItem('markdownViewer_disableBackspace') === 'true') return;
      if (key === ' ' && localStorage.getItem('markdownViewer_disableSpace') === 'true') return;
      if ((key === 'Shift' || key === 'CapsLock') && localStorage.getItem('markdownViewer_disableShift') === 'true') return;
      
      const isLetter = /^[a-zA-ZÀ-ÿ]$/.test(key);
      const isNumber = /^[0-9]$/.test(key);
      const isSpace = key === ' ';
      const isSpecialKey = ['Backspace', 'Enter', 'Shift', 'CapsLock'].includes(key);
      const isTypingChar = /^[~\\|[\]{};:'",./<>?!@#$%^&*()\-=_+`]$/.test(key);
      
      if (!isLetter && !isNumber && !isSpace && !isSpecialKey && !isTypingChar) {
        return;
      }
      
      let keyType = 'normal';
      if (key === 'Backspace') {
        keyType = 'backspace';
      } else if (key === 'Enter') {
        keyType = 'enter';
      } else if (key === 'Shift' || key === 'CapsLock') {
        keyType = 'shift';
      }
      
      this.typewriterAudio.playKeystroke(keyType);
    };
    
    document.addEventListener('keydown', this.keystrokeListener, true);
  }

  async destroy() {
    // Disable typewriter audio
    this.disableTypewriterAudio();
    
    // Remove settings UI
    if (this.settingsSection) {
      this.settingsSection.remove();
      this.settingsSection = null;
    }
    
    // Remove settings integration
    this.pluginAPI.unregisterExtension('settings', 'typewriterSounds');
    this.pluginAPI.unregisterExtension('settings', 'typewriterVolume');
    
    this.isActive = false;
  }
}

// TypewriterSoundsAudio class
class TypewriterSoundsAudio {
  constructor() {
    this.keystrokeSounds = [];
    this.specialSounds = {};
    this.volume = parseFloat(localStorage.getItem('markdownViewer_typewriterVolume') || '0.7');
    this.enabled = localStorage.getItem('markdownViewer_typewriterSounds') === 'enabled';
    this.loadSounds();
  }
  
  loadSounds() {
    const keystrokeFiles = [
      'key-01.flac', 'key-02.flac', 'key-03.flac', 'key-04.flac',
      'key-05.flac', 'key-06.flac', 'key-07.flac', 'key-08.flac',
      'key-09.flac', 'key-10.flac', 'key-11.flac', 'key-12.flac',
      'key-13.flac', 'key-14.flac'
    ];
    
    const basePath = '../assets/typewriter_sounds/';
    
    keystrokeFiles.forEach((file, index) => {
      const audio = new Audio(basePath + file);
      audio.preload = 'metadata';
      audio.volume = this.volume;
      this.keystrokeSounds[index] = audio;
    });
    
    const specialSounds = {
      backspace: 'backspace.flac',
      enter: 'return.flac', 
      shift: 'shift-caps.flac'
    };
    
    Object.entries(specialSounds).forEach(([key, file]) => {
      const audio = new Audio(basePath + file);
      audio.preload = 'metadata';
      audio.volume = this.volume;
      this.specialSounds[key] = audio;
    });
  }
  
  playKeystroke(keyType = 'normal') {
    if (!this.enabled) return;
    
    let audio;
    if (keyType === 'normal') {
      const randomIndex = Math.floor(Math.random() * this.keystrokeSounds.length);
      audio = this.keystrokeSounds[randomIndex];
    } else {
      audio = this.specialSounds[keyType];
    }
    
    if (audio) {
      if (audio.readyState < 2) {
        audio.load();
      }
      audio.currentTime = 0;
      audio.play().catch(e => {
        // Audio playback failed
      });
    }
  }
  
  setVolume(volume) {
    this.volume = volume;
    this.keystrokeSounds.forEach(audio => {
      if (audio) audio.volume = volume;
    });
    Object.values(this.specialSounds).forEach(audio => {
      if (audio) audio.volume = volume;
    });
  }
}

// Plugin metadata
TypewriterSoundsPlugin.metadata = {
  name: 'Typewriter Sounds Plugin',
  version: '1.0.0',
  description: 'Adds typewriter sound effects while typing',
  author: 'Markdown Editor'
};

window.TypewriterSoundsPlugin = TypewriterSoundsPlugin;