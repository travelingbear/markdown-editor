import { describe, expect, it } from 'vitest';
import {
  averageSwitchDuration,
  buildDashboardView,
  formatMemory,
  formatPressure,
  formatStartup,
  formatTabCount,
  formatTabSwitch,
  resolveStatus
} from '../performance/dashboardView.js';

const memory = (used, total, pressure) => ({ used, total, pressure });
const switches = (...durations) => durations.map((duration) => ({ duration }));

describe('formatTabCount', () => {
  it('reports open and virtual tabs together', () => {
    expect(formatTabCount(12, 4)).toBe('12 (4 virtual)');
  });

  it('handles an empty session', () => {
    expect(formatTabCount()).toBe('0 (0 virtual)');
  });
});

describe('formatMemory', () => {
  it('reports used against total', () => {
    expect(formatMemory(memory(120, 400, 0.3))).toEqual({
      text: '120MB / 400MB',
      className: 'perf-value good'
    });
  });

  it.each([
    [0.6, 'good'],
    [0.61, 'caution'],
    [0.8, 'caution'],
    [0.81, 'warning']
  ])('grades pressure %s as %s', (pressure, severity) => {
    expect(formatMemory(memory(1, 2, pressure)).className).toBe(`perf-value ${severity}`);
  });

  it('says so when the browser exposes no memory information', () => {
    expect(formatMemory(null)).toEqual({ text: 'Not Available', className: 'perf-value' });
  });
});

describe('formatPressure', () => {
  it('reports pressure as a percentage', () => {
    expect(formatPressure(memory(1, 2, 0.4567)).text).toBe('45.7%');
  });

  it('falls back when unavailable', () => {
    expect(formatPressure(null)).toEqual({ text: 'N/A', className: 'perf-value' });
  });
});

describe('formatStartup', () => {
  it('reports milliseconds to two decimals', () => {
    expect(formatStartup(53.456)).toBe('53.46ms');
  });

  it.each([null, undefined, 0])('falls back for %s', (value) => {
    expect(formatStartup(value)).toBe('N/A');
  });
});

describe('averageSwitchDuration', () => {
  it('averages the samples', () => {
    expect(averageSwitchDuration(switches(10, 20, 30))).toBe(20);
  });

  it('uses only the ten most recent', () => {
    // Twelve samples: the two leading 1000s must not drag the average up.
    const recorded = switches(1000, 1000, ...Array(10).fill(10));
    expect(averageSwitchDuration(recorded)).toBe(10);
  });

  it('has no average without samples', () => {
    expect(averageSwitchDuration([])).toBeNull();
  });
});

describe('formatTabSwitch', () => {
  it.each([
    [40, 'good'],
    [51, 'caution'],
    [100, 'caution'],
    [101, 'warning']
  ])('grades a %sms average as %s', (duration, severity) => {
    expect(formatTabSwitch(switches(duration)).className).toBe(`perf-value ${severity}`);
  });

  it('reports one decimal', () => {
    expect(formatTabSwitch(switches(33.33)).text).toBe('33.3ms');
  });

  it('says so before anything is measured', () => {
    expect(formatTabSwitch([])).toEqual({ text: 'No data', className: 'perf-value', average: null });
  });
});

describe('resolveStatus', () => {
  it('is good with nothing measured', () => {
    expect(resolveStatus()).toEqual({
      status: 'Good',
      className: 'status-good',
      tooltip: 'Performance is good'
    });
  });

  it('is good while every measurement is within target', () => {
    const result = resolveStatus({
      memoryInfo: memory(100, 400, 0.5),
      averageSwitchMs: 30,
      startupTime: 500
    });
    expect(result.status).toBe('Good');
  });

  it('warns on a single elevated factor and names it', () => {
    const result = resolveStatus({ memoryInfo: memory(100, 400, 0.75) });

    expect(result.status).toBe('Warning');
    expect(result.className).toBe('status-warning');
    expect(result.tooltip).toBe('Issue detected: Elevated memory pressure');
  });

  it('distinguishes several warnings from one', () => {
    const result = resolveStatus({ memoryInfo: memory(200, 400, 0.75), averageSwitchMs: 150 });

    expect(result.status).toBe('Warning');
    expect(result.tooltip).toBe('Multiple issues: Elevated memory pressure, Slow tab switching, High memory usage');
  });

  it('escalates to critical as soon as one factor is severe', () => {
    const result = resolveStatus({ memoryInfo: memory(100, 400, 0.9) });

    expect(result.status).toBe('Critical');
    expect(result.className).toBe('status-critical');
    expect(result.tooltip).toBe('Critical issues: High memory pressure');
  });

  it.each([
    [{ averageSwitchMs: 250 }, 'Very slow tab switching'],
    [{ startupTime: 2500 }, 'Very slow startup'],
    [{ memoryInfo: memory(300, 400, 0.1) }, 'Very high memory usage']
  ])('reports %o as critical', (input, issue) => {
    const result = resolveStatus(input);
    expect(result.status).toBe('Critical');
    expect(result.tooltip).toContain(issue);
  });

  it('lists issues in a stable order', () => {
    const result = resolveStatus({
      memoryInfo: memory(200, 400, 0.75),
      averageSwitchMs: 150,
      startupTime: 1500
    });

    expect(result.tooltip).toBe(
      'Multiple issues: Elevated memory pressure, Slow tab switching, Slow startup, High memory usage'
    );
  });

  it('ignores a factor sitting exactly on its threshold', () => {
    const result = resolveStatus({ averageSwitchMs: 100, startupTime: 1000 });
    expect(result.status).toBe('Good');
  });
});

describe('buildDashboardView', () => {
  it('assembles every row a healthy session shows', () => {
    const view = buildDashboardView({
      actualTabCount: 3,
      virtualCount: 1,
      memoryInfo: memory(120, 400, 0.3),
      startupTime: 48.2,
      tabSwitches: switches(20, 30)
    });

    expect(view.tabCount).toBe('3 (1 virtual)');
    expect(view.memory.text).toBe('120MB / 400MB');
    expect(view.pressure.text).toBe('30.0%');
    expect(view.startup).toBe('48.20ms');
    expect(view.tabSwitch.text).toBe('25.0ms');
    expect(view.status.status).toBe('Good');
  });

  it('degrades gracefully with no measurements at all', () => {
    const view = buildDashboardView();

    expect(view.memory.text).toBe('Not Available');
    expect(view.pressure.text).toBe('N/A');
    expect(view.startup).toBe('N/A');
    expect(view.tabSwitch.text).toBe('No data');
    expect(view.status.status).toBe('Good');
  });

  it('feeds the switch average into the overall status', () => {
    const view = buildDashboardView({ tabSwitches: switches(250, 260) });

    expect(view.tabSwitch.className).toBe('perf-value warning');
    expect(view.status.status).toBe('Critical');
    expect(view.status.tooltip).toContain('Very slow tab switching');
  });
});
