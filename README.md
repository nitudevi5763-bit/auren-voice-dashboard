# Auren Voice Dashboard

Internal admin dashboard for Auren.ai's voice agent platform. Lets you create, pause, and delete client voice agents by writing directly to the `clients` table in Supabase — the same table the LiveKit agent (`auren-voice-platform` on Railway) reads from on every call.

## Stack
Next.js 14 (App Router) · Tailwind CSS · Supabase (service role, server-side only)

## Env vars (set in Vercel)
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
