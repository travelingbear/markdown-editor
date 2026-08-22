/**
 * Loads ordered stages of application modules.
 *
 * Stages are processed sequentially to preserve dependency boundaries, while
 * every module inside a stage is loaded concurrently to avoid a long startup
 * waterfall.
 */
async function loadModuleStages(stages, options = {}) {
  const now = options.now || (() => performance.now());
  const onStageStart = options.onStageStart || (() => {});
  const onStageComplete = options.onStageComplete || (() => {});
  const startedAt = now();
  const completedStages = [];

  for (const stage of stages) {
    if (!stage?.name || !Array.isArray(stage.modules)) {
      throw new TypeError('Each startup stage requires a name and a modules array');
    }

    const stageStartedAt = now();
    onStageStart(stage.name);

    try {
      await Promise.all(stage.modules.map((loadModule) => loadModule()));
    } catch (error) {
      const startupError = new Error(`Startup module stage "${stage.name}" failed: ${error?.message || error}`);
      startupError.stage = stage.name;
      startupError.cause = error;
      throw startupError;
    }

    const stageResult = {
      name: stage.name,
      duration: now() - stageStartedAt,
      moduleCount: stage.modules.length
    };
    completedStages.push(stageResult);
    onStageComplete(stageResult);
  }

  return {
    duration: now() - startedAt,
    stages: completedStages,
    moduleCount: completedStages.reduce((total, stage) => total + stage.moduleCount, 0)
  };
}

export { loadModuleStages };
