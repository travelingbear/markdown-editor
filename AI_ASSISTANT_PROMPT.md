# AI Assistant Development Prompt - Markdown Viewer v2.0

## 🎯 Project Overview
**Native Markdown Viewer v2.0** - Tauri + Rust + TypeScript/JavaScript desktop application

**Current Status**: v1.0.0 COMPLETE + Phase 7 Priority 1 COMPLETED  
**Current Branch**: `main`  
**Next Phase**: Phase 7 - UI/UX Enhancements (Priority 2: Centered A4 Layout)

## 📋 Current Status Summary

### ✅ **v1.0.0 COMPLETED**: All Core Features Working
- Three-mode interface (Code/Preview/Split) with Monaco Editor
- Real-time markdown rendering with KaTeX math and Mermaid diagrams  
- Interactive task lists with state persistence
- GitHub-style themes with perfect synchronization
- File operations, HTML/PDF export, keyboard shortcuts
- Performance monitoring and error handling
- Image & GIF support for all formats
- Window close handler with unsaved changes confirmation
- Native drag-drop with absolute file paths
- Cross-platform distribution system (MSI, NSIS, DMG, AppImage, DEB)

### ✅ **Phase 7 Priority 1 COMPLETED**: Distraction-Free Mode
- F11 toggle for distraction-free mode activation/deactivation
- ESC key exit functionality
- Complete UI hiding (toolbar and status bar)
- Mouse hover hint at top of screen for exit instructions
- Mode-specific layouts for all three modes (Preview/Code/Split)
- Responsive design with adaptive padding for different screen sizes
- Theme support (light and dark)
- Smooth transitions and animations
- **Commit**: `082babc` on `feature/phase-7-distraction-free-mode` → merged to `main`

### 🚀 **v2.0 ENHANCEMENT GOALS**
Based on **FUTURE_IMPROVEMENTS_PLAN.md**, implement the following improvements:

**Phase 7 - UI/UX Enhancements (4-6 weeks)**:
1. **Distraction-Free Mode** (Priority: HIGH)
2. **Centered A4 Layout with Configurable Margins** (Priority: MEDIUM)
3. **Enhanced Settings Window** (Priority: MEDIUM)

**Phase 8 - Branding & Legal (2-3 weeks)**:
4. **Custom Icon & Favicon** (Priority: LOW)
5. **MIT License Implementation** (Priority: HIGH)
6. **User-Only MSI Installer** (Priority: MEDIUM)

## 🎯 **CURRENT PHASE: Phase 7 - UI/UX Enhancements**

### **Priority 1: Distraction-Free Mode** ✅ COMPLETED
- **Goal**: Clean, minimal interface hiding all UI elements except content
- **Features**: F11 toggle, hidden toolbar/status bar, ESC to exit, mouse hover hints
- **Status**: ✅ COMPLETED & MERGED TO MAIN (Commit: `082babc`)
- **Branch**: `feature/phase-7-distraction-free-mode` (merged)
- **Testing**: All requirements validated and approved by user
- **Implementation**: 
  - JavaScript: Added distraction-free state management and keyboard shortcuts
  - CSS: Added complete responsive styling for all modes
  - No regressions in existing functionality

### **Priority 2: Centered A4 Layout** 🎯 NEXT
- **Goal**: Center content within A4 page width with configurable margins
- **Features**: A4/Letter/Legal page sizes, adjustable margins, print consistency
- **Status**: 🎯 READY TO START (Priority 1 completed)
- **Branch**: Create `feature/phase-7-centered-layout`

### **Priority 3: Home Screen showing a history the last three opened markdown files ###
- **Goal**: Shows only on the Home Screen
- **Features**: Has a button to clear history and shows the last three last used markdown files
- **Status**: PENDING - Start after Priority 2 completion
- **Branch**: Create `feature/phase-7-files-history`

### **Priority 4: Enhanced Settings Window**
- **Goal**: Replace text-based settings with modern clickable interface
- **Features**: Tabbed interface, visual controls, live preview, import/export
- **Status**: PENDING - Start after Priority 2 completion
- **Branch**: Create `feature/phase-7-enhanced-settings`

## 📁 **Key Files**
- `main.js` - Application logic
- `lib.rs` - Rust backend  
- `tauri.conf.json` - Configuration
- `PROJECT_PLAN.md` - Original specification
- `FUTURE_IMPROVEMENTS_PLAN.md` - v2.0 enhancement roadmap
- `LESSONS_LEARNED.md` - Technical knowledge base

## ⚠️ **CRITICAL DEVELOPMENT RULES - STRICTLY ENFORCED**

### **GIT WORKFLOW - MANDATORY**
- ❌ **NEVER work directly on main branch**
- ❌ **NEVER commit without explicit user approval**
- ✅ **ALWAYS create feature branches for each improvement**
- ✅ **ALWAYS request user validation before any commits**
- ✅ **ONLY update documentation AFTER user approval**
- ✅ **ONLY stage and commit AFTER user approval**

### **PHASE WORKFLOW - MANDATORY**
1. **Create feature branch** for specific improvement (e.g., `feature/phase-7-distraction-free-mode`)
2. **Implement single improvement** completely on feature branch
3. **Request user testing** and validation of the specific improvement
4. **Wait for user approval** - DO NOT PROCEED WITHOUT IT
5. **Update documentation** only after approval
6. **Stage and commit** only after approval
7. **Merge to main** only after approval
8. **Start next improvement** on new feature branch

### **IMPROVEMENT-SPECIFIC WORKFLOW**
- **One improvement per branch** - No mixing of features
- **Complete implementation** before requesting validation
- **Comprehensive testing** of the specific improvement
- **User validation required** for each improvement individually
- **Documentation updates** for each completed improvement

## 🧪 **Testing Requirements for Each Improvement**

### **Distraction-Free Mode Testing** ✅ COMPLETED
- [x] F11 toggles distraction-free mode correctly
- [x] All UI elements hidden except content area
- [x] ESC key exits distraction-free mode
- [x] Mouse movement shows exit options
- [x] No regressions in existing functionality
- [x] Performance remains acceptable
- [x] All three modes work correctly in distraction-free mode
- [x] Responsive behavior across screen sizes

### **Centered A4 Layout for Preview and Code mode and Distraction-Free mode Testing**
- [ ] Content centers correctly in all window sizes
- [ ] A4 page width constraint works (210mm/8.27")
- [ ] Configurable margins function properly
- [ ] Multiple page sizes available (A4, Letter, Legal)
- [ ] Print output matches screen layout
- [ ] Settings persist across sessions
- [ ] No impact on existing themes

### **Home Screen showing a history the last three opened markdown files**
- [ ] Shows only on the Home Screen
- [ ] Has a button to clear history
- [ ] No regressions in existing functionality
- [ ] Performance remains acceptable
- [ ] Responsive design on different screen sizes

### **Enhanced Settings Testing**
- [ ] All visual controls function correctly
- [ ] Live preview updates immediately
- [ ] Settings import/export works
- [ ] Reset options function properly
- [ ] All existing settings preserved
- [ ] Responsive design on different screen sizes

## 📊 **Success Criteria for Phase 7**

### **Functionality**
- 🔄 1/4 improvements implemented and working (Distraction-free mode ✅)
- ✅ No regressions in existing v1.0.0 functionality
- ✅ User interface remains intuitive and responsive
- ✅ Settings persistence works correctly

### **Performance**
- ✅ Startup time remains < 2 seconds
- ✅ Mode switching remains < 100ms
- ✅ Memory usage stays < 200MB
- ✅ No performance degradation with new features

### **User Experience**
- ✅ Distraction-free mode enhances focus (COMPLETED)
- 🎯 Centered layout improves document presentation (NEXT)
- 🔄 Enhanced settings are more accessible (PENDING)
- 🔄 All improvements feel integrated and polished (IN PROGRESS)

## 🚦 **VALIDATION CHECKPOINTS**

### **After Each Improvement**
**User must validate:**
- ✅ Improvement works as specified
- ✅ No existing functionality broken
- ✅ Performance remains acceptable
- ✅ User interface changes are intuitive
- ✅ Ready to commit and merge

**AI Assistant must:**
- ✅ Request explicit user approval
- ✅ Wait for confirmation before committing
- ✅ Update documentation after approval
- ✅ Merge to main only after approval
- ✅ Create new branch for next improvement

### **After Phase 7 Completion**
**User must validate:**
- ✅ All Phase 7 improvements working together
- ✅ Complete application stability
- ✅ Ready to proceed to Phase 8
- ✅ Version increment to v1.1.0 or v2.0.0

## 📝 **IMPLEMENTATION NOTES**

### **Current v1.0.0 Status**
- ✅ All core functionality working perfectly
- ✅ Cross-platform distribution system ready
- ✅ Performance targets met
- ✅ No critical issues or regressions
- ✅ Ready for enhancement development

### **Development Approach**
- **Incremental Enhancement**: Add features without breaking existing functionality
- **User-Centric**: Each improvement must provide clear user value
- **Performance Conscious**: Monitor impact of new features
- **Backward Compatible**: Ensure all improvements are optional

### **Technical Considerations**
- **Settings Migration**: Handle existing user preferences
- **CSS Architecture**: Maintain existing theme system
- **JavaScript Modularity**: Keep code organized and maintainable
- **Tauri Integration**: Leverage native capabilities where beneficial

## 🎯 **IMMEDIATE NEXT STEPS**

1. **✅ COMPLETED**: Distraction-free mode implemented and merged
2. **Create feature branch**: `feature/phase-7-centered-layout`
3. **Implement centered A4 layout**: A4 page width, configurable margins
4. **Test thoroughly**: All centered layout requirements
5. **Request user validation**: Complete testing and approval
6. **Commit and merge**: Only after user approval
7. **Move to Priority 3**: File history on home screen

## 📚 **Reference Documents**
- **FUTURE_IMPROVEMENTS_PLAN.md** - Complete v2.0 roadmap and specifications
- **LESSONS_LEARNED.md** - Technical knowledge and best practices
- **PROJECT_PLAN.md** - Original project architecture and patterns
- **DEVELOPMENT_LOG.md** - Complete development history and solutions

---

**🎯 PHASE 7 IN PROGRESS: UI/UX ENHANCEMENTS**

**✅ Priority 1 COMPLETED**: Distraction-free mode implemented and merged  
**🎯 Current Focus**: Priority 2 - Centered A4 Layout implementation  
**Branch Strategy**: One improvement per feature branch with user validation  
**Success Metric**: Enhanced user experience without compromising existing functionality

**Phase 7 Progress**: 1/4 improvements completed (25%)