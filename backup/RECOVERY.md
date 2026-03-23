# eSimConnect Recovery Guide

## If everything is lost, here's how to rebuild:

### 1. Code
git clone https://github.com/esimconnect/esimconnect.git
cd esimconnect
npm install

### 2. Supabase
- Create new project at https://supabase.com
- Go to SQL Editor
- Run backup/schema.sql
- Update src/lib/supabase.js with new URL and anon key

### 3. Cloudflare Pages
npm run build
npx wrangler pages deploy build --project-name esimconnect

### 4. Credentials needed
- SUPABASE_URL
- SUPABASE_ANON_KEY (publishable key)
- CLAUDE_API (Cloudflare Worker URL for Claude proxy)

### 5. Cloudflare Worker (Claude Proxy)
- Worker URL: https://claude-proxy.davidlimyk.workers.dev
- If lost, recreate the proxy worker in Cloudflare dashboard

## Current Live URLs
- App: https://esimconnect.pages.dev
- Supabase: https://emsovpcmdnuxrhbyvnvb.supabase.co
- GitHub: https://github.com/esimconnect/esimconnect.git
