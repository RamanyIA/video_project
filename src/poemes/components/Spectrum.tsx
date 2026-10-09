import React from 'react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {beatPulse, energyAt} from '../music';
import {P} from '../theme';

const N = 36;

// Soft bar "spectrum" driven by the energy curve and beat pulses (not a real FFT).
export const Spectrum: React.FC<{top: number}> = ({top}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const e = energyAt(t);
  const b = beatPulse(t);
  const colors = [P.rose, P.peach, P.mint, P.lilac];
  return (
    <div style={{position: 'absolute', top, left: 120, right: 120, height: 120, display: 'flex', alignItems: 'center', gap: 8}}>
      {new Array(N).fill(0).map((_, i) => {
        const shape = Math.sin((i / (N - 1)) * Math.PI);
        const wob = 0.5 + 0.5 * Math.sin(f / 4 + i * 1.3 + random(`w${i}`) * 6);
        const h = 8 + shape * (20 + e * 70 * wob + b * 30 * random(`b${i}`));
        return <div key={i} style={{flex: 1, height: h, borderRadius: 6, background: colors[i % 4], opacity: 0.85}} />;
      })}
    </div>
  );
};
