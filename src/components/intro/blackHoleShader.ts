/**
 * Fragment shader for the intro black hole.
 *
 * This is a screen-space approximation, not a relativistic raytrace: for
 * each pixel we take the impact parameter r from the centre and bend the
 * background lookup outward by ~1/r², which reproduces the two effects a
 * viewer actually reads as "black hole" — the Einstein ring smearing
 * stars around the shadow, and the shadow itself. A true geodesic
 * integrator costs an inner loop per pixel and buys nothing at this size.
 *
 * The accretion disk is drawn as a rotated ellipse with fbm turbulence
 * and a left/right brightness asymmetry standing in for relativistic
 * beaming (the side rotating toward the viewer is brighter).
 *
 * uProgress (0→1, driven by the reader's scroll) ramps: the disk igniting,
 * the camera closing in, and the photon ring sharpening.
 */
export const BLACK_HOLE_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
uniform float uProgress;
uniform vec3  uDiskWarm;
uniform vec3  uDiskCool;
uniform vec3  uRing;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

/* Procedural starfield sampled in the lensed direction. Three density
   layers so the field keeps depth when the lens stretches it. */
vec3 starfield(vec2 dir, float density, float scale, float bright) {
  vec2 g = dir * scale;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash21(id);
  if (h < density) return vec3(0.0);
  vec2 off = (vec2(hash21(id + 1.7), hash21(id + 4.3)) - 0.5) * 0.7;
  float d = length(f - off);
  float star = 1.0 - smoothstep(0.0, 0.09, d);
  // slow twinkle, deterministic per star
  float tw = 0.75 + 0.25 * sin(uTime * 0.8 + h * 40.0);
  return vec3(star * tw * bright);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  float p = clamp(uProgress, 0.0, 1.0);
  float eased = p * p * (3.0 - 2.0 * p);

  // camera closes in as the reader scrolls
  float zoom = mix(1.55, 0.92, eased);
  uv *= zoom;

  float r = max(length(uv), 1e-4);
  float angle = atan(uv.y, uv.x);

  float Rs = 0.135;                       // shadow radius
  float photon = Rs * 1.5;                // photon ring

  /* Lensing: push the background sample outward near the mass. The 1/r²
     falloff keeps distant pixels essentially unbent. */
  float bend = (Rs * Rs * 1.35) / (r * r);
  vec2 lensed = uv * (1.0 + bend);

  vec3 col = vec3(0.0);

  // ---- background stars, lensed ----
  vec3 stars = starfield(lensed, 0.985, 26.0, 1.0)
             + starfield(lensed * 1.9 + 11.0, 0.991, 42.0, 0.55)
             + starfield(lensed * 3.3 + 27.0, 0.994, 70.0, 0.3);
  // stars fade slightly as the disk ignites so the disk stays dominant
  col += stars * (1.0 - 0.35 * eased);

  // ---- accretion disk ----
  // squash vertically for an inclined viewing angle
  float incline = mix(0.34, 0.22, eased);
  vec2 duv = vec2(uv.x, uv.y / incline);
  float dr = length(duv);

  float inner = photon * 1.12;
  float outer = mix(0.44, 0.60, eased);

  float band = smoothstep(inner, inner * 1.35, dr) * (1.0 - smoothstep(outer * 0.72, outer, dr));

  // differential rotation: inner material orbits faster
  float spin = uTime * (0.28 + 0.55 / max(dr, 0.12));
  float turb = fbm(vec2(angle * 2.6 + spin, dr * 7.0 - uTime * 0.16));
  turb = mix(0.55, 1.35, turb);

  // relativistic beaming stand-in: approaching side brighter
  float beaming = 0.55 + 0.75 * smoothstep(-1.0, 1.0, cos(angle));

  float diskAmt = band * turb * beaming * eased;

  // hotter toward the inside edge
  float heat = 1.0 - smoothstep(inner, outer * 0.8, dr);
  vec3 diskCol = mix(uDiskCool, uDiskWarm, heat);
  col += diskCol * diskAmt * 1.15;

  // the disk seen *through* the lens above and below the shadow
  float halo = (1.0 - smoothstep(photon, photon * 1.9, r)) * smoothstep(Rs * 0.92, photon, r);
  col += diskCol * halo * 0.5 * eased;

  // ---- photon ring ----
  float ringWidth = mix(0.020, 0.009, eased);
  float ring = 1.0 - smoothstep(0.0, ringWidth, abs(r - photon));
  col += uRing * ring * (0.45 + 1.5 * eased);

  // soft outer glow
  col += uRing * (1.0 - smoothstep(photon, photon * 3.4, r)) * 0.05 * eased;

  // ---- event horizon: nothing escapes ----
  float shadow = smoothstep(Rs * 0.965, Rs, r);
  col *= shadow;

  // gentle vignette so the panel edges recede
  col *= 1.0 - 0.55 * smoothstep(0.42, 1.25, length(uv));

  // filmic-ish rolloff, keeps the ring from clipping harshly
  col = col / (col + vec3(0.85));
  col = pow(col, vec3(0.4545));

  gl_FragColor = vec4(col, 1.0);
}
`;

export const FULLSCREEN_VERTEX = /* glsl */ `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;
