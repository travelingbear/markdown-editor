# Typewriter Mode Extension Plan (v2.0.0) - REVISED

## Overview
Extend the Horizontal Split Plugin to v2.0.0 with Typewriter Mode - focused on essential features based on previous implementation issues.

## Workflow
**Change > Test > Commit > User Validation > Update Status > Commit code > Next Step**

---

## ESSENTIAL FEATURES ONLY

### Phase 1: Audio System (PRIORITY 1)
**Status**: ✅ COMPLETED - AUDIO WORKING PERFECTLY

#### Step 1.1: Fix Audio Playback
- **Task**: Fix FLAC audio playbook (currently loading but not playing)
- **Files**: `src/plugins/HorizontalSplitPlugin.js` (modify)
- **SOLUTION**: Moved FLAC files to src/assets/typewriter_sounds/ directory
- **RESULT**: All 14 keystroke sounds + 3 special sounds loading and playing correctly
- **Test**: Simple keystroke sound on any key press
- **Status**: ✅ COMPLETED

#### Step 1.2: Typewriter Settings
- **Task**: Add minimal typewriter settings
- **Settings**: 
  - `typewriterMode`: 'enabled' | 'disabled'
  - `typewriterSounds`: 'enabled' | 'disabled' 
  - `typewriterVolume`: 0.0 - 1.0
- **UI**: Simple toggle in settings panel
- **Status**: ✅ COMPLETED

### Phase 2: Layout System (PRIORITY 2)
**Status**: ✅ COMPLETED - LAYOUT WORKING CORRECTLY

#### Step 2.1: Mode Isolation
- **Task**: Disable Code/Preview modes when typewriter active
- **SOLUTION**: Hide mode buttons completely in typewriter mode
- **Welcome Screen Fix**: Auto-refresh screen when closing documents
- **Status**: ✅ COMPLETED

#### Step 2.2: Fixed Layout
- **Task**: Force horizontal split (30% editor bottom, 70% preview top)
- **SOLUTION**: CSS classes and inline styles for fixed proportions
- **Layout**: Editor positioned correctly with statusbar/tabs
- **Status**: ✅ COMPLETED

### Phase 3: Preview Scrolling (PRIORITY 3)
**Status**: 🔄 Pending - COMPLEX RENDERING ISSUES

#### Step 3.1: Line Visibility Detection
- **Task**: Track which lines are visible in Monaco editor viewport
- **Trigger**: When line scrolls OUT OF TOP of Monaco viewport
- **Action**: Add that line to BOTTOM of preview pane
- **Monaco API**: Use `getVisibleRanges()` and scroll events
- **Status**: 🔄 Pending

#### Step 3.2: Bottom-Up Preview
- **Task**: Show A4 paper growing from bottom of preview pane
- **Visual**: Lines appear at bottom and push existing content up
- **Animation**: Smooth line-by-line reveal with paper texture
- **Status**: 🔄 Pending

---

## IMPLEMENTATION STRATEGY

### Minimal Viable Product (MVP)
1. **Fix audio playback** - Essential for typewriter feel
2. **Force horizontal layout** - 30% editor bottom, 70% preview top
3. **Basic line scrolling** - Lines disappear from Monaco top → appear in preview bottom
4. **Settings integration** - Toggle typewriter mode on/off
5. **Clean disable** - Return to normal when disabled

### Technical Approach (SIMPLIFIED)

#### Audio Fix Strategy
```javascript
// Replace complex Web Audio API with simple HTML5 Audio
class TypewriterAudio {
  constructor() {
    this.sounds = new Map();
    this.loadSounds();
  }
  
  loadSounds() {
    // Use HTML5 Audio elements instead of AudioContext
    const soundFiles = ['key-01.flac', 'key-02.flac', /* ... */];
    soundFiles.forEach(file => {
      const audio = new Audio(`./typewriter_sounds/${file}`);
      audio.preload = 'auto';
      this.sounds.set(file, audio);
    });
  }
  
  playKeystroke() {
    // Simple random selection and play
    const randomSound = this.getRandomSound();
    randomSound.currentTime = 0; // Reset to start
    randomSound.play().catch(e => console.warn('Audio play failed:', e));
  }
}
```

#### Layout Fix Strategy
```javascript
// Disable other modes completely when typewriter active
enableTypewriterMode() {
  // Hide mode buttons
  document.querySelector('.mode-buttons')?.style.setProperty('display', 'none', 'important');
  
  // Force horizontal layout
  this.container.classList.add('typewriter-mode');
  
  // Adjust for statusbar/tabs
  this.adjustForSystemUI();
}

disableTypewriterMode() {
  // Restore everything
  document.querySelector('.mode-buttons')?.style.removeProperty('display');
  this.container.classList.remove('typewriter-mode');
}
```

#### Line Scrolling Strategy
```javascript
// Simple approach: track visible lines and mirror to preview
class LineTracker {
  constructor(editor, previewPane) {
    this.editor = editor;
    this.previewPane = previewPane;
    this.lastVisibleRange = null;
    
    // Listen to scroll events
    editor.onDidScrollChange(() => this.checkVisibleLines());
  }
  
  checkVisibleLines() {
    const visibleRange = this.editor.getVisibleRanges()[0];
    if (this.lastVisibleRange && visibleRange.startLineNumber > this.lastVisibleRange.startLineNumber) {
      // Lines scrolled out of view - add to preview
      this.addLinesToPreview(this.lastVisibleRange.startLineNumber, visibleRange.startLineNumber - 1);
    }
    this.lastVisibleRange = visibleRange;
  }
  
  addLinesToPreview(fromLine, toLine) {
    // Get the lines that scrolled out
    const model = this.editor.getModel();
    for (let i = fromLine; i <= toLine; i++) {
      const lineContent = model.getLineContent(i);
      this.appendToPreviewBottom(lineContent);
    }
  }
}
```

---

## SIMPLIFIED ARCHITECTURE

### Core Classes (MINIMAL)
```javascript
class HorizontalSplitPlugin {
  // Existing functionality...
  
  // Typewriter Components (ESSENTIAL ONLY)
  typewriterAudio: TypewriterAudio     // Fixed HTML5 Audio
  lineTracker: LineTracker             // Monaco scroll monitoring
  typewriterUI: TypewriterUI           // Layout and settings
}

class TypewriterAudio {
  constructor() { /* HTML5 Audio setup */ }
  playKeystroke() { /* Simple random play */ }
  setVolume(level) { /* Volume control */ }
}

class LineTracker {
  constructor(editor, previewPane) { /* Monaco integration */ }
  checkVisibleLines() { /* Scroll detection */ }
  addLinesToPreview(fromLine, toLine) { /* Preview update */ }
}

class TypewriterUI {
  enableTypewriterMode() { /* Force layout, hide modes */ }
  disableTypewriterMode() { /* Restore normal state */ }
  adjustForSystemUI() { /* Fix statusbar/tabs overlap */ }
}
```

### Settings Schema (MINIMAL)
```javascript
// Essential typewriter settings only
localStorage.setItem('markdownViewer_typewriterMode', 'disabled');
// Values: 'enabled' | 'disabled'

localStorage.setItem('markdownViewer_typewriterSounds', 'enabled');
// Values: 'enabled' | 'disabled'

localStorage.setItem('markdownViewer_typewriterVolume', '0.7');
// Values: 0.0 - 1.0

// Future nice-to-have settings (not implemented in MVP):
// - Paper size selection
// - Animation speed
// - Font selection
```

### CSS Architecture (ESSENTIAL ONLY)
```css
/* Typewriter Mode Layout - MINIMAL */
.typewriter-mode {
  display: flex !important;
  flex-direction: column !important;
}

.typewriter-mode .preview-pane {
  height: 70% !important;
  order: 1 !important; /* Top */
  overflow-y: auto;
  background: #f5f5f5; /* Paper-like background */
}

.typewriter-mode .editor-pane {
  height: 30% !important;
  order: 2 !important; /* Bottom */
  border-top: 2px solid #ccc; /* Visual separator */
}

/* Hide mode buttons in typewriter mode */
.typewriter-mode .mode-buttons {
  display: none !important;
}

/* Basic paper effect in preview */
.typewriter-preview {
  max-width: 210mm; /* A4 width */
  margin: 0 auto;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-height: 100%;
}

/* Line reveal animation (simple) */
.typewriter-line {
  opacity: 0;
  transform: translateY(10px);
  animation: revealLine 0.3s ease-out forwards;
}

@keyframes revealLine {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Audio Integration (FIXED APPROACH)
```javascript
// Audio file structure (17 FLAC files)
const typewriterSounds = {
  keystrokes: [
    'key-01.flac', 'key-02.flac', 'key-03.flac', 'key-04.flac',
    'key-05.flac', 'key-06.flac', 'key-07.flac', 'key-08.flac',
    'key-09.flac', 'key-10.flac', 'key-11.flac', 'key-12.flac',
    'key-13.flac', 'key-14.flac'
  ],
  backspace: 'backspace.flac',
  enter: 'return.flac',
  shift: 'shift-caps.flac'
};

// FIXED Audio implementation using HTML5 Audio
class TypewriterAudio {
  constructor() {
    this.keystrokeSounds = [];
    this.specialSounds = {};
    this.volume = 0.7;
    this.enabled = true;
    this.loadSounds();
  }
  
  loadSounds() {
    // Use HTML5 Audio instead of Web Audio API
    typewriterSounds.keystrokes.forEach(file => {
      const audio = new Audio(`./typewriter_sounds/${file}`);
      audio.preload = 'auto';
      audio.volume = this.volume;
      this.keystrokeSounds.push(audio);
    });
    
    // Load special sounds
    this.specialSounds.backspace = new Audio('./typewriter_sounds/backspace.flac');
    this.specialSounds.enter = new Audio('./typewriter_sounds/return.flac');
    this.specialSounds.shift = new Audio('./typewriter_sounds/shift-caps.flac');
  }
  
  playKeystroke(keyType = 'normal') {
    if (!this.enabled) return;
    
    let audio;
    if (keyType === 'normal') {
      // Random keystroke sound
      const randomIndex = Math.floor(Math.random() * this.keystrokeSounds.length);
      audio = this.keystrokeSounds[randomIndex];
    } else {
      audio = this.specialSounds[keyType];
    }
    
    if (audio) {
      audio.currentTime = 0; // Reset to start
      audio.play().catch(e => console.warn('Audio play failed:', e));
    }
  }
}
```

---

## SUCCESS CRITERIA (MVP)
- [x] **NO permanent changes** to core application files
- [ ] **AUDIO FIXED**: Typewriter sounds play on keystrokes
- [ ] **LAYOUT FIXED**: 30% editor bottom, 70% preview top, no mode conflicts
- [ ] **SCROLLING WORKS**: Lines from Monaco top → Preview bottom
- [ ] **SETTINGS WORK**: Toggle typewriter mode, volume control
- [ ] **CLEAN DISABLE**: Complete restoration when disabled
- [ ] **NO CRASHES**: Plugin doesn't break the application
- [ ] **STATUSBAR FIX**: Monaco editor respects system UI positioning

---

## IMPLEMENTATION ORDER (REVISED)

### Step 1: Fix Audio (CRITICAL)
- Replace Web Audio API with HTML5 Audio elements
- Test with simple keystroke detection
- Verify all 17 FLAC files play correctly

### Step 2: Fix Layout (CRITICAL)
- Disable Code/Preview mode buttons when typewriter active
- Force horizontal split with fixed proportions
- Fix Monaco editor z-index issues with statusbar/tabs

### Step 3: Basic Line Scrolling (CORE FEATURE)
- Track Monaco editor visible range changes
- Detect when lines scroll out of top viewport
- Add those lines to bottom of preview pane
- Simple A4 paper styling

### Step 4: Settings Integration (ESSENTIAL)
- Add typewriter toggle to settings panel
- Volume control slider
- Real-time settings updates
- Proper cleanup on disable

---

## NEXT IMMEDIATE ACTION
**Start with Step 1: Fix Audio System**
- The current audio loading works but playback fails
- This is the foundation for the typewriter experience
- Simple HTML5 Audio approach should resolve the issue

**Questions for you:**
1. Should we start by examining the current audio implementation to see why it's not playing?
2. Do you want to proceed with the simplified approach outlined above?
3. Are there any other critical issues from the previous attempt that I should know about?