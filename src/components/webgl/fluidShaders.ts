/**
 * GLSL for <EvidenceReveal>: a small Stam-style stable-fluids solver
 * (splat → advect → vorticity → divergence → Jacobi pressure → gradient
 * subtract → advect dye), plus
 * the composite pass that turns the dye into a mask over the evidence
 * plate. Every pass draws one full-screen quad; nothing here is per-vertex.
 */

export const quadVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/** Adds a gaussian of `u_value` into the target at the pointer. Used for
 *  both velocity (xy = pointer velocity) and dye (x = density). */
export const splatFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_target;
  uniform vec2 u_point;
  uniform vec3 u_value;
  uniform float u_radius;
  uniform float u_aspect;
  void main() {
    vec2 p = vUv - u_point;
    p.x *= u_aspect;
    float g = exp(-dot(p, p) / (u_radius * u_radius));
    gl_FragColor = vec4(texture2D(u_target, vUv).xyz + g * u_value, 1.0);
  }
`;

export const advectFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_velocity;
  uniform sampler2D u_source;
  uniform vec2 u_texel;
  uniform float u_dissipation;
  void main() {
    vec2 back = vUv - texture2D(u_velocity, vUv).xy * u_texel;
    gl_FragColor = texture2D(u_source, back) * u_dissipation;
  }
`;

/** Vorticity confinement, cheap form: pushes velocity along the curl
 *  gradient so the trail breaks into eddies instead of a straight smear. */
export const curlFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_velocity;
  uniform vec2 u_texel;
  uniform float u_curl;
  void main() {
    float L = texture2D(u_velocity, vUv - vec2(u_texel.x, 0.0)).y;
    float R = texture2D(u_velocity, vUv + vec2(u_texel.x, 0.0)).y;
    float T = texture2D(u_velocity, vUv + vec2(0.0, u_texel.y)).x;
    float B = texture2D(u_velocity, vUv - vec2(0.0, u_texel.y)).x;
    vec2 vel = texture2D(u_velocity, vUv).xy;
    float s = u_curl * 0.00015;
    vel += s * vec2(T - B, L - R);
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

export const divergenceFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_velocity;
  uniform vec2 u_texel;
  void main() {
    float L = texture2D(u_velocity, vUv - vec2(u_texel.x, 0.0)).x;
    float R = texture2D(u_velocity, vUv + vec2(u_texel.x, 0.0)).x;
    float T = texture2D(u_velocity, vUv + vec2(0.0, u_texel.y)).y;
    float B = texture2D(u_velocity, vUv - vec2(0.0, u_texel.y)).y;
    gl_FragColor = vec4(0.5 * ((R - L) + (T - B)), 0.0, 0.0, 1.0);
  }
`;

export const pressureFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_pressure;
  uniform sampler2D u_divergence;
  uniform vec2 u_texel;
  void main() {
    float L = texture2D(u_pressure, vUv - vec2(u_texel.x, 0.0)).r;
    float R = texture2D(u_pressure, vUv + vec2(u_texel.x, 0.0)).r;
    float T = texture2D(u_pressure, vUv + vec2(0.0, u_texel.y)).r;
    float B = texture2D(u_pressure, vUv - vec2(0.0, u_texel.y)).r;
    float div = texture2D(u_divergence, vUv).r;
    gl_FragColor = vec4((L + R + T + B - div) * 0.25, 0.0, 0.0, 1.0);
  }
`;

export const gradientFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_velocity;
  uniform sampler2D u_pressure;
  uniform vec2 u_texel;
  void main() {
    float L = texture2D(u_pressure, vUv - vec2(u_texel.x, 0.0)).r;
    float R = texture2D(u_pressure, vUv + vec2(u_texel.x, 0.0)).r;
    float T = texture2D(u_pressure, vUv + vec2(0.0, u_texel.y)).r;
    float B = texture2D(u_pressure, vUv - vec2(0.0, u_texel.y)).r;
    vec2 vel = texture2D(u_velocity, vUv).xy - 0.5 * vec2(R - L, T - B);
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

/**
 * The mask, at simulation resolution. Dye density becomes a mask with a
 * simplex-noise eroded edge (the source's look — the reveal tears open
 * rather than fading in), and the band just outside it becomes the rim.
 * Packed as R = mask, G = rim. This used to run per screen pixel inside the
 * composite — two 3D simplex evaluations for ~1.3M pixels a frame (5M on a
 * retina screen), which was most of the effect's cost. At sim resolution
 * it is ~1/16th of that, and linear filtering in the composite hides the
 * difference: the edge is noise-eroded and soft by design.
 */
export const maskFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_density;
  uniform float u_time;
  uniform float u_progress;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
      i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
      i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    float density = texture2D(u_density, vUv).r * 3.0 * u_progress;
    float t = u_time * 0.5;
    vec2 q = vUv * vec2(9.0, 6.0);
    float n = (snoise(vec3(q, t)) - 1.0 + (snoise(vec3(q * 0.5, t * 0.7)) - 1.0) * 0.5) * 0.7;
    float field = n * 1.05 + pow(max(density, 0.0), 1.5);
    float mask = smoothstep(0.35, 0.55, field);
    float rim = smoothstep(0.26, 0.37, field) * (1.0 - smoothstep(0.37, 0.5, field));
    gl_FragColor = vec4(mask, rim, 0.0, 1.0);
  }
`;

/**
 * The composite: two texture reads per pixel. The mask's boundary carries
 * the rim in --data — the edge of the lens, drawn as light, and the only
 * luminous thing in the effect; telemetry blue, never seal green, because
 * revealing the evidence is inspection, not verification.
 */
export const compositeFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_plate;
  uniform sampler2D u_mask;
  uniform vec2 u_parallax;
  uniform vec3 u_rim;

  void main() {
    vec2 m = texture2D(u_mask, vUv).rg;
    vec4 plate = texture2D(u_plate, vUv + u_parallax);
    float a = plate.a * m.r;
    // Premultiplied out: the canvas is composited with alpha over the page.
    gl_FragColor = vec4(plate.rgb * a + u_rim * m.g * 0.55, clamp(a + m.g * 0.35, 0.0, 1.0));
  }
`;
