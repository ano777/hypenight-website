/*
  Inside Miss Ginko, rendered with three.js.

  One full-screen quad samples the venue film (real footage of wooden doors
  swinging open, then the glasshouse, sundown and the bar), scrubbed by scroll,
  with sharpening, grain, vignette, letterbox and a sunset wash. For the last
  chapter it dissolves into a clip of the DJ and the floor, which plays and fills the strip.

  main.js owns the scroll pin and the HUD and calls HN_INSIDE.render(p)
  with the section's progress (0 to 1).
*/
import * as THREE from "three";

const state = window.HN_INSIDE;
const stage = document.querySelector("[data-inside]");
const canvas = document.querySelector("[data-inside-canvas]");

if (state && stage && canvas) init();

function init() {
  const mobile = matchMedia("(max-width: 860px)").matches;
  const FILM_RATIO = 1920 / 780;
  const DANCE_RATIO = 720 / 880; // the DJ clip for the floor
  // Progress marks where each chapter starts, and the film time it maps to:
  // 0 to .12 the doors open, then glasshouse, sundown, bar; after .84 the dance floor.
  const P_MARKS = [0, .12, .40, .62, .84];
  const T_MARKS = [0, 2.45, 6.75, 10.4, 12.95];

  const clamp01 = v => Math.min(1, Math.max(0, v));
  const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ------------------------------------------------------------ renderer */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  } catch (e) {
    state.fail?.();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.autoClear = false;
  renderer.setClearColor(0x050203, 1);

  // Videos load into memory as blobs: fully seekable on any host (Safari refuses
  // to play or seek files from servers without range requests) and never waiting
  // on the network mid-scroll.
  const makeVideo = loop => {
    const v = document.createElement("video");
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.loop = loop;
    v.preload = "auto";
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("aria-hidden", "true");
    v.style.cssText = "position:absolute;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none";
    stage.appendChild(v);
    return v;
  };
  const loadInto = (v, url) => fetch(url).then(r => r.blob()).then(b => {
    v.src = URL.createObjectURL(b);
    v.load();
  });
  const videoTexture = v => {
    const tex = new THREE.VideoTexture(v);
    tex.colorSpace = THREE.NoColorSpace; // keep the video's own sRGB values
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  };

  /* ---------------------------------------------------------------- film */
  const film = makeVideo(false);
  const dance = makeVideo(true);
  const filmTex = videoTexture(film);
  const danceTex = videoTexture(dance);

  const loadWatch = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    loadWatch.disconnect();
    loadInto(film, "assets/ginko/inside-film.mp4")
      // iOS decodes nothing until a play; the "playing" handler below pauses it straight away.
      .then(() => film.play().catch(() => {}))
      .catch(() => {});
    loadInto(dance, "assets/ginko/party-dj.mp4").catch(() => {});
  }, { rootMargin: "150% 0px" });
  loadWatch.observe(stage);

  // iPhones in Low Power Mode refuse even muted autoplay until the first touch.
  const unlock = () => {
    if (film.src && film.readyState < 2) film.play().catch(() => {});
    if (dancing) dance.play().catch(() => {});
  };
  ["touchstart", "pointerdown"].forEach(ev => addEventListener(ev, unlock, { passive: true }));

  const posterTex = new THREE.TextureLoader().load("assets/ginko/inside-poster.jpg");
  posterTex.colorSpace = THREE.NoColorSpace;
  posterTex.generateMipmaps = false;
  posterTex.minFilter = THREE.LinearFilter;

  const filmMat = new THREE.ShaderMaterial({
    toneMapped: false,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uFilm: { value: posterTex },
      uDance: { value: danceTex },
      uTexel: { value: new THREE.Vector2(1 / 1920, 1 / 780) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uDraw: { value: new THREE.Vector2(1, 1) },
      uBar: { value: 0 },
      uZoom: { value: 1 },
      uTime: { value: 0 },
      uWash: { value: 0 },
      uSharp: { value: .55 },
      uLift: { value: 0 },
      uParty: { value: 0 },
      uDanceRatio: { value: DANCE_RATIO }
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform sampler2D uFilm, uDance;
      uniform vec2 uTexel, uRes, uDraw;
      uniform float uBar, uZoom, uTime, uWash, uSharp, uLift, uParty, uDanceRatio;
      varying vec2 vUv;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

      void main() {
        vec2 frag = vUv * uRes;
        // letterbox bars
        if (frag.y < uBar || frag.y > uRes.y - uBar) { gl_FragColor = vec4(0.02, 0.008, 0.012, 1.0); return; }

        vec2 uv = (frag - (uRes - uDraw) * 0.5) / uDraw;
        uv = (uv - 0.5) / uZoom + 0.5;

        // contrast-adaptive sharpening (AMD CAS, 5 taps)
        vec3 c = texture2D(uFilm, uv).rgb;
        vec3 n = texture2D(uFilm, uv + vec2(0.0, uTexel.y)).rgb;
        vec3 s = texture2D(uFilm, uv - vec2(0.0, uTexel.y)).rgb;
        vec3 e = texture2D(uFilm, uv + vec2(uTexel.x, 0.0)).rgb;
        vec3 w = texture2D(uFilm, uv - vec2(uTexel.x, 0.0)).rgb;
        vec3 mn = min(c, min(min(n, s), min(e, w)));
        vec3 mx = max(c, max(max(n, s), max(e, w)));
        vec3 amp = sqrt(clamp(min(mn, 1.0 - mx) / max(mx, vec3(1e-4)), 0.0, 1.0));
        vec3 wgt = amp * (-1.0 / mix(8.0, 4.5, uSharp));
        vec3 col = clamp((c + (n + s + e + w) * wgt) / (1.0 + 4.0 * wgt), 0.0, 1.0);

        // lift the shadows on the dark door shot so the wood grain shows
        col = pow(col, vec3(1.0 / (1.0 + uLift)));

        // the dance floor: cover the visible strip with the portrait clip
        if (uParty > 0.0) {
          vec2 box = vec2(min(uDraw.x, uRes.x), uRes.y - 2.0 * uBar);
          vec2 dv = (frag - vec2((uRes.x - box.x) * 0.5, uBar)) / box;
          float boxRatio = box.x / box.y;
          if (boxRatio > uDanceRatio) {
            // keep the DJ in frame: lean the crop toward the top of the clip
            float k = uDanceRatio / boxRatio;
            dv.y = (dv.y - 0.5) * k + clamp(0.7, k * 0.5, 1.0 - k * 0.5);
          }
          else dv.x = (dv.x - 0.5) * (boxRatio / uDanceRatio) + 0.5;
          dv = (dv - 0.5) / mix(1.08, 1.0, uParty) + 0.5;
          col = mix(col, texture2D(uDance, dv).rgb, uParty);
        }

        // sunset wash, soft-light blend
        vec3 sun = mix(vec3(1.0, 0.78, 0.16), vec3(0.88, 0.14, 0.17), vUv.y < 0.5 ? 1.0 - vUv.y * 2.0 : 0.0);
        vec3 soft = mix(2.0 * col * sun + col * col * (1.0 - 2.0 * sun),
                        sqrt(col) * (2.0 * sun - 1.0) + 2.0 * col * (1.0 - sun), step(0.5, sun));
        col = mix(col, soft, uWash);

        // vignette and grain
        vec2 q = vUv - 0.5;
        col *= mix(1.0, smoothstep(0.95, 0.25, length(q * vec2(1.0, 1.3))), 0.55 - uLift * 0.4);
        col += (hash(frag + fract(uTime) * 91.7) - 0.5) * 0.045;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const filmScene = new THREE.Scene();
  const filmQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), filmMat);
  filmQuad.frustumCulled = false;
  filmScene.add(filmQuad);
  const filmCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Scrub the film: one seek in flight at a time, and a new one only when the target moved.
  let targetTime = 0;
  let askedTime = -1;
  let filmReady = false;
  const seek = () => {
    if (!filmReady || film.seeking) return;
    if (Math.abs(targetTime - askedTime) < 1 / 120) return;
    askedTime = targetTime;
    film.currentTime = targetTime;
  };
  const markReady = () => {
    if (filmReady || film.readyState < 2) return;
    filmReady = true;
    filmMat.uniforms.uFilm.value = filmTex;
    filmTex.needsUpdate = true;
    seek();
  };
  film.addEventListener("seeked", () => { filmTex.needsUpdate = true; seek(); });
  // The film is only ever scrubbed: if anything starts playback, stop it and snap back to the scroll.
  film.addEventListener("playing", () => film.pause());
  ["pause", "ended"].forEach(ev => film.addEventListener(ev, () => { markReady(); askedTime = -1; seek(); }));
  ["loadeddata", "canplay", "canplaythrough"].forEach(ev => film.addEventListener(ev, markReady));

  /* -------------------------------------------------------------- layout */
  let cw = 1, ch = 1;
  const layout = { coverW: 1, coverH: 1, bandW: 1, bandH: 1, bar: 0 };
  const resize = () => {
    cw = stage.clientWidth; ch = stage.clientHeight;
    renderer.setSize(cw, ch, false);

    // Cover: fill the whole stage while the doors open.
    layout.coverH = Math.max(ch, cw / FILM_RATIO);
    layout.coverW = layout.coverH * FILM_RATIO;
    // Band: a cinematic strip at least half the screen tall; the sides crop on narrow screens.
    let bandH = Math.min(ch, Math.max(cw / FILM_RATIO, ch * .5));
    let bandW = bandH * FILM_RATIO;
    if (bandW < cw) { bandW = cw; bandH = cw / FILM_RATIO; }
    layout.bandW = bandW; layout.bandH = bandH;
    layout.bar = Math.max(0, (ch - Math.min(ch, bandH)) / 2);
    state.setBars?.(layout.bar);
  };
  new ResizeObserver(resize).observe(stage);

  /* -------------------------------------------------------------- render */
  let progress = 0;
  let visible = false;
  let dancing = false;
  const filmTimeAt = p => {
    for (let i = 1; i < P_MARKS.length; i++) {
      if (p <= P_MARKS[i]) return lerp(T_MARKS[i - 1], T_MARKS[i], (p - P_MARKS[i - 1]) / (P_MARKS[i] - P_MARKS[i - 1]));
    }
    return T_MARKS[T_MARKS.length - 1];
  };
  const setDancing = on => {
    if (on === dancing) return;
    dancing = on;
    if (on) dance.play().catch(() => {});
    else dance.pause();
  };

  state.render = p => {
    progress = p;
    targetTime = filmTimeAt(p);
    seek();
    setDancing(visible && p > .8);
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    setDancing(visible && progress > .8);
  }).observe(stage);

  let last = performance.now(), t = 0;
  const frame = now => {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, .05);
    last = now;
    if (!visible) return;
    t += dt;
    const p = progress;

    const enter = easeInOut(clamp01(p / .115));
    const party = dance.readyState >= 2 ? smooth(.835, .875, p) : 0;
    // the letterbox opens back up for the dance floor so the clip fills the screen
    const bars = smooth(.095, .135, p) * (1 - party);
    const u = filmMat.uniforms;
    const pr = renderer.getPixelRatio();
    u.uRes.value.set(cw * pr, ch * pr);
    u.uDraw.value.set(lerp(layout.coverW, layout.bandW, bars) * pr, lerp(layout.coverH, layout.bandH, bars) * pr);
    u.uBar.value = layout.bar * bars * pr;
    u.uZoom.value = lerp(1.1, 1, enter);
    u.uLift.value = (1 - smooth(.08, .12, p)) * .55;
    u.uWash.value = smooth(.37, .4, p) * (1 - smooth(.4, .445, p)) * .8;
    u.uParty.value = party;
    u.uTime.value = t;

    renderer.clear();
    renderer.render(filmScene, filmCam);
  };

  resize();
  requestAnimationFrame(frame);
}
