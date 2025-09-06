# Phase 6: Performance Optimization - Testing Steps

## Overview
Phase 6 introduces advanced performance optimizations including lazy loading, memory management, smart tab unloading, and a real-time performance dashboard.

## Success Criteria to Validate
- [ ] 100 tabs can be opened without significant slowdown
- [ ] Memory usage stays reasonable with many tabs
- [ ] Tab switching remains responsive under load
- [ ] Memory leaks are prevented with tab cleanup
- [ ] Performance metrics show acceptable thresholds

## Testing Steps

### 1. Performance Dashboard Testing

#### 1.1 Access Performance Dashboard
1. Open the application
2. Press `Ctrl+,` to open Settings
3. Scroll down to find the "Performance Monitor" section
4. **Expected**: Performance dashboard shows current metrics:
   - Memory Usage (e.g., "45MB / 128MB")
   - Active Tabs count
   - Tab Switch Average time
   - Memory Pressure percentage

#### 1.2 Dashboard Real-time Updates
1. Keep Settings open with Performance Monitor visible
2. Open several new tabs (`Ctrl+N`)
3. Switch between tabs multiple times
4. **Expected**: Dashboard updates every 5 seconds showing:
   - Increasing tab count
   - Updated memory usage
   - Tab switch average time
   - Memory pressure changes

#### 1.3 Performance Actions
1. In Performance Monitor, click "Force Cleanup"
2. **Expected**: Memory usage should decrease slightly
3. Click "View Report"
4. **Expected**: Console (F12) shows detailed performance report
5. Check console for performance data including:
   - Memory trends
   - Cache statistics
   - Tab statistics

### 2. Memory Optimization Testing

#### 2.1 Basic Memory Management
1. Open 10 tabs with different markdown files
2. Monitor memory usage in Performance Dashboard
3. Close 5 tabs
4. **Expected**: Memory usage decreases after closing tabs
5. **Expected**: No memory leaks (memory doesn't keep growing)

#### 2.2 High Tab Count Testing
1. Create 20+ tabs by opening files or creating new tabs
2. Monitor Performance Dashboard
3. **Expected**: Application remains responsive
4. **Expected**: Memory pressure stays below 80% if possible
5. Switch between tabs rapidly
6. **Expected**: Tab switching remains under 100ms average

#### 2.3 Memory Pressure Response
1. Open 30+ tabs to trigger memory pressure
2. Leave some tabs inactive for 5+ minutes
3. **Expected**: System may automatically unload inactive tabs
4. **Expected**: Console shows memory pressure warnings if threshold exceeded
5. Switch to a previously inactive tab
6. **Expected**: Tab content loads quickly (lazy restoration)

### 3. Lazy Loading Testing

#### 3.1 Tab Lazy Loading
1. Open 10+ tabs
2. Switch to a tab that hasn't been accessed recently
3. **Expected**: Content loads smoothly (may have slight delay for lazy-loaded tabs)
4. **Expected**: No errors in console during lazy loading

#### 3.2 Performance with Many Tabs
1. Open 50+ tabs (if system allows)
2. **Expected**: Application shows warning about performance impact
3. Choose to continue
4. **Expected**: Application remains usable
5. **Expected**: Only active tabs consume full resources

### 4. Smart Tab Unloading Testing

#### 4.1 Automatic Tab Unloading
1. Open 15+ tabs
2. Use only 2-3 tabs actively for 10+ minutes
3. **Expected**: Inactive tabs may be automatically unloaded to save memory
4. **Expected**: Console shows unloading messages
5. Switch to an unloaded tab
6. **Expected**: Tab restores quickly with content intact

#### 4.2 Tab Access Tracking
1. Open 10 tabs
2. Switch between tabs in different patterns
3. **Expected**: Performance dashboard shows access patterns
4. **Expected**: Frequently used tabs are prioritized for keeping loaded

### 5. Performance Benchmarking

#### 5.1 Tab Switch Performance
1. Open 20 tabs
2. Switch between tabs rapidly using:
   - `Ctrl+Tab` (next tab)
   - `Alt+1-5` (numbered tabs)
   - Tab dropdown
3. **Expected**: Tab switching averages under 50ms
4. **Expected**: Performance dashboard shows good (green) tab switch times

#### 5.2 File Operations Performance
1. Open large markdown files (>1MB if available)
2. **Expected**: File opens within reasonable time
3. **Expected**: Performance dashboard tracks file open times
4. Create new tabs rapidly
5. **Expected**: Tab creation remains responsive

### 6. Low Power Mode Testing

#### 6.1 Older Hardware Detection
1. Check console for hardware detection messages
2. **Expected**: System may automatically enable low power mode on older hardware
3. **Expected**: Performance targets are adjusted accordingly

#### 6.2 Manual Low Power Testing
1. Open browser developer tools (F12)
2. In console, run: `window.markdownEditor.performanceOptimizer.enableLowPowerMode()`
3. **Expected**: Console shows low power mode enabled
4. **Expected**: Performance dashboard shows adjusted targets
5. **Expected**: More aggressive memory management

### 7. Performance Monitoring Integration

#### 7.1 Tab Performance Tracking
1. Open multiple tabs and switch between them
2. Check Performance Dashboard for metrics
3. **Expected**: Tab switch times are tracked and displayed
4. **Expected**: Memory usage trends are visible

#### 7.2 Debounced Operations
1. Type rapidly in a markdown editor
2. **Expected**: Preview updates are debounced (not updating on every keystroke)
3. **Expected**: Smooth typing experience without lag

### 8. Error Handling and Edge Cases

#### 8.1 Memory Pressure Handling
1. Open many tabs until memory pressure is high
2. **Expected**: System gracefully handles memory pressure
3. **Expected**: Warning messages appear if needed
4. **Expected**: Automatic cleanup prevents crashes

#### 8.2 Performance Degradation
1. Open 100+ tabs (if system allows)
2. **Expected**: System warns about performance impact
3. **Expected**: Application remains stable even with many tabs
4. **Expected**: Performance dashboard shows warning states

### 9. Cross-Platform Testing

#### 9.1 Windows Performance
1. Test all above scenarios on Windows
2. **Expected**: Performance optimizations work correctly
3. **Expected**: Memory management is effective

#### 9.2 Different Hardware Configurations
1. Test on different RAM configurations (4GB, 8GB, 16GB+)
2. **Expected**: Performance adapts to available memory
3. **Expected**: Low power mode activates on constrained systems

## Performance Benchmarks to Achieve

### Target Metrics
- **Tab Switch Time**: < 50ms average
- **Memory per Tab**: < 5MB average
- **Total Memory**: < 200MB with 20 tabs
- **File Open Time**: < 500ms for typical files
- **Memory Pressure**: < 80% under normal use

### Warning Thresholds
- **Tab Switch Time**: > 100ms (caution), > 200ms (warning)
- **Memory Pressure**: > 60% (caution), > 80% (warning)
- **Total Memory**: > 150MB (caution), > 200MB (warning)

## Validation Checklist

After testing, verify these items work correctly:

### Core Performance Features
- [ ] Performance dashboard displays real-time metrics
- [ ] Memory usage is tracked and displayed accurately
- [ ] Tab switching performance is monitored
- [ ] Memory pressure detection works
- [ ] Automatic cleanup reduces memory usage

### Memory Management
- [ ] Tab content is properly cleaned up when tabs close
- [ ] Memory leaks are prevented
- [ ] Inactive tabs can be unloaded to save memory
- [ ] Unloaded tabs restore correctly when accessed

### Lazy Loading
- [ ] Large numbers of tabs don't cause immediate slowdown
- [ ] Tab content loads on-demand when needed
- [ ] Performance remains good with 50+ tabs

### Smart Features
- [ ] Tab access patterns are tracked
- [ ] Frequently used tabs are prioritized
- [ ] Low power mode activates on older hardware
- [ ] Performance warnings appear when needed

### User Experience
- [ ] All performance features work transparently
- [ ] No noticeable delays in normal usage
- [ ] Performance dashboard provides useful information
- [ ] System remains stable under load

## Troubleshooting

### Common Issues
1. **High Memory Usage**: Check if many tabs are open, try Force Cleanup
2. **Slow Tab Switching**: Check Performance Dashboard for bottlenecks
3. **Performance Warnings**: Consider closing unused tabs or enabling low power mode
4. **Dashboard Not Updating**: Refresh settings modal or restart application

### Debug Information
- Check browser console (F12) for performance logs
- Use Performance Dashboard "View Report" for detailed metrics
- Monitor system memory usage in Task Manager
- Check for JavaScript errors that might affect performance

## Notes for Francisco

Please test these scenarios thoroughly and let me know:
1. Which performance metrics you see in the dashboard
2. How the application behaves with many tabs open
3. Whether memory usage stays reasonable
4. If tab switching remains responsive
5. Any performance issues or unexpected behavior

The performance optimizations should be mostly transparent to normal usage while providing significant improvements when working with many tabs or on older hardware.