// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import vercel from "@astrojs/vercel/static"; // ✅ add this

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  output: "static", // ✅ important for vercel static deploy
  adapter: vercel(), // ✅ use vercel adapter
  integrations: [mdx(), sitemap(), vue()],

  vite: {
    plugins: [tailwindcss()],
  },
});
