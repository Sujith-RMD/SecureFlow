import { useEffect, useRef } from 'react';

interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
  className?: string;
}

// Parse "#rrggbb" or "#rgb" to [r, g, b] 0-1
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const n = parseInt(full, 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`.trim();

const FRAG = `
precision highp float;
uniform vec2  u_resolution;
uniform float u_time;
uniform vec3  u_color;
uniform float u_speed;
uniform float u_scale;
uniform float u_noise;
uniform float u_rotation;

// --- hash / value noise helpers ---
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
        dot(hash2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
        dot(hash2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
}

// fbm — 4 octaves
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2  sh = vec2(1.7, 9.2);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p  = p * 2.0 + sh;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  // rotation
  float c = cos(u_rotation);
  float s = sin(u_rotation);
  uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

  uv *= u_scale;

  float t = u_time * u_speed * 0.15;

  // layered silk folds
  float n1 = fbm(uv + vec2(t * 0.6,  t * 0.3));
  float n2 = fbm(uv + vec2(-t * 0.4, t * 0.5) + vec2(n1 * u_noise * 1.8));
  float n3 = fbm(uv + vec2(t * 0.2, -t * 0.4) + vec2(n2 * u_noise * 1.2));

  float fold = n1 * 0.45 + n2 * 0.35 + n3 * 0.20;

  // light model — simulate a directional sheen
  float sheen = smoothstep(-0.3, 0.7, fold);
  float shadow = smoothstep(0.6, -0.2, fold);

  vec3 base    = u_color;
  vec3 bright  = min(base * 2.2, vec3(1.0));
  vec3 dark    = base * 0.18;

  vec3 col = mix(dark, base,   shadow);
  col      = mix(col,  bright, sheen * 0.65);

  // subtle vignette
  vec2 vig = gl_FragCoord.xy / u_resolution - 0.5;
  float v  = 1.0 - dot(vig, vig) * 1.4;
  col *= clamp(v, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`.trim();

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

const Silk: React.FC<SilkProps> = ({
  speed = 5,
  scale = 1,
  color = '#5227FF',
  noiseIntensity = 1.5,
  rotation = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, 'u_resolution');
    const uTime  = gl.getUniformLocation(prog, 'u_time');
    const uColor = gl.getUniformLocation(prog, 'u_color');
    const uSpeed = gl.getUniformLocation(prog, 'u_speed');
    const uScale = gl.getUniformLocation(prog, 'u_scale');
    const uNoise = gl.getUniformLocation(prog, 'u_noise');
    const uRot   = gl.getUniformLocation(prog, 'u_rotation');

    const rgb = hexToRgb(color);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const start = performance.now();

    const render = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform2f(uRes,   canvas.width, canvas.height);
      gl.uniform1f(uTime,  t);
      gl.uniform3f(uColor, rgb[0], rgb[1], rgb[2]);
      gl.uniform1f(uSpeed, speed);
      gl.uniform1f(uScale, scale);
      gl.uniform1f(uNoise, noiseIntensity);
      gl.uniform1f(uRot,   rotation);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buf);
    };
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
      style={{ display: 'block' }}
    />
  );
};

export default Silk;
