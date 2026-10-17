/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Custom Post-Processing Shader for Threat Vignette Pulse,
 * Visual Haptic Screen Shake, and Chromatic Glitch Aberration.
 */
export const HackerTensionShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    threatIntensity: { value: 0.0 }, // 0.0 (safe) to 1.0 (imminent danger/chase)
    pulseSpeed: { value: 3.0 }, // pulse frequency in rad/s
    shakeAmount: { value: 0.0 }, // visual haptic jitter
    glitchIntensity: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float threatIntensity;
    uniform float pulseSpeed;
    uniform float shakeAmount;
    uniform float glitchIntensity;
    varying vec2 vUv;

    // Pseudo-random noise generator
    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;

      // 1. Visual Haptic Screen Jitter (micro UV displacement)
      if (shakeAmount > 0.0001) {
        float jx = (rand(vec2(time * 35.0, uv.y * 12.0)) - 0.5) * shakeAmount;
        float jy = (rand(vec2(uv.x * 12.0, time * 35.0)) - 0.5) * shakeAmount;
        uv += vec2(jx, jy);
      }

      // Horizontal glitch scanline shifts during intense chase/proximity
      if (glitchIntensity > 0.08) {
        float slice = step(0.95, rand(vec2(floor(uv.y * 32.0), floor(time * 16.0))));
        uv.x += slice * (rand(vec2(time, uv.y)) - 0.5) * glitchIntensity * 0.035;
      }

      vec2 centerOffset = uv - vec2(0.5);
      float dist = length(centerOffset);

      // 2. Heartbeat Rhythm Vignette Pulse
      // Dual-pulse heartbeat curve: primary systole + secondary rebound
      float heartCycle = mod(time * pulseSpeed, 6.28318);
      float beat = pow(max(0.0, sin(heartCycle)), 4.0) + 0.45 * pow(max(0.0, sin(heartCycle + 0.65)), 6.0);

      // Vignette contracts around screen periphery as threat rises and pulses with heart rate
      float vigRadius = 0.88 - threatIntensity * 0.38 * (0.7 + 0.3 * beat);
      float vigSoftness = 0.42;
      float vignette = smoothstep(vigRadius, vigRadius + vigSoftness, dist);

      // 3. Chromatic Aberration (RGB shift on periphery)
      float chromaOffset = threatIntensity * (0.003 + 0.007 * beat);
      vec2 chromaDir = normalize(centerOffset + vec2(0.0001));

      float r = texture2D(tDiffuse, uv - chromaDir * chromaOffset).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv + chromaDir * chromaOffset).b;
      vec4 baseCol = vec4(r, g, b, 1.0);

      // 4. Ominous Crimson Cyber Vignette Tint
      vec3 vignetteTint = mix(
        vec3(0.04, 0.04, 0.08), // Cold shadow
        vec3(0.85, 0.04, 0.08), // Menacing crimson warning
        clamp(threatIntensity * 1.3, 0.0, 1.0)
      );

      vec3 finalRgb = mix(baseCol.rgb, vignetteTint, vignette * threatIntensity * (0.75 + 0.25 * beat));

      // Subtle CRT surveillance scanlines when hacker is nearby
      if (threatIntensity > 0.15) {
        float scanline = sin(uv.y * 550.0) * 0.03 * threatIntensity;
        finalRgb -= vec3(scanline);
      }

      gl_FragColor = vec4(finalRgb, 1.0);
    }
  `,
};
