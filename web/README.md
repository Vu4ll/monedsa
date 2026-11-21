# Monedsa website

Landing page and privacy policy for [monedsa.vu4ll.nl](https://monedsa.vu4ll.nl), built with [Astro](https://astro.build) as a fully static site in English, Turkish and Dutch.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static files in dist/
```

## Hosting

`dist/` is plain HTML, CSS and a few lines of JS, so any static file server works. Behind a Cloudflare Tunnel, point the tunnel at a local server for `dist/`, for example `npx serve dist -l 4321` or Caddy/nginx.

The app links to `/privacy-policy`, so keep that path.

## Content

- Copy for all languages: `src/i18n.ts`
- Privacy policy: `src/privacy.ts`
- Screenshots are placeholders until the final v2 build; see the `shots` section in `src/components/Landing.astro`.
