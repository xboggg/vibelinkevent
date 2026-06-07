# VibeLink Event — Adding Content

## Adding a marketing page (SPA route)

1. Create `src/pages/MyPage.tsx`:

```tsx
import BaseLayout from '@/components/BaseLayout';

export default function MyPage() {
  return (
    <BaseLayout title="My Page" description="...">
      <main className="container mx-auto py-12">
        <h1 className="text-4xl font-bold">Hello</h1>
      </main>
    </BaseLayout>
  );
}
```

2. Add the route in `src/App.tsx`:

```tsx
<Route path="/my-page" element={<MyPage />} />
```

3. Optional: add `/my-page` to `prerender.js` ROUTES array so it gets
   prerendered HTML for SEO.

## Adding a portfolio entry

Portfolio data lives in `src/data/portfolio.ts` as a static array. Add
a new entry, drop the images in `public/`:

```ts
{
  id: 'new-event',
  title: 'New Event',
  category: 'wedding',
  date: '2026-08-01',
  cover: '/new-event-portfolio.jpg',
  detail: '/new-event-detail.jpg',
  description: '...'
}
```

The portfolio carousel and detail pages read from this array.

## Adding a blog post

Blog posts live in `src/data/blog.ts`:

```ts
{
  slug: 'my-post',
  title: 'My Post',
  date: '2026-06-01',
  cover: '/blog/my-post.jpg',
  excerpt: '...',
  body: `markdown content here`,
}
```

Blog images go in `public/blog/`.

The blog page (`/blog`) lists posts; each post renders at
`/blog/<slug>` via React Router.

## Adding a new event mini-site

Each event lives in `events/<event>/` at the repo root. To add a new
one:

1. Create `events/<your-event>/index.html` (or copy from an existing
   event):

```bash
cp -r events/charlestaylor events/your-event
```

2. Edit the HTML to your design.

3. If the event needs a PHP form endpoint (RSVPs, condolences, etc.),
   create `events/your-event/api/<endpoint>.php` based on
   `events/charlestaylor/api/condolences.php`. The pattern handles:
   - Honeypot rejection
   - Captcha fail-closed
   - Supabase RPC email validation
   - JSON file store with locking

4. Optional subdomain: ask Edmund to add
   `<event>.vibelinkevent.com` as a nginx vhost. The subdomain serves
   from a sibling webroot synced via rsync.

5. Push. The deploy will preserve the event folder (additive rsync —
   but won't actively deploy events/ either, since the workflow ships
   only `dist/`). To get events/<your-event>/ onto the server, copy
   manually after the first deploy:

```bash
scp -r events/your-event root@38.242.195.0:/var/www/vibelinkevent.com/events/
```

## Adding a service / pricing tier

Services and pricing live in `src/data/services.ts` and
`src/data/pricing.ts`. Edit the static arrays; the pages
(`/services`, `/pricing`) re-render automatically.

## Updating event images

Drop the new image in `public/` (or `public/blog/` for blog covers),
update the path in `src/data/portfolio.ts`, push. The deploy bundles
`public/` into `dist/` automatically.

For images that already exist with the same filename, the additive
rsync on the server will overwrite the old version.

## Editing Supabase data

For event content stored in Supabase (testimonials, leads, orders),
use the Supabase Studio at `db2.techtrendi.com/studio` (auth required)
or psql directly:

```bash
ssh root@38.242.195.0
docker exec -it supabase-db psql -U postgres -d postgres
\dt vibelink.*
```

Schema migrations are in `supabase/migrations/`. New migrations go in
that folder with a timestamp prefix.
