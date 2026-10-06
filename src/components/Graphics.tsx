import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Scene} from '../scenes';
import {C, FONT} from '../theme';
import {Brand, PlayBadge} from './TopBar';

export const PANEL = {x: 50, y: 960, w: 980, h: 440};

const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, fps, t: f / fps};
};

const usePop = (delaySec = 0, damping = 12) => {
  const {f, fps} = useT();
  return spring({frame: f - Math.round(delaySec * fps), fps, config: {damping, stiffness: 160}});
};

const Pop: React.FC<{delay?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({delay = 0, children, style}) => {
  const p = usePop(delay);
  return (
    <div style={{transform: `scale(${p})`, opacity: Math.min(1, p * 2), ...style}}>{children}</div>
  );
};

const Title: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 92, color}) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: -2,
      color: color ?? 'white',
      background: color ? undefined : `linear-gradient(180deg, #fff 30%, ${C.cyan})`,
      WebkitBackgroundClip: color ? undefined : 'text',
      WebkitTextFillColor: color ? undefined : 'transparent',
      filter: `drop-shadow(0 6px 0 #000) drop-shadow(0 0 24px ${C.blue})`,
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

const Sub: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.muted}) => (
  <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color, textAlign: 'center', textShadow: '0 3px 0 #000'}}>
    {children}
  </div>
);

const Emoji: React.FC<{children: string; size?: number; wobble?: boolean}> = ({children, size = 120, wobble = true}) => {
  const {f} = useT();
  return (
    <div style={{fontSize: size, lineHeight: 1, transform: wobble ? `rotate(${Math.sin(f / 6) * 8}deg)` : undefined}}>
      {children}
    </div>
  );
};

const Badge: React.FC<{children: React.ReactNode; color: string; delay?: number}> = ({children, color, delay = 0}) => (
  <Pop delay={delay}>
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 42,
        whiteSpace: 'nowrap',
        color: C.bg,
        background: color,
        borderRadius: 22,
        padding: '10px 30px',
        boxShadow: `0 0 40px ${color}aa, 0 8px 0 #0008`,
      }}
    >
      {children}
    </div>
  </Pop>
);

const Col: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 18}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap, height: '100%'}}>
    {children}
  </div>
);

const Row: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 30}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap}}>{children}</div>
);

/* ---------- individual graphics ---------- */

const Chip: React.FC<{scene: Scene}> = ({scene}) => (
  <Col>
    <Row gap={26}>
      <Pop>
        <Emoji>{scene.emoji ?? '✨'}</Emoji>
      </Pop>
      <Pop delay={0.12}>
        <Title size={scene.title && scene.title.length > 12 ? 74 : 96}>{scene.title}</Title>
      </Pop>
    </Row>
    <Pop delay={0.3}>
      <Sub>{scene.sub}</Sub>
    </Pop>
  </Col>
);

const Logo: React.FC = () => (
  <Col gap={24}>
    <Pop>
      <PlayBadge size={110} />
    </Pop>
    <Pop delay={0.2}>
      <Brand size={110} />
    </Pop>
    <Pop delay={0.45}>
      <Sub color={C.cyan}>Le décryptage IA en format court</Sub>
    </Pop>
  </Col>
);

const Jev: React.FC = () => {
  const {t} = useT();
  const shine = (t * 60) % 200 - 50;
  return (
    <Col gap={14}>
      <Pop>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 210,
            letterSpacing: 18,
            lineHeight: 1,
            background: `linear-gradient(110deg, #c9d6ff 0%, #fff ${shine}%, #7aa2ff ${shine + 15}%, #e8eeff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 0 30px ${C.blue}) drop-shadow(0 8px 0 #000)`,
          }}
        >
          JEV
        </div>
      </Pop>
      <Pop delay={0.4}>
        <Sub color="white">le nouveau modèle de TypeSafe</Sub>
      </Pop>
      <Badge color={C.red} delay={2.6}>
        🌋 SILICON VALLEY EN FEU
      </Badge>
    </Col>
  );
};

const Lines: React.FC<{progress: number}> = ({progress}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 12, width: 300}}>
    {[1, 0.9, 1, 0.75, 0.95].map((w, i) => (
      <div key={i} style={{height: 14, borderRadius: 7, background: '#ffffff22'}}>
        <div
          style={{
            height: '100%',
            borderRadius: 7,
            background: C.muted,
            width: `${Math.max(0, Math.min(1, progress * 5 - i)) * w * 100}%`,
          }}
        />
      </div>
    ))}
  </div>
);

const System2: React.FC = () => {
  const {t} = useT();
  return (
    <Col gap={22}>
      <Row gap={36}>
        <Pop>
          <Emoji size={110}>🐢</Emoji>
        </Pop>
        <Pop delay={0.3}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            <Title size={68}>ChatGPT</Title>
            <Lines progress={interpolate(t, [4, 11], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
          </div>
        </Pop>
      </Row>
      <Pop delay={6}>
        <Sub color="white">📝 l'élève studieux · la dissertation</Sub>
      </Pop>
      {t > 11 && <Badge color={C.yellow}>SYSTÈME 2 · RÉFLEXION LENTE</Badge>}
    </Col>
  );
};

const Qcm: React.FC = () => {
  const {t} = useT();
  const opts = ['A', 'B', 'C', 'D'];
  return (
    <Col gap={26}>
      <Row gap={22}>
        <Pop>
          <Title size={84}>JEV = QCM</Title>
        </Pop>
        <Pop delay={0.2}>
          <Emoji size={90}>⚡</Emoji>
        </Pop>
      </Row>
      <Row gap={22}>
        {opts.map((o, i) => {
          // the "right" answer changes fast: instinct, not reflection
          const ticked = t > 1.5 && Math.floor(t * 2.5) % 4 === i;
          return (
            <Pop key={o} delay={0.4 + i * 0.1}>
              <div
                style={{
                  width: 150,
                  height: 110,
                  borderRadius: 24,
                  border: `5px solid ${ticked ? C.green : '#ffffff55'}`,
                  background: ticked ? `${C.green}33` : '#ffffff10',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: 54,
                  color: 'white',
                  boxShadow: ticked ? `0 0 40px ${C.green}` : 'none',
                }}
              >
                {o}
                {ticked && <span style={{color: C.green}}>✓</span>}
              </div>
            </Pop>
          );
        })}
      </Row>
      {t > 9.3 ? (
        <Badge color={C.green}>SYSTÈME 1 · L'INSTINCT</Badge>
      ) : (
        <Pop delay={1}>
          <Sub color="white">une fraction de seconde par réponse</Sub>
        </Pop>
      )}
    </Col>
  );
};

const MirrorSvg: React.FC<{double: boolean; t: number}> = ({double, t}) => {
  const W = 900;
  const H = 230;
  const pts: string[] = [];
  if (double) {
    // ray bouncing between two mirrors, wobbling more and more
    const n = 14;
    const visible = Math.min(n, Math.floor(t * 4));
    for (let i = 0; i <= visible; i++) {
      const x = i % 2 === 0 ? 100 : W - 100;
      const y = 30 + (i / n) * (H - 60) + Math.sin(i * 1.7 + t * 3) * i * 4;
      pts.push(`${x},${y}`);
    }
  } else {
    const k = Math.min(1, t / 1.5);
    pts.push(`60,${H / 2 - 90}`, `${60 + (W / 2 - 60) * k},${H / 2 - 90 + 90 * k}`);
    if (k >= 1) {
      const k2 = Math.min(1, (t - 1.5) / 1.5);
      pts.push(`${W / 2 + (W / 2 - 60) * k2},${H / 2 - 90 * k2}`);
    }
  }
  const color = double ? (t > 13.8 ? C.red : C.yellow) : C.green;
  return (
    <svg width={W} height={H}>
      {double ? (
        <>
          <rect x={70} y={10} width={18} height={H - 20} rx={8} fill={C.cyan} opacity={0.9} />
          <rect x={W - 88} y={10} width={18} height={H - 20} rx={8} fill={C.cyan} opacity={0.9} />
        </>
      ) : (
        <rect x={W / 2 - 160} y={H / 2 + 4} width={320} height={16} rx={8} fill={C.cyan} />
      )}
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={8} strokeLinejoin="round"
        style={{filter: `drop-shadow(0 0 10px ${color})`}} />
    </svg>
  );
};

const Mirrors: React.FC = () => {
  const {t} = useT();
  return (
    <Col gap={14}>
      <Pop>
        <Title size={70}>{t < 8.8 ? 'IA GÉNÉRATIVE = DÉCODEUR' : 'MIROIRS FACE À FACE'}</Title>
      </Pop>
      <MirrorSvg double t={t} />
      {t > 13.8 ? <Badge color={C.red}>⚠️ HALLUCINATIONS</Badge> : <Sub color="white">prédit le mot suivant…</Sub>}
    </Col>
  );
};

const Mirror: React.FC = () => {
  const {t} = useT();
  return (
    <Col gap={14}>
      <Pop>
        <Title size={76}>JEV = ENCODEUR</Title>
      </Pop>
      <MirrorSvg double={false} t={t} />
      {t > 6.4 ? <Badge color={C.green}>✅ UN SEUL MIROIR, PLAT</Badge> : <Sub color="white">il ne génère rien de nouveau</Sub>}
    </Col>
  );
};

const Spam: React.FC = () => {
  const {t} = useT();
  return (
    <Col gap={20}>
      <Row gap={30}>
        <Pop>
          <Emoji size={110}>🤨</Emoji>
        </Pop>
        <Pop delay={0.2}>
          <Title size={74}>SCEPTIQUE ?</Title>
        </Pop>
      </Row>
      {t > 9.5 && (
        <Row gap={24}>
          {['📧', '📧', '📧', '🗑️'].map((e, i) => (
            <Pop key={i} delay={9.6 + i * 0.25}>
              <Emoji size={80} wobble={i === 3}>{e}</Emoji>
            </Pop>
          ))}
          <Pop delay={10.8}>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 70, color: C.yellow, textShadow: '0 5px 0 #000'}}>
              2000
            </div>
          </Pop>
        </Row>
      )}
      {t > 9.5 && (
        <Pop delay={11.3}>
          <Sub color="white">juste un vieux filtre anti-spam ?</Sub>
        </Pop>
      )}
    </Col>
  );
};

const ZeroShot: React.FC = () => {
  const {t} = useT();
  const n = Math.round(interpolate(t, [0, 5.5], [5000, 0], {extrapolateRight: 'clamp'}));
  return (
    <Col gap={14}>
      <Pop>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 150, lineHeight: 1, color: n === 0 ? C.green : 'white',
          textShadow: `0 8px 0 #000, 0 0 40px ${n === 0 ? C.green : C.blue}`}}>
          {n.toLocaleString('fr-FR')}
        </div>
      </Pop>
      <Sub color="white">exemple d'entraînement nécessaire</Sub>
      {t > 5.8 && <Badge color={C.green}>ZERO-SHOT 🎯</Badge>}
    </Col>
  );
};

const Switch: React.FC = () => {
  const {t} = useT();
  const W = 900;
  const H = 250;
  const dests = [
    {y: 40, label: '🧾 Factures', color: C.yellow},
    {y: H / 2, label: '🚫 Spam', color: C.red},
    {y: H - 40, label: '🚨 Urgent', color: C.green},
  ];
  const trains = [0, 1, 2, 3, 4, 5].map((i) => {
    const p = ((t - i * 0.55) % 1.65) / 1.65;
    const d = dests[(i * 2 + Math.floor(t / 1.65)) % 3];
    if (t < 2 + i * 0.55 || p < 0) return null;
    const x = 40 + p * 520;
    const y = p < 0.45 ? H / 2 : H / 2 + (d.y - H / 2) * Math.min(1, (p - 0.45) / 0.3);
    return <circle key={i} cx={x} cy={y} r={16} fill={d.color} style={{filter: `drop-shadow(0 0 10px ${d.color})`}} />;
  });
  return (
    <Col gap={10}>
      <Pop>
        <Title size={70}>
          SMART <span style={{color: C.cyan, WebkitTextFillColor: C.cyan}}>IF</span> 🚦
        </Title>
      </Pop>
      <svg width={W} height={H}>
        {dests.map((d) => (
          <g key={d.label}>
            <path d={`M 40 ${H / 2} L 270 ${H / 2} C 340 ${H / 2}, 360 ${d.y}, 440 ${d.y} L 580 ${d.y}`} stroke="#ffffff55"
              strokeWidth={10} fill="none" />
            <text x={600} y={d.y + 14} fill="white" fontFamily={FONT} fontWeight={800} fontSize={40}>{d.label}</text>
          </g>
        ))}
        {trains}
      </svg>
      <Sub color="white">l'aiguilleur qui ne se trompe jamais</Sub>
    </Col>
  );
};

const Meter: React.FC<{label: string; value: number; color: string}> = ({label, value, color}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 20, width: 860}}>
    <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 44, color: 'white', width: 300}}>{label}</div>
    <div style={{flex: 1, height: 46, borderRadius: 23, background: '#ffffff1a', overflow: 'hidden'}}>
      <div style={{height: '100%', width: `${value * 100}%`, background: color, borderRadius: 23, boxShadow: `0 0 30px ${color}`}} />
    </div>
  </div>
);

const SpeedCost: React.FC = () => {
  const {t} = useT();
  const k = interpolate(t, [0.5, 3.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Col gap={30}>
      <Meter label="⚡ Vitesse" value={0.15 + 0.85 * k} color={C.green} />
      <Meter label="💸 Coût" value={0.9 - 0.85 * k} color={C.red} />
      {t > 4 && <Badge color={C.yellow}>HYPER RAPIDE · PEU CHER</Badge>}
    </Col>
  );
};

const Game: React.FC = () => {
  const {t, f} = useT();
  const pressed = Math.floor(f / 5) % 3;
  return (
    <Col gap={18}>
      <Row gap={24}>
        <Pop>
          <Emoji size={100}>🎮</Emoji>
        </Pop>
        <Pop delay={0.2}>
          <Title size={64}>JEV JOUE À MARIO</Title>
        </Pop>
      </Row>
      <Row gap={30}>
        {['◀', 'A', '▶'].map((b, i) => (
          <div key={b} style={{width: 120, height: 120, borderRadius: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 900, fontSize: 54, color: 'white',
            background: t > 7 && pressed === i ? C.red : '#ffffff1a',
            transform: `scale(${t > 7 && pressed === i ? 0.88 : 1})`,
            boxShadow: t > 7 && pressed === i ? `0 0 40px ${C.red}` : 'none'}}>{b}</div>
        ))}
        <Emoji size={90}>🍄</Emoji>
      </Row>
      {t > 18 ? <Badge color={C.cyan}>RÉACTIVITÉ EXTRÊME</Badge> : <Sub color="white">un bouton choisi en temps réel</Sub>}
    </Col>
  );
};

const Fatigue: React.FC = () => {
  const {t} = useT();
  const popups = Math.min(4, Math.floor(Math.max(0, t - 7.5) * 1.2));
  return (
    <Col gap={18}>
      <Row gap={24}>
        <Pop>
          <Emoji size={100}>😩</Emoji>
        </Pop>
        <Pop delay={0.2}>
          <Title size={62}>LA FATIGUE DE L'IA</Title>
        </Pop>
      </Row>
      <div style={{position: 'relative', width: 700, height: 200}}>
        {Array.from({length: popups}).map((_, i) => (
          <Pop key={i} style={{position: 'absolute', left: 60 + i * 60, top: i * 30}}>
            <div style={{background: 'white', borderRadius: 20, padding: '18px 30px', fontFamily: FONT, fontWeight: 800, fontSize: 38,
              color: C.bg, boxShadow: '0 12px 30px #000a', display: 'flex', gap: 20}}>
              Valider l'action ? <span style={{color: C.green}}>✔</span>
            </div>
          </Pop>
        ))}
      </div>
    </Col>
  );
};

const M2M: React.FC = () => {
  const {t} = useT();
  const p = (t * 0.9) % 1;
  return (
    <Col gap={20}>
      <Pop>
        <Title size={66}>MACHINE ⇄ MACHINE</Title>
      </Pop>
      <div style={{position: 'relative', width: 760, height: 150}}>
        <div style={{position: 'absolute', left: 0, top: 10}}><Emoji size={120} wobble={false}>🤖</Emoji></div>
        <div style={{position: 'absolute', right: 0, top: 10}}><Emoji size={120} wobble={false}>🖥️</Emoji></div>
        <div style={{position: 'absolute', left: 150, right: 150, top: 72, height: 6, background: '#ffffff33'}} />
        <div style={{position: 'absolute', left: 150 + p * 420, top: 56, width: 40, height: 40, borderRadius: 10, background: C.green,
          boxShadow: `0 0 24px ${C.green}`}} />
      </div>
      <Sub color="white">JEV filtre et valide en coulisses</Sub>
    </Col>
  );
};

const Jevons: React.FC = () => {
  const {t} = useT();
  const W = 860;
  const H = 230;
  const k = interpolate(t, [8, 11.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const N = 40;
  const cost: string[] = [];
  const usage: string[] = [];
  for (let i = 0; i <= N * k; i++) {
    const x = (i / N) * W;
    cost.push(`${x},${20 + (i / N) * (H - 60)}`);
    usage.push(`${x},${H - 20 - Math.pow(i / N, 3) * (H - 40)}`);
  }
  return (
    <Col gap={12}>
      <Pop>
        <Title size={64}>PARADOXE DE JEVONS</Title>
      </Pop>
      <svg width={W} height={H}>
        <line x1={0} y1={H - 4} x2={W} y2={H - 4} stroke="#ffffff44" strokeWidth={4} />
        <polyline points={cost.join(' ')} fill="none" stroke={C.red} strokeWidth={9} style={{filter: `drop-shadow(0 0 8px ${C.red})`}} />
        <polyline points={usage.join(' ')} fill="none" stroke={C.green} strokeWidth={9} style={{filter: `drop-shadow(0 0 8px ${C.green})`}} />
        {k > 0.9 && (
          <>
            <text x={W - 10} y={H - 60} textAnchor="end" fill={C.red} fontFamily={FONT} fontWeight={900} fontSize={38}>coût ↓</text>
            <text x={W - 240} y={40} textAnchor="end" fill={C.green} fontFamily={FONT} fontWeight={900} fontSize={38}>usage ↑↑↑</text>
          </>
        )}
      </svg>
      <Sub color="white">moins cher = utilisation qui explose</Sub>
    </Col>
  );
};

const Robot: React.FC = () => {
  const {t} = useT();
  // cup falls and gets caught in a loop once the example starts
  const local = t < 7.4 ? -1 : (t - 7.4) % 3;
  const caught = t > 17;
  const cupY = local < 0 ? 0 : caught ? Math.min(local, 0.5) * 80 : Math.min(local, 1.2) * 75;
  const broken = !caught && local > 1.2;
  return (
    <Col gap={14}>
      <Row gap={24}>
        <Pop>
          <Title size={64}>ROBOTIQUE</Title>
        </Pop>
        <Pop delay={0.2}>
          <Emoji size={90}>🤖</Emoji>
        </Pop>
      </Row>
      <div style={{position: 'relative', width: 600, height: 170}}>
        {local >= 0 && (
          <div style={{position: 'absolute', left: 260, top: cupY, fontSize: 90, transform: `rotate(${caught ? 0 : cupY / 2}deg)`}}>
            {broken ? '💥' : '☕'}
          </div>
        )}
        {caught && local < 0.6 && (
          <div style={{position: 'absolute', left: 240, top: cupY + 60, fontSize: 60}}>🤲</div>
        )}
        {local < 0 && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Sub color="white">la pièce manquante</Sub></div>}
      </div>
      {caught ? <Badge color={C.green}>⚡ RATTRAPÉE EN QUELQUES MS</Badge> : t > 11 && <Badge color={C.red}>PAS LE TEMPS DE RÉFLÉCHIR</Badge>}
    </Col>
  );
};

const Question: React.FC = () => {
  const {t} = useT();
  return (
    <Col gap={20}>
      <Pop>
        <Title size={64}>QUI DÉTIENT LE POUVOIR ?</Title>
      </Pop>
      <Row gap={24}>
        {t > 2.3 && (
          <Pop>
            <div style={{border: `4px solid ${C.cyan}`, borderRadius: 26, padding: '20px 26px', width: 400, textAlign: 'center',
              fontFamily: FONT, fontWeight: 800, fontSize: 38, color: 'white', background: '#0b1233cc'}}>
              ⚡ Celui qui prend la décision
            </div>
          </Pop>
        )}
        {t > 5.1 && (
          <Pop>
            <div style={{border: `4px solid ${C.yellow}`, borderRadius: 26, padding: '20px 26px', width: 400, textAlign: 'center',
              fontFamily: FONT, fontWeight: 800, fontSize: 38, color: 'white', background: '#0b1233cc'}}>
              ✍️ Celui qui a défini les cases
            </div>
          </Pop>
        )}
      </Row>
    </Col>
  );
};

const Outro: React.FC = () => {
  const {f} = useT();
  const pulse = 1 + Math.sin(f / 4) * 0.04;
  return (
    <Col gap={30}>
      <Pop>
        <Row gap={20}>
          <PlayBadge size={70} />
          <Brand size={84} />
        </Row>
      </Pop>
      <Pop delay={0.4}>
        <div style={{transform: `scale(${pulse})`, background: C.red, borderRadius: 30, padding: '22px 56px', fontFamily: FONT,
          fontWeight: 900, fontSize: 60, color: 'white', boxShadow: `0 0 50px ${C.red}`}}>
          🔔 ABONNE-TOI
        </div>
      </Pop>
    </Col>
  );
};

export const Graphic: React.FC<{scene: Scene}> = ({scene}) => {
  const enter = usePop(0, 15);
  const body = (() => {
    switch (scene.graphic) {
      case 'logo': return <Logo />;
      case 'chip': return <Chip scene={scene} />;
      case 'jev': return <Jev />;
      case 'system2': return <System2 />;
      case 'qcm': return <Qcm />;
      case 'mirrors': return <Mirrors />;
      case 'mirror': return <Mirror />;
      case 'spam': return <Spam />;
      case 'zeroshot': return <ZeroShot />;
      case 'switch': return <Switch />;
      case 'speedcost': return <SpeedCost />;
      case 'game': return <Game />;
      case 'fatigue': return <Fatigue />;
      case 'm2m': return <M2M />;
      case 'jevons': return <Jevons />;
      case 'robot': return <Robot />;
      case 'question': return <Question />;
      case 'outro': return <Outro />;
    }
  })();
  return (
    <div
      style={{
        position: 'absolute',
        left: PANEL.x,
        top: PANEL.y,
        width: PANEL.w,
        height: PANEL.h,
        borderRadius: 48,
        background: 'linear-gradient(180deg, #0b1233d9, #050816f2)',
        border: '3px solid #ffffff22',
        boxShadow: '0 30px 80px #000c',
        transform: `translateY(${interpolate(enter, [0, 1], [120, 0])}px)`,
        opacity: enter,
        overflow: 'hidden',
      }}
    >
      {body}
    </div>
  );
};
