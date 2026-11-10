import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TouchControlMode, SmartWheelSettings } from '../game/types';

interface SmartSteeringWheelProps {
  mode: TouchControlMode;
  wheelSettings: SmartWheelSettings;
  currentSteerNorm: number; // -1 (right) to +1 (left)
  onSteerChange: (steerNorm: number, activeTouch: boolean) => void;
  scale?: number;
  opacity?: number;
}

export const SmartSteeringWheel: React.FC<SmartSteeringWheelProps> = ({
  mode,
  wheelSettings,
  currentSteerNorm,
  onSteerChange,
  scale = 1.0,
  opacity = 0.94,
}) => {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const prevTouchAngleDegRef = useRef<number>(0);
  const targetWheelAngleDegRef = useRef<number>(0);
  const currentWheelAngleDegRef = useRef<number>(0);
  const [displayAngleDeg, setDisplayAngleDeg] = useState<number>(0);
  const [isGrabbed, setIsGrabbed] = useState<boolean>(false);

  const [joyOffsetX, setJoyOffsetX] = useState<number>(0);
  const [leftPressed, setLeftPressed] = useState<boolean>(false);
  const [rightPressed, setRightPressed] = useState<boolean>(false);

  const halfMaxRot = Math.max(90, wheelSettings.rotationRangeDeg * 0.5);

  const computePointerAngleDeg = useCallback(
    (clientX: number, clientY: number): number => {
      const el = wheelRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
    },
    []
  );

  useEffect(() => {
    if (mode !== 'wheel') return;
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (activePointerIdRef.current === null && wheelSettings.autoCenterEnabled) {
        const returnRate = Math.max(1.5, wheelSettings.autoCenterSpeed * 2.4);
        targetWheelAngleDegRef.current +=
          (0 - targetWheelAngleDegRef.current) * Math.min(1, dt * returnRate);
        if (Math.abs(targetWheelAngleDegRef.current) < 0.35) {
          targetWheelAngleDegRef.current = 0;
        }
      }

      const smoothRate = Math.max(8, (1.15 - wheelSettings.smoothing * 0.65) * 28);
      currentWheelAngleDegRef.current +=
        (targetWheelAngleDegRef.current - currentWheelAngleDegRef.current) *
        Math.min(1, dt * smoothRate);

      const angleDeg = currentWheelAngleDegRef.current;
      setDisplayAngleDeg(angleDeg);

      const absDeg = Math.abs(angleDeg);
      let norm = 0;
      if (absDeg > wheelSettings.deadZoneDeg) {
        const effectiveDeg =
          Math.sign(angleDeg) * (absDeg - wheelSettings.deadZoneDeg);
        const effectiveRange = Math.max(30, halfMaxRot - wheelSettings.deadZoneDeg);
        norm = Math.max(-1, Math.min(1, -effectiveDeg / effectiveRange));
      }

      onSteerChange(norm, activePointerIdRef.current !== null);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [mode, halfMaxRot, wheelSettings, onSteerChange]);

  const handleWheelPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== null) return;
    e.stopPropagation();
    activePointerIdRef.current = e.pointerId;
    setIsGrabbed(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore capture errors
    }
    prevTouchAngleDegRef.current = computePointerAngleDeg(e.clientX, e.clientY);
  };

  const handleWheelPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    const currAngle = computePointerAngleDeg(e.clientX, e.clientY);
    const delta = ((currAngle - prevTouchAngleDegRef.current + 540) % 360) - 180;
    prevTouchAngleDegRef.current = currAngle;

    const nextTarget =
      targetWheelAngleDegRef.current + delta * wheelSettings.sensitivity;
    targetWheelAngleDegRef.current = Math.max(
      -halfMaxRot,
      Math.min(halfMaxRot, nextTarget)
    );
  };

  const handleWheelPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    activePointerIdRef.current = null;
    setIsGrabbed(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore release errors
    }
  };

  if (mode === 'buttons') {
    return (
      <div
        className="flex items-center gap-3 select-none touch-none"
        style={{ transform: `scale(${scale})`, opacity }}
      >
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            setRightPressed(true);
            onSteerChange(-1, true);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            setRightPressed(false);
            onSteerChange(leftPressed ? 1 : 0, leftPressed);
          }}
          onPointerCancel={() => {
            setRightPressed(false);
            onSteerChange(leftPressed ? 1 : 0, leftPressed);
          }}
          className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center transition-transform ${
            rightPressed
              ? 'bg-amber-500/40 border-amber-400 scale-95 shadow-lg shadow-amber-500/30'
              : 'bg-slate-950/75 border-stone-600/60 hover:border-amber-500/60'
          } backdrop-blur-md`}
          aria-label="انعطاف يمين"
        >
          <svg viewBox="0 0 24 24" className="w-9 h-9 text-amber-300 fill-current">
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[11px] font-bold text-stone-200 mt-0.5">يمين</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            setLeftPressed(true);
            onSteerChange(1, true);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            setLeftPressed(false);
            onSteerChange(rightPressed ? -1 : 0, rightPressed);
          }}
          onPointerCancel={() => {
            setLeftPressed(false);
            onSteerChange(rightPressed ? -1 : 0, rightPressed);
          }}
          className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center transition-transform ${
            leftPressed
              ? 'bg-amber-500/40 border-amber-400 scale-95 shadow-lg shadow-amber-500/30'
              : 'bg-slate-950/75 border-stone-600/60 hover:border-amber-500/60'
          } backdrop-blur-md`}
          aria-label="انعطاف يسار"
        >
          <svg viewBox="0 0 24 24" className="w-9 h-9 text-amber-300 fill-current">
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[11px] font-bold text-stone-200 mt-0.5">يسار</span>
        </button>
      </div>
    );
  }

  if (mode === 'joystick') {
    return (
      <div
        ref={wheelRef}
        onPointerDown={(e) => {
          if (activePointerIdRef.current !== null) return;
          e.stopPropagation();
          activePointerIdRef.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          setIsGrabbed(true);
        }}
        onPointerMove={(e) => {
          if (activePointerIdRef.current !== e.pointerId || !wheelRef.current)
            return;
          const rect = wheelRef.current.getBoundingClientRect();
          const cx = rect.left + rect.width * 0.5;
          const maxR = rect.width * 0.38;
          const dx = Math.max(-maxR, Math.min(maxR, e.clientX - cx));
          setJoyOffsetX(dx);
          const norm = Math.max(
            -1,
            Math.min(1, (-dx / maxR) * wheelSettings.sensitivity)
          );
          onSteerChange(norm, true);
        }}
        onPointerUp={(e) => {
          if (activePointerIdRef.current !== e.pointerId) return;
          activePointerIdRef.current = null;
          setIsGrabbed(false);
          setJoyOffsetX(0);
          onSteerChange(0, false);
        }}
        onPointerCancel={() => {
          activePointerIdRef.current = null;
          setIsGrabbed(false);
          setJoyOffsetX(0);
          onSteerChange(0, false);
        }}
        style={{ transform: `scale(${scale})`, opacity }}
        className="w-36 h-36 rounded-full bg-slate-950/75 border-2 border-stone-600/60 backdrop-blur-md flex items-center justify-center relative select-none touch-none shadow-2xl"
      >
        <div className="w-24 h-1.5 rounded-full bg-stone-700/70" />
        <div
          style={{ transform: `translateX(${joyOffsetX}px)` }}
          className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${
            isGrabbed
              ? 'bg-amber-500 border-amber-200 text-slate-950'
              : 'bg-stone-800 border-amber-500/80 text-amber-300'
          }`}
        >
          <span className="text-[10px] font-bold">عصا</span>
        </div>
      </div>
    );
  }

  if (mode === 'tilt' || mode === 'gamepad') {
    const visualRot = -currentSteerNorm * 90;
    return (
      <div
        style={{ transform: `scale(${scale})`, opacity }}
        className="px-4 py-2.5 rounded-2xl bg-slate-950/75 border border-stone-700/70 backdrop-blur-md flex items-center gap-3 select-none"
      >
        <div
          style={{ transform: `rotate(${visualRot}deg)` }}
          className="w-11 h-11 rounded-full border-2 border-amber-400/80 flex items-center justify-center relative"
        >
          <div className="w-1.5 h-3.5 bg-amber-400 rounded-full absolute -top-0.5" />
          <div className="w-2 h-2 rounded-full bg-stone-300" />
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-amber-300">
            {mode === 'tilt' ? 'توجيه الإمالة نشط' : 'ذراع التحكم نشطة'}
          </div>
          <div className="text-[11px] text-stone-300 font-mono-num">
            {Math.round(-currentSteerNorm * 100)}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col items-center select-none touch-none"
      style={{ transform: `scale(${scale})`, opacity }}
    >
      <div
        className={`mb-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono-num font-bold transition-opacity ${
          isGrabbed || Math.abs(displayAngleDeg) > 3
            ? 'opacity-95 bg-slate-950/85 text-amber-300 border border-amber-500/40'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {Math.round(displayAngleDeg)}°
      </div>

      <div
        ref={wheelRef}
        onPointerDown={handleWheelPointerDown}
        onPointerMove={handleWheelPointerMove}
        onPointerUp={handleWheelPointerUp}
        onPointerCancel={handleWheelPointerUp}
        className="w-40 h-40 md:w-44 md:h-44 rounded-full flex items-center justify-center relative cursor-grab active:cursor-grabbing touch-none"
      >
        <div
          className={`inset-0 absolute rounded-full border transition-colors pointer-events-none ${
            isGrabbed
              ? 'border-amber-400/55 shadow-[0_0_25px_rgba(245,158,11,0.28)]'
              : 'border-stone-500/20'
          }`}
        />

        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_10px_18px_rgba(0,0,0,0.75)] pointer-events-none"
          style={{
            transform: `rotate(${displayAngleDeg}deg)`,
            willChange: 'transform',
          }}
        >
          <defs>
            <radialGradient id="wheelRimGrad" cx="50%" cy="50%" r="50%">
              <stop offset="72%" stopColor="#1c1917" />
              <stop offset="88%" stopColor="#292524" />
              <stop offset="96%" stopColor="#44403c" />
              <stop offset="100%" stopColor="#0c0a09" />
            </radialGradient>
            <linearGradient id="spokeMetal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#57534e" />
              <stop offset="50%" stopColor="#292524" />
              <stop offset="100%" stopColor="#1c1917" />
            </linearGradient>
          </defs>

          <circle
            cx="100"
            cy="100"
            r="84"
            fill="none"
            stroke="url(#wheelRimGrad)"
            strokeWidth="22"
          />
          <circle
            cx="100"
            cy="100"
            r="73"
            fill="none"
            stroke="#d97706"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke={isGrabbed ? '#fbbf24' : '#78716c'}
            strokeWidth="1.8"
            opacity={isGrabbed ? '0.9' : '0.45'}
          />

          <path
            d="M 26 92 L 74 90 L 74 112 L 26 108 Z"
            fill="url(#spokeMetal)"
            stroke="#44403c"
            strokeWidth="1.5"
          />
          <path
            d="M 174 92 L 126 90 L 126 112 L 174 108 Z"
            fill="url(#spokeMetal)"
            stroke="#44403c"
            strokeWidth="1.5"
          />
          <path
            d="M 88 124 L 112 124 L 108 174 L 92 174 Z"
            fill="url(#spokeMetal)"
            stroke="#44403c"
            strokeWidth="1.5"
          />

          <rect x="36" y="98" width="28" height="4" rx="2" fill="#a8a29e" opacity="0.65" />
          <rect x="136" y="98" width="28" height="4" rx="2" fill="#a8a29e" opacity="0.65" />
          <rect x="98" y="136" width="4" height="26" rx="2" fill="#a8a29e" opacity="0.65" />

          <path
            d="M 93 6 L 107 6 L 105 28 L 95 28 Z"
            fill="#f59e0b"
            stroke="#fef3c7"
            strokeWidth="1"
          />

          <circle
            cx="100"
            cy="100"
            r="30"
            fill="#18181b"
            stroke="#d97706"
            strokeWidth="2.5"
          />
          <circle
            cx="100"
            cy="100"
            r="22"
            fill="#090d16"
            stroke="#44403c"
            strokeWidth="1"
          />
          <text
            x="100"
            y="105"
            textAnchor="middle"
            fill="#fbbf24"
            fontSize="12"
            fontWeight="bold"
            fontFamily="Cairo, sans-serif"
          >
            مَسَالِك
          </text>
        </svg>
      </div>
    </div>
  );
};
