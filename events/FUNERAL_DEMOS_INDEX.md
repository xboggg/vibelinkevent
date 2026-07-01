# Funeral Demo Templates — 10 Unique Designs

Ten self-contained funeral memorial templates. Each is a single `index.html` with no external dependencies beyond Google Fonts and Font Awesome. Each uses placeholder portraits (Pravatar) and gallery images (Picsum) that can be swapped for real client photos at any time.

**Status:** Local only. Not yet hosted. Open each `index.html` in a browser to preview.

---

## How to preview locally

Just double-click any `funeraldemoN/index.html` in Windows Explorer — it opens in your default browser and works fully (splash, audio toggle, all interactions). No build step. No server needed.

## How to swap in real client info per template

Each file is one HTML file. Open it, search-and-replace:
- The deceased's name (search for the surname in CAPS)
- Dates (search `1925 ·` or similar)
- Funeral programme details
- Family contact names + phone numbers
- Portrait `<img src="https://i.pravatar.cc/..."` → real photo URL
- Gallery `<img src="https://picsum.photos/seed/..."` → real photo URLs

That's it. No build, no deploy infrastructure, no rebuild.

---

## The 10 Designs

### 1. Cathedral of Stars — `funeraldemo1/`
**Subject:** Nana Kwame Boakye Ofori (1948–2026), Chief of Akrofuom, amateur astronomer
**Palette:** Deep navy, gold, ivory — cosmic
**Unique mechanic:** Constellation forms his name in the splash; 80 twinkling background stars; "arc" timeline like the night sky
**Best for:** Astronomers, philosophers, contemplative elders, chiefs

### 2. The River — `funeraldemo2/`
**Subject:** Madam Esi Mansa Dapaah (1955–2026), fisherwoman matriarch of Elmina
**Palette:** Deep teal, foam, sand, coral
**Unique mechanic:** Horizontal-scroll journey ("bends in the river") on desktop, vertical fallback on mobile; mouse wheel becomes horizontal scroll; photos appear as floating polaroids; soundtrack: water
**Best for:** Coastal lives, fisher families, "she flowed through everyone's life"

### 3. Kente Codex — `funeraldemo3/`
**Subject:** Togbe Wenya VII (1939–2026), Ewe Paramount Chief
**Palette:** Crimson, gold, emerald, ivory on deep ink — royal Ghanaian
**Unique mechanic:** Real kente stripe patterns as section dividers; each section headed by a different Adinkra-inspired symbol; bold geometric layout
**Best for:** Chiefs, royals, anyone whose Ghanaian heritage is central

### 4. Letter from a Loved One — `funeraldemo4/`
**Subject:** Pastor Daniel Owusu-Ansah (1951–2026)
**Palette:** Sepia paper, wax-seal red, handwritten brown
**Unique mechanic:** The entire site IS a letter written by the deceased to his family; typewriter font + handwriting accents; wax seal splash; tributes are "postscripts"; photos clipped to the letter like snapshots
**Best for:** Pastors, teachers, anyone who left "last words" they want their family to hear

### 5. Field of Memories — `funeraldemo5/`
**Subject:** Albert "Bobo" Mensa (1947–2025), legendary highlife saxophonist
**Palette:** Cream paper, charcoal ink, crimson accent — newspaper-grade
**Unique mechanic:** Reads as a NY-Times-style obituary feature; magazine masthead, kicker → headline → dek → byline; lead image with grayscale filter; pull quote in red serif; letters-to-the-editor for tributes
**Best for:** Artists, public figures, anyone deserving a "broadsheet" send-off

### 6. The Last Drum — `funeraldemo6/`
**Subject:** Nii Kpakpo Adjei IV (1933–2026), Ga master atumpan drummer of Osu
**Palette:** Void black, ember orange, ochre, blood red
**Unique mechanic:** Animated drum on splash literally strikes (with ripples); soundwave SVG dividers between every section; the deceased's portrait pulses with a heartbeat glow; "Three Beats" bio panel
**Best for:** Musicians, traditional cultural figures, anyone whose life had rhythm

### 7. Eternal Garden — `funeraldemo7/`
**Subject:** Mrs Akua Sika Adomako (1968–2026), botanist & beloved teacher
**Palette:** Soft sage, blush, gold on cream — watercolor warmth
**Unique mechanic:** Splash is a dewdrop with leaves floating in; tributes literally grow as flowers (different colors per tribute) in a virtual garden at the bottom; gallery photos in slightly-tilted polaroid frames
**Best for:** Teachers, gardeners, nature-lovers, mothers; tone is gentle rather than solemn

### 8. Chapter & Verse — `funeraldemo8/`
**Subject:** Prof. Comfort Anyemedu (1950–2026), librarian, novelist, professor
**Palette:** Linen paper, leather brown, gold-stamped — antiquarian book
**Unique mechanic:** Splash is a closed book on dark velvet that "opens" on tap; hero is a two-page spread with frontispiece + title page; each section is a numbered chapter with drop caps, flourishes, folio numbers; epilogue ends with "FINIS"
**Best for:** Academics, writers, librarians, anyone whose life was bookish

### 9. Tides of Time — `funeraldemo9/`
**Subject:** Capt. Joseph Quaye, Rtd. (1944–2025), Ghana Navy commander
**Palette:** Dawn sky → sand → sea — golden hour at the shore
**Unique mechanic:** Splash sun rises while name is "written in sand", then a wave washes over; ship's-log style funeral programme; gallery is scattered polaroids on a beach background; tributes are "bottles cast to sea"; tide-line dividers
**Best for:** Sailors, fishermen, military, beach families

### 10. The Family Tree — `funeraldemo10/`
**Subject:** Naa Lamiley Quarshie (1925–2026), centenarian matriarch
**Palette:** Forest green, bark brown, bloom gold, cream
**Unique mechanic:** Splash is a single seed that grows into a tree (animated branches, leaves popping); main feature is an SVG family tree with 6 named children + 32 grandchild dots + 87 great-grand blooms; visitors can "hang a leaf" with their own tribute
**Best for:** Centenarians, matriarchs/patriarchs of large families, multi-generational gatherings

---

## What's the same across all 10 (so they're all "feature-complete")

Every template includes:
- Splash screen with tap-to-enter (no auto-dismiss)
- Background music toggle (top-right) — using a Pixabay placeholder track
- Hero with name, dates, portrait, role
- Biography / life story section
- Funeral programme (vigil → viewing → service → burial → thanksgiving)
- Attire callout
- Photo gallery (placeholder Picsum images)
- Tributes/condolences section with form + sample entries
- Family contacts (3 RSVP cards with tel: links)
- Embedded Google Map for venue
- WhatsApp share floating button
- Mobile-responsive

## What's different — the design vocabulary

Each one has its own:
- Color palette (no two share)
- Typography stack (different Google Fonts pairing per template)
- Splash animation (no two share — candle, ladder, river, seal, etc.)
- Layout system (vertical scroll, horizontal scroll, magazine columns, letter format, book chapters, etc.)
- Tribute display (cards, ripples, marginalia, postscripts, hanging leaves, etc.)
- Section-divider treatment (kente stripes, soundwaves, tide-lines, page rules, etc.)

---

## Next steps

When you want to ship one for a real client:
1. Open the chosen template's `index.html`
2. Find/replace the placeholder name, dates, lineage, contacts
3. Swap portrait URL + gallery URLs for real photos
4. Update funeral programme dates/times/venues
5. Copy the folder into `vibelink/events/<clientslug>/`
6. Follow the same deploy pattern as Charles Taylor (scp + nginx + certbot)

If a client wants a hybrid (e.g. Cathedral of Stars splash + Chapter & Verse body), the templates are self-contained enough that lifting sections between them is straightforward.

---

*Generated 5 June 2026 · VibeLink Event*
