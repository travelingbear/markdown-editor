import { describe, expect, it, vi } from 'vitest';
import { RetroSoundPlayer } from '../audio/RetroSoundPlayer.js';

function createSource() {
  return {
    buffer: null,
    onended: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  };
}

function createAudioContext(sources = [createSource()]) {
  let sourceIndex = 0;
  const gains = [];
  const context = {
    state: 'running',
    destination: {},
    decodeAudioData: vi.fn().mockResolvedValue({ duration: 9.18 }),
    createBufferSource: vi.fn(() => sources[sourceIndex++]),
    createGain: vi.fn(() => {
      const gain = { gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() };
      gains.push(gain);
      return gain;
    }),
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined)
  };
  return { context, gains };
}

function createFetch() {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
  });
}

describe('RetroSoundPlayer', () => {
  it('loads and decodes the complete clip before playback starts', async () => {
    const source = createSource();
    const { context, gains } = createAudioContext([source]);
    const fetchImpl = createFetch();
    const player = new RetroSoundPlayer({
      fetchImpl,
      audioContextFactory: () => context
    });

    await expect(player.play()).resolves.toBe(true);

    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(context.decodeAudioData).toHaveBeenCalledOnce();
    expect(source.buffer).toEqual({ duration: 9.18 });
    expect(gains[0].gain.value).toBe(0.5);
    expect(source.start).toHaveBeenCalledWith(0);
    expect(player.activeSource).toBe(source);

    source.onended();
    expect(player.activeSource).toBeNull();
  });

  it('reuses the decoded buffer and stops an existing clip before replaying', async () => {
    const first = createSource();
    const second = createSource();
    const { context } = createAudioContext([first, second]);
    const fetchImpl = createFetch();
    const player = new RetroSoundPlayer({
      fetchImpl,
      audioContextFactory: () => context
    });

    await player.play();
    await player.play();

    expect(first.stop).toHaveBeenCalledOnce();
    expect(second.start).toHaveBeenCalledOnce();
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(context.decodeAudioData).toHaveBeenCalledOnce();
    expect(player.activeSource).toBe(second);
  });

  it('resumes a suspended audio context before starting the clip', async () => {
    const source = createSource();
    const { context } = createAudioContext([source]);
    context.state = 'suspended';
    const player = new RetroSoundPlayer({
      fetchImpl: createFetch(),
      audioContextFactory: () => context
    });

    await player.play();

    expect(context.resume).toHaveBeenCalledOnce();
    expect(source.start).toHaveBeenCalledOnce();
  });
});
