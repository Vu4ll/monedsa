# Monedsa website

Landing page and privacy policy for [monedsa.vu4ll.nl](https://monedsa.vu4ll.nl), built with [Astro](https://astro.build) as a fully static site in English, Turkish and Dutch.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static files in dist/
```

## Hosting

The site runs on Cloudflare Workers static assets (worker `monedsa`, config in `wrangler.jsonc`) with `monedsa.vu4ll.nl` as a custom domain. Workers Builds deploys it on every push to the production branch (root path `web`). To deploy by hand: `npm run build && npx wrangler deploy`.

The app links to `/privacy-policy`, so keep that path.

## Content

- Copy for all languages: `src/i18n.ts`
- Privacy policy: `src/privacy.ts`
- Screenshots are placeholders until the final v2 build; see the `shots` section in `src/components/Landing.astro`.
