import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { articles, secret } = await req.json();

    // Simple auth check
    if (secret !== Deno.env.get("BATCH_PUBLISH_SECRET")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];
    for (const article of articles) {
      const { data, error } = await supabase.from("blog_posts").upsert({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        image_url: article.image_url,
        read_time: `${article.read_time_minutes} min read`,
        featured: article.featured || false,
        published: true,
        author_name: "VibeLink Editorial",
        published_at: new Date().toISOString(),
        tags: article.tags || [],
        meta_description: article.excerpt,
      }, { onConflict: "slug", ignoreDuplicates: false });

      results.push({ slug: article.slug, error: error?.message || null });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
