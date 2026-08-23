/**
 * Turns performance measurements into everything the Performance Monitor
 * section displays: text, severity classes, overall status, and tooltip.
 *
 * The thresholds that decide when the application calls itself slow live here
 * rather than inline in a DOM update, so they can be read and tested directly.
 */

const MEMORY_PRESSURE_WARNING = 0.8;
const MEMORY_PRESSURE_CAUTION = 0.6;

const SWITCH_WARNING_MS = 100;
const SWITCH_CAUTION_MS = 50;

// Thresholds that feed the overall status, which is deliberately less twitchy
// than the per-row severities above.
const STATUS_LIMITS = {
  pressure: { warning: 0.7, critical: 0.85 },
  switchMs: { warning: 100, critical: 200 },
  startupMs: { warning: 1000, critical: 2000 },
  memoryMb: { warning: 150, critical: 250 }
};

const RECENT_SWITCH_SAMPLE = 10;

function severityClass(severity) {
  return `perf-value ${severity}`;
}

function rank(value, { warning, caution }) {
  if (value > warning) return 'warning';
  if (value > caution) return 'caution';
  return 'good';
}

export function formatTabCount(actualTabCount = 0, virtualCount = 0) {
  return `${actualTabCount} (${virtualCount} virtual)`;
}

/** `used / total`, coloured by how close the heap is to its limit. */
export function formatMemory(memoryInfo) {
  if (!memoryInfo) return { text: 'Not Available', className: 'perf-value' };

  return {
    text: `${memoryInfo.used}MB / ${memoryInfo.total}MB`,
    className: severityClass(rank(memoryInfo.pressure, {
      warning: MEMORY_PRESSURE_WARNING,
      caution: MEMORY_PRESSURE_CAUTION
    }))
  };
}

export function formatPressure(memoryInfo) {
  if (!memoryInfo) return { text: 'N/A', className: 'perf-value' };

  return {
    text: `${(memoryInfo.pressure * 100).toFixed(1)}%`,
    className: severityClass(rank(memoryInfo.pressure, {
      warning: MEMORY_PRESSURE_WARNING,
      caution: MEMORY_PRESSURE_CAUTION
    }))
  };
}

export function formatStartup(startupTime) {
  return startupTime ? `${startupTime.toFixed(2)}ms` : 'N/A';
}

/** Mean of the most recent switches, which is what the reader cares about. */
export function averageSwitchDuration(switches = []) {
  const recent = switches.slice(-RECENT_SWITCH_SAMPLE);
  if (recent.length === 0) return null;
  return recent.reduce((total, entry) => total + entry.duration, 0) / recent.length;
}

export function formatTabSwitch(switches = []) {
  const average = averageSwitchDuration(switches);
  if (average === null) return { text: 'No data', className: 'perf-value', average: null };

  return {
    text: `${average.toFixed(1)}ms`,
    className: severityClass(rank(average, {
      warning: SWITCH_WARNING_MS,
      caution: SWITCH_CAUTION_MS
    })),
    average
  };
}

/**
 * Overall status. Any critical factor is critical; otherwise one or more
 * warning factors is a warning, with the tooltip naming what was measured.
 */
export function resolveStatus({ memoryInfo = null, averageSwitchMs = null, startupTime = null } = {}) {
  const factors = [
    { value: memoryInfo?.pressure ?? null, limits: STATUS_LIMITS.pressure, warn: 'Elevated memory pressure', critical: 'High memory pressure' },
    { value: averageSwitchMs, limits: STATUS_LIMITS.switchMs, warn: 'Slow tab switching', critical: 'Very slow tab switching' },
    { value: startupTime, limits: STATUS_LIMITS.startupMs, warn: 'Slow startup', critical: 'Very slow startup' },
    { value: memoryInfo?.used ?? null, limits: STATUS_LIMITS.memoryMb, warn: 'High memory usage', critical: 'Very high memory usage' }
  ];

  let warnings = 0;
  let criticals = 0;
  const issues = [];

  for (const { value, limits, warn, critical } of factors) {
    if (value === null || value <= limits.warning) continue;
    warnings += 1;
    if (value > limits.critical) {
      criticals += 1;
      issues.push(critical);
    } else {
      issues.push(warn);
    }
  }

  if (criticals > 0) {
    return { status: 'Critical', className: 'status-critical', tooltip: `Critical issues: ${issues.join(', ')}` };
  }
  if (warnings >= 2) {
    return { status: 'Warning', className: 'status-warning', tooltip: `Multiple issues: ${issues.join(', ')}` };
  }
  if (warnings === 1) {
    return { status: 'Warning', className: 'status-warning', tooltip: `Issue detected: ${issues.join(', ')}` };
  }
  return { status: 'Good', className: 'status-good', tooltip: 'Performance is good' };
}

/**
 * The complete view model for the Performance Monitor section.
 */
export function buildDashboardView({
  actualTabCount = 0,
  virtualCount = 0,
  memoryInfo = null,
  startupTime = null,
  tabSwitches = []
} = {}) {
  const tabSwitch = formatTabSwitch(tabSwitches);

  return {
    tabCount: formatTabCount(actualTabCount, virtualCount),
    memory: formatMemory(memoryInfo),
    pressure: formatPressure(memoryInfo),
    startup: formatStartup(startupTime),
    tabSwitch,
    status: resolveStatus({
      memoryInfo,
      averageSwitchMs: tabSwitch.average,
      startupTime
    })
  };
}
