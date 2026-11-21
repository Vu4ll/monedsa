import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://monedsa.vu4ll.nl",
  trailingSlash: "ignore",
  build: { format: "directory" },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "tr", "nl"],
    routing: { prefixDefaultLocale: false },
  },
});
