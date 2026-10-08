import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import type { Circuit } from '@/api/openf1';
import { rotate } from '@/lib/telemetry';
import { F, usePalette } from '@/theme';

interface Props {
  circuit?: Circuit;
  /** recorrido de la vuelta con la distancia de cada punto */
  path: { x: number; y: number; d: number }[];
  /** mini-sectores con el más rápido (0 = A, 1 = B) */
  sectors: { from: number; to: number; faster: 0 | 1 }[];
  colors: [string, string];
}

/** Mapa del circuito con la vuelta pintada según quién fue más rápido en cada mini-sector. */
export function TrackMap({ circuit, path, sectors, colors }: Props) {
  const p = usePalette();
  const [width, setWidth] = useState(0);
  const rot = circuit?.rotation ?? 0;

  const outline = (circuit?.x ?? []).map((x, i) => rotate(x, circuit!.y[i], rot));
  const lap = path.map((pt) => ({ ...pt, r: rotate(pt.x, pt.y, rot) }));
  const pts = [...outline, ...lap.map((l) => l.r)];
  if (!pts.length) return null;

  const minX = Math.min(...pts.map((q) => q[0]));
  const maxX = Math.max(...pts.map((q) => q[0]));
  const minY = Math.min(...pts.map((q) => q[1]));
  const maxY = Math.max(...pts.map((q) => q[1]));
  const pad = 18;
  const w = width - pad * 2;
  const scale = w / (maxX - minX || 1);
  const height = Math.min(360, (maxY - minY) * scale + pad * 2);
  const hScale = (height - pad * 2) / (maxY - minY || 1);
  const k = Math.min(scale, hScale);
  const sx = (x: number) => pad + (x - minX) * k + (w - (maxX - minX) * k) / 2;
  const sy = (y: number) => height - pad - (y - minY) * k;

  const outlinePath = outline.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join('');
  const faster = (d: number) => sectors.find((s) => d >= s.from && d < s.to)?.faster ?? 0;

  // Agrupa puntos consecutivos con el mismo color en un solo trazo.
  const runs: { color: string; d: string }[] = [];
  lap.forEach((pt, i) => {
    const c = colors[faster(pt.d)];
    const seg = `${sx(pt.r[0]).toFixed(1)},${sy(pt.r[1]).toFixed(1)}`;
    const last = runs[runs.length - 1];
    if (!last || last.color !== c) {
      const prev = i > 0 ? `M${sx(lap[i - 1].r[0]).toFixed(1)},${sy(lap[i - 1].r[1]).toFixed(1)}L${seg}` : `M${seg}`;
      runs.push({ color: c, d: prev });
    } else {
      last.d += `L${seg}`;
    }
  });

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ marginTop: 10 }}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {outlinePath ? <Path d={outlinePath} stroke={p.line} strokeWidth={9} fill="none" strokeLinejoin="round" /> : null}
          {runs.map((r, i) => (
            <Path key={i} d={r.d} stroke={r.color} strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {circuit?.corners.map((c) => {
            const [x, y] = rotate(c.trackPosition.x, c.trackPosition.y, rot);
            const a = ((c.angle + rot) * Math.PI) / 180;
            const ox = sx(x) + Math.cos(a) * 14;
            const oy = sy(y) - Math.sin(a) * 14;
            return (
              <G key={`${c.number}${c.letter ?? ''}`}>
                <Circle cx={ox} cy={oy} r={7} fill={p.surface} stroke={p.muted} strokeWidth={0.8} />
                <SvgText x={ox} y={oy + 3} fontSize={8} fill={p.ink} textAnchor="middle" fontFamily={F.mono}>
                  {`${c.number}${c.letter ?? ''}`}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}
