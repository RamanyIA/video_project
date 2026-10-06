import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';

export const PlayBadge: React.FC<{size: number}> = ({size}) => (
  <div
    style={{
      width: size * 1.4,
      height: size,
      borderRadius: size * 0.28,
      background: C.red,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 0 ${size / 2}px ${C.red}99`,
    }}
  >
    <div
      style={{
        width: 0,
        height: 0,
        marginLeft: size * 0.1,
        borderTop: `${size * 0.22}px solid transparent`,
        borderBottom: `${size * 0.22}px solid transparent`,
        borderLeft: `${size * 0.36}px solid white`,
      }}
    />
  </div>
);

export const Brand: React.FC<{size: number}> = ({size}) => (
  <span style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color: 'white', letterSpacing: -1}}>
    Au menu <span style={{color: C.red}}>–</span> IA
  </span>
);

export const TopBar: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 70, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <PlayBadge size={44} />
          <Brand size={44} />
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 30,
            color: C.cyan,
            border: `3px solid ${C.cyan}`,
            borderRadius: 40,
            padding: '6px 22px',
            letterSpacing: 2,
          }}
        >
          PODCAST IA
        </div>
      </div>
      <div style={{height: 10, borderRadius: 10, background: '#ffffff22', overflow: 'hidden'}}>
        <div
          style={{
            height: '100%',
            width: `${(f / durationInFrames) * 100}%`,
            background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`,
            boxShadow: `0 0 20px ${C.cyan}`,
          }}
        />
      </div>
    </div>
  );
};
