import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { downsample } from '@/lib/telemetry';
import { F, sp, usePalette } from '@/theme';

import { Muted, T } from './ui';

export interface ChartSeries {
  id: string;
  color: string;
  points: [number, number][];
  /** dibujar como escalones (marchas, freno) */
  step?: boolean;
  /** solo puntos (vueltas sueltas) */
  dots?: boolean;
  /** color por punto (p. ej. compuesto de neumático) */
  pointColors?: string[];
}

interface Props {
  title: string;
  unit?: string;
  series: ChartSeries[];
  height?: number;
  yDomain?: [number, number];
  invertY?: boolean;
  /** línea horizontal de referencia (p. ej. delta 0) */
  zeroLine?: number;
  xLabel?: (x: number) => string;
  yLabel?: (y: number) => string;
  /** marcas verticales con etiqueta (curvas) */
  marks?: { x: number; label: string }[];
}

const PAD = { l: 44, r: 8, t: 8, b: 20 };

function niceTicks(min: number, max: number, count = 4): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}

/** Gráfico de líneas en SVG, con ejes y escala comunes a todas las series. */
export function LineChart({ title, unit, series, height = 150, yDomain, invertY, zeroLine, xLabel, yLabel, marks }: Props) {
  const p = usePalette();
  const [width, setWidth] = useState(0);
  const all = series.flatMap((s) => s.points);
  if (!all.length) return null;

  const xs = all.map((pt) => pt[0]);
  const ys = all.map((pt) => pt[1]).filter((v) => isFinite(v));
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  let [yMin, yMax] = yDomain ?? [Math.min(...ys), Math.max(...ys)];
  if (!yDomain) {
    const padY = (yMax - yMin) * 0.06 || 1;
    yMin -= padY;
    yMax += padY;
  }
  const w = Math.max(0, width - PAD.l - PAD.r);
  const h = height - PAD.t - PAD.b;
  const sx = (x: number) => PAD.l + ((x - xMin) / (xMax - xMin || 1)) * w;
  const sy = (y: number) => {
    const f = (y - yMin) / (yMax - yMin || 1);
    return PAD.t + (invertY ? f : 1 - f) * h;
  };

  const path = (s: ChartSeries) => {
    const pts = downsample(s.points.filter((pt) => isFinite(pt[1])), Math.max(200, Math.floor(w)));
    return pts
      .map(([x, y], i) => {
        if (i === 0) return `M${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
        if (s.step) return `H${sx(x).toFixed(1)}V${sy(y).toFixed(1)}`;
        return `L${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
      })
      .join('');
  };

  return (
    <View style={st.wrap}>
      <View style={st.head}>
        <T v="smallMedium">{title}</T>
        {unit ? <Muted v="caption">{unit}</Muted> : null}
      </View>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            {niceTicks(yMin, yMax).map((v) => (
              <Line key={`y${v}`} x1={PAD.l} x2={width - PAD.r} y1={sy(v)} y2={sy(v)} stroke={p.line} strokeWidth={1} />
            ))}
            {niceTicks(yMin, yMax).map((v) => (
              <SvgText key={`yl${v}`} x={PAD.l - 4} y={sy(v) + 3} fontSize={9} fill={p.muted} textAnchor="end" fontFamily={F.mono}>
                {yLabel ? yLabel(v) : String(v)}
              </SvgText>
            ))}
            {niceTicks(xMin, xMax, 5).map((v) => (
              <SvgText key={`xl${v}`} x={sx(v)} y={height - 5} fontSize={9} fill={p.muted} textAnchor="middle" fontFamily={F.mono}>
                {xLabel ? xLabel(v) : String(v)}
              </SvgText>
            ))}
            {marks?.map((m) => (
              <SvgText key={`m${m.label}${m.x}`} x={sx(m.x)} y={PAD.t + 8} fontSize={8} fill={p.muted} textAnchor="middle">
                {m.label}
              </SvgText>
            ))}
            {zeroLine != null ? <Line x1={PAD.l} x2={width - PAD.r} y1={sy(zeroLine)} y2={sy(zeroLine)} stroke={p.muted} strokeDasharray="4 3" strokeWidth={1} /> : null}
            {series.map((s) =>
              s.dots ? (
                s.points.map(([x, y], i) => (
                  <Circle key={`${s.id}${i}`} cx={sx(x)} cy={sy(y)} r={2.6} fill={s.pointColors?.[i] ?? s.color} stroke={s.color} strokeWidth={0.8} />
                ))
              ) : (
                <Path key={s.id} d={path(s)} stroke={s.color} strokeWidth={1.6} fill="none" />
              ),
            )}
          </Svg>
        ) : null}
      </View>
    </View>
  );
}

/** Barras horizontales comparando valores (más corto = mejor si `lowerIsBetter`). */
export function CompareBars({ title, rows, format, lowerIsBetter = true }: { title: string; rows: { label: string; color: string; value: number }[]; format: (v: number) => string; lowerIsBetter?: boolean }) {
  const p = usePalette();
  const valid = rows.filter((r) => isFinite(r.value));
  if (!valid.length) return null;
  const best = lowerIsBetter ? Math.min(...valid.map((r) => r.value)) : Math.max(...valid.map((r) => r.value));
  const max = Math.max(...valid.map((r) => r.value));
  return (
    <View style={st.wrap}>
      <View style={st.head}>
        <T v="smallMedium">{title}</T>
      </View>
      {valid.map((r) => (
        <View key={r.label} style={st.barRow}>
          <Muted v="caption" style={st.barLabel} numberOfLines={1}>
            {r.label}
          </Muted>
          <View style={{ flex: 1, height: 8, backgroundColor: p.raised, borderRadius: 4 }}>
            <View style={{ width: `${Math.max(4, (r.value / max) * 100)}%`, height: 8, backgroundColor: r.color, borderRadius: 4 }} />
          </View>
          <T v="num" color={r.value === best ? p.ok : p.ink} style={st.barValue}>{format(r.value)}</T>
        </View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { marginTop: sp.xl },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: sp.sm },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginVertical: 4 },
  barLabel: { width: 70 },
  barValue: { width: 78, textAlign: 'right', fontSize: 13 },
});
