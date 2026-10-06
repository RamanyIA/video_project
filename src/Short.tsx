import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Placeholder scene: validates the pipeline until the audio arrives.
export const Short: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const zoom = interpolate(frame, [0, 300], [1.15, 1.3]);
  const pop = spring({frame, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{backgroundColor: '#05060f'}}>
      <Img
        src={staticFile('photos/photo3.jpg')}
        style={{height: '100%', objectFit: 'cover', objectPosition: '45% 50%', transform: `scale(${zoom})`}}
      />
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 320}}>
        <div
          style={{
            transform: `scale(${pop})`,
            fontFamily: 'Arial Black, sans-serif',
            fontSize: 110,
            color: 'white',
            background: '#0b0f2a',
            padding: '20px 44px',
            borderRadius: 28,
            border: '4px solid #3b82f6',
            boxShadow: '0 0 60px #3b82f6aa',
          }}
        >
          Au menu <span style={{color: '#ff2a2a'}}>–</span> IA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
