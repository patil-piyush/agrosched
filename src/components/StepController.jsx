import React from 'react';

export default function StepController({ player, label = '' }) {
  const { currentStep, totalSteps, isPlaying, isDone, speed, setSpeed,
          play, pause, stepForward, stepBackward, reset } = player;

  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{label}</span>
          <span>{Math.max(0, currentStep + 1)} / {totalSteps} steps</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: '#52B788' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={reset} className="step-btn text-gray-500" title="Reset">
          ⏮
        </button>
        <button onClick={stepBackward} disabled={currentStep < 0} className="step-btn" title="Previous step">
          ◀
        </button>
        <button
          onClick={isPlaying ? pause : play}
          className="step-btn px-4 font-semibold"
          style={{ background: isPlaying ? '#FFF3E0' : '#E8F5E9', color: isPlaying ? '#E65100' : '#2D6A4F', borderColor: isPlaying ? '#F4A261' : '#52B788' }}
        >
          {isPlaying ? '⏸ Pause' : isDone ? '↺ Replay' : currentStep < 0 ? '▶ Play' : '▶ Resume'}
        </button>
        <button onClick={stepForward} disabled={currentStep >= totalSteps - 1} className="step-btn" title="Next step">
          ▶
        </button>

        {/* Speed control */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400">Slow</span>
          <input
            type="range" min={100} max={1500} step={100}
            value={1600 - speed}
            onChange={e => setSpeed(1600 - Number(e.target.value))}
            className="w-20 accent-secondary"
          />
          <span className="text-xs text-gray-400">Fast</span>
        </div>
      </div>

      {/* Done indicator */}
      {isDone && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-primary font-medium fade-in">
          <span className="text-green-500">✓</span> Algorithm complete — scroll down to continue
        </div>
      )}
    </div>
  );
}
