import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function calcReadTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(3, Math.round(words / 200))} min read`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const { secret, action, slugs, updates } = body;
    if (secret !== Deno.env.get("BATCH_PUBLISH_SECRET")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { max: 1 });
    let result: unknown;

    if (action === "fix_rls") {
      await sql`DROP POLICY IF EXISTS "Anyone can read published blog posts" ON public.blog_posts;`;
      await sql`CREATE POLICY "Anyone can read published blog posts" ON public.blog_posts FOR SELECT TO anon, authenticated, public USING (published = true);`;
      const count = await sql`SELECT COUNT(*) as cnt FROM public.blog_posts WHERE published = true`;
      result = { policy_applied: true, published_count: count[0].cnt };
    } else if (action === "fix_readtime") {
      const posts = await sql`SELECT id, content FROM public.blog_posts`;
      for (const post of posts) {
        const rt = calcReadTime(post.content || "");
        await sql`UPDATE public.blog_posts SET read_time = ${rt} WHERE id = ${post.id}`;
      }
      result = { updated: posts.length };
    } else if (action === "delete_slugs") {
      for (const slug of (slugs as string[])) {
        await sql`DELETE FROM public.blog_posts WHERE slug = ${slug}`;
      }
      result = { deleted: slugs };
    } else if (action === "update_images") {
      let updated = 0;
      for (const u of (updates as { slug: string; image_url: string }[])) {
        await sql`UPDATE public.blog_posts SET image_url = ${u.image_url} WHERE slug = ${u.slug}`;
        updated++;
      }
      result = { updated };
    } else if (action === "check") {
      const total = await sql`SELECT COUNT(*) as cnt FROM public.blog_posts`;
      const pub = await sql`SELECT COUNT(*) as cnt FROM public.blog_posts WHERE published = true`;
      result = { total: total[0].cnt, published: pub[0].cnt };
    }

    await sql.end();
    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
