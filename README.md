# HypeNight website (prototype)

Static site, no build step. GSAP + ScrollTrigger + Lenis and three.js 0.186.1 are vendored in `js/vendor/`.

## Host it

Plain static files: no build step, no server code, no database. Upload this folder as it is,
with `index.html` at the root, to any static host:

- **Netlify:** drag the folder onto app.netlify.com/drop.
- **Vercel:** `vercel` from this folder, or import it in the dashboard with Framework "Other" and no build command.
- **Cloudflare Pages / GitHub Pages:** publish the folder root; no build command.
- **Any web server (Apache, Nginx, cPanel):** copy the files into the public web root.

Notes for whoever hosts it:

- Serve it over HTTPS. Opening `index.html` by double-clicking (a `file://` address) won't work:
  the Miss Ginko walk-through loads its video and three.js module over HTTP.
- After an update, bump the `?v=` number on the CSS and JS links in `index.html` so visitors
  don't get stale cached files.
- Fonts load from Google Fonts; everything else is in this folder.

## Run it locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Edit events

Everything event-related lives in `js/data.js`:

- `whatsapp` is the number every inquiry button opens a chat with.
- `events` holds upcoming and past events. An event counts as upcoming until its
  `start` time passes; the soonest one becomes the hero automatically.
- `posters` are the six posters dealt onto the "past nights" wall.
- `moments` are the reel covers in the red scanner strip.
- `venues` are the highlight covers shown as stickers.

## Inside Miss Ginko (scroll walk-through)

Rendered with three.js in `js/inside3d.js`: `assets/ginko/inside-film.mp4` scrubbed by scroll on a
full-screen shader (sharpening, grain, letterbox, sunset wash, shadow lift on the door shot).
`js/main.js` owns the scroll pin, captions, clock and the Miss Ginko logo on the doors.

- `inside-film.mp4` is one 13 s, 1920×780, 30 fps H.264 file: a real door-opening shot
  (Pexels video 39877024, free Pexels licence) then the glasshouse, sundown and bar, joined with dissolves, a keyframe every 10 frames so seeking stays fast. It is loaded into memory as a blob,
  so scrubbing never waits on the network (and works on servers without range requests).
- Chapter timing: `P_MARKS` (scroll progress) and `T_MARKS` (film seconds) in `js/inside3d.js`;
  captions and the clock use `CHAPTERS` and `CLOCK` in `js/main.js`.
- `party-dj.mp4` (the DJ in the white shirt, from a @tatrixmusic reel) plays in the same shader for The Floor and fills the screen.
- Videos are fetched as blobs and unlocked with a muted play (and on first touch for iOS Low Power Mode).
- Swapping in the client's own footage: rebuild `inside-film.mp4` with the same shot order and
  update `T_MARKS` to where each dissolve lands.

Images live in `assets/img/`. Untouched Instagram originals are in `_source/` (not needed for deploy).

## Nightlife styling

The About opener, the "How a drunch runs" steps and the "Let's talk" form follow the nightlife
reference (hazy crowd photos, huge condensed type, bracketed steps). Photos are graded from the
party reels into `assets/night/`.

## Light and dark theme

The moon/sun button in the nav switches themes; the choice is saved in the browser, and first-time
visitors get their system setting. Dark mode only re-colours the light sections (see "dark theme"
in `css/style.css`). The About photo is Pexels 14925309 (free Pexels licence).

## Before launch

- Confirm the WhatsApp number (currently the RSVP number from the Diwali Drunch poster).
- Confirm the Festive Drunch act name: poster reads "Vivek — Kash", caption says "Viper & Kash".
- Story highlights need an Instagram login to view; add those photos to `moments` once the client shares them.
- Venue footage belongs to Mr Viewtuber (YouTube), Miss Ginko and Tatrix (Instagram). Get written permission,
  or replace it with footage the client shoots, before the site goes public.
