# The West Side Studios: website

Astro + Tailwind v4 + GSAP/ScrollTrigger + Lenis + Barba + three.js. Design and motion replicate 1367studio.com (see `../MASTER-PROMPT.md`).

```
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/ (deploy to Vercel)
```

## Where things live
- All copy, projects, posts, offices, testimonials: `src/data/content.ts`
- Hero film: `public/hero-video.mp4` (+ `-mobile`, `hero-poster.jpg`). Source scene: `../brand/film/film.html`
- Wordmark: `public/wordmark.svg`, letters for the footer gravity effect: `src/data/wordmark-letters.json`
- Motion code: `src/scripts/app.ts` (page systems + Barba), `header.ts`, `globe.ts`, `objectViewer.ts`

## Before launch: replace PLACEHOLDERs in content.ts
- Email (`hello@thewestsidestudios.com`), office cities / addresses, globe cities
- Testimonials (currently sample quotes with generic roles; need real quotes, names and photos)
- About stats
- Confirm The Sourcers and Crumble Pakistan may be shown as client work
- The contact form posts to FormSubmit using SITE.email; the first submission triggers a one-time activation email
