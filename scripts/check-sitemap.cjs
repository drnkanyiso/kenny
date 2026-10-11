const fs = require('node:fs');
const path = require('node:path');

const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
const config = fs.readFileSync('hugo.toml', 'utf8');
const baseURL = config.match(/^baseURL\s*=\s*"([^"]+)"/m)?.[1];
if (!baseURL || !/^https?:\/\//.test(baseURL)) throw new Error('Configure an absolute public baseURL in hugo.toml.');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const serviceFiles = fs.readdirSync('content/services').filter(name => name.endsWith('.md') && name !== '_index.md');
const expectedRoutes = ['/services/', ...serviceFiles.map(name => `/services/${name.slice(0, -3)}/`)];
const actualRoutes = locations.map(location => new URL(location, 'https://local.invalid').pathname);
const missing = expectedRoutes.filter(route => !actualRoutes.includes(route));
if (missing.length) throw new Error(`Services missing from sitemap: ${missing.join(', ')}`);
for (const location of locations) {
  if (!/^https?:\/\//.test(location)) throw new Error(`Sitemap URL must be absolute: ${location}`);
  if (new URL(location).origin !== new URL(baseURL).origin) throw new Error(`Unexpected sitemap domain: ${location}`);
}
console.log(`Sitemap includes all ${serviceFiles.length} services and the services overview.`);
