import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from 'jsr:@supabase/server@^1';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_AVATAR_HOSTS = new Set(['cdn.discordapp.com', 'media.discordapp.net']);

function response(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

export default {
  fetch: withSupabase({ auth: 'none' }, async (request, context) => {
    if (request.method !== 'GET') return response('Method not allowed', 405);

    const token = new URL(request.url).searchParams.get('token') ?? '';
    if (!UUID_PATTERN.test(token)) return response('Not found', 404);

    const result = await context.supabaseAdmin
      .from('reviews')
      .select('discord_avatar_url')
      .eq('public_avatar_token', token)
      .eq('status', 'approved')
      .maybeSingle();
    const review = result.data as unknown as { discord_avatar_url: string | null } | null;

    if (result.error || !review?.discord_avatar_url) return response('Not found', 404);

    let avatarUrl: URL;
    try {
      avatarUrl = new URL(review.discord_avatar_url);
    } catch {
      return response('Not found', 404);
    }
    if (avatarUrl.protocol !== 'https:' || !ALLOWED_AVATAR_HOSTS.has(avatarUrl.hostname)) {
      return response('Not found', 404);
    }
    avatarUrl.searchParams.set('size', '128');

    const avatarResponse = await fetch(avatarUrl, { redirect: 'error' });
    const contentType = avatarResponse.headers.get('content-type') ?? '';
    if (!avatarResponse.ok || !contentType.startsWith('image/')) return response('Not found', 404);

    const image = await avatarResponse.arrayBuffer();
    if (image.byteLength > 5_000_000) return response('Avatar too large', 413);

    return new Response(image, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff'
      }
    });
  })
};
