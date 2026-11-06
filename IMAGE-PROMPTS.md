# Image prompts for Ajish & Sikha's website

Generate these images in any AI image tool (Midjourney, DALL·E / ChatGPT, Firefly, Ideogram, Gemini and so on). Then send them back to me, or save them in `assets/` with the exact filenames below. The site works without them, because each one replaces a built-in placeholder.

**Style for every image:** warm golden-hour light; colours of ivory, champagne, dusty rose, burgundy and soft olive green; romantic, cinematic, softly blurred background; photorealistic. **No text, no letters, no watermark.**

---

## 1. Story film strip: "A Love in Five Frames" (most important)

If you have **real photos** of Ajish & Sikha, use those. They're always better. Otherwise these prompts give tasteful, faceless images in the style of the reference site.
Size: **portrait 3:4, at least 1200 × 1600 px**. Files: `story-1.jpg` … `story-5.jpg`.

**story-1.jpg: How We Met**
> Close-up of a young Indian man's and woman's hands almost touching across a small café table, two cups of tea in white ceramic cups, a soft knitted sleeve, gentle window light, shallow depth of field, warm muted tones, candid lifestyle photography, faces not visible, portrait 3:4, no text

**story-2.jpg: First Conversation**
> A young Indian couple seen from behind, sitting on a wooden jetty by the Kerala backwaters at sunset, coconut palms silhouetted, soft orange and pink sky reflected in calm water, a small lantern beside them, cinematic, faces not visible, portrait 3:4, no text

**story-3.jpg: Our World**
> Silhouette of a young Indian couple holding hands on a hill above misty green tea plantations in Munnar, Kerala, golden sunrise behind them, rolling hills, sun flare, cinematic travel photography, faces not visible, portrait 3:4, no text

**story-4.jpg: The Proposal**
> Close-up of a man's hand holding an open ring box with a delicate gold diamond ring, a woman's hand with pink nails raised to her heart in surprise, fairy lights and candles softly blurred behind, warm romantic evening light, shallow depth of field, faces not visible, portrait 3:4, no text

**story-5.jpg: Forever Starts**
> Entrance of a white Kerala Catholic church with a classic facade and arched doorway, decorated with garlands of white and blush pink flowers, soft golden late-afternoon light, rose petals on the steps, dreamy and romantic, no people, portrait 3:4, no text

Then in `js/config.js`, set each frame's `photo` (for example `"assets/story-1.jpg"`), plus a `year` and a short `text` of one or two sentences.

---

## 2. Hero for desktop and laptop screens

Phones already use your garden scene. This is a **wide** version for computers. The hands are added by the website, so **don't include hands or people**.
Size: **landscape 16:9, at least 2400 × 1350 px**. File: `hero-desktop.jpg`.

> Wide cinematic romantic garden wedding scene at golden hour, a stone pillar on the left covered in pink bougainvillea with a glowing vintage brass lantern, a sheer ivory chiffon curtain on the right, soft hazy peach sky with distant misty hills, blush roses and baby's breath in the lower corners, candles in glass holders, rose petals scattered on a stone floor, large calm empty space in the centre, dreamy shallow depth of field, no people, no hands, landscape 16:9, no text

Config: `images.heroDesktop: "assets/hero-desktop.jpg"`

---

## 3. Curtain reveal: "Our journey begins here"

### 3a. Backdrop revealed behind the curtains
Size: **landscape 16:9, 2400 × 1350 px** (the centre must also work when cropped tall for phones). File: `curtain-backdrop.jpg`.
> A sunlit garden lawn seen through a floral wedding arch, soft god rays of light streaming through tall trees, lush green grass with dappled sunlight, blush pink roses at the edges, floating flower petals in the air, dreamy golden-hour atmosphere, wide empty centre for text, no people, landscape 16:9, no text

### 3b. Curtain panels (transparent PNGs)
Size: **portrait, 1200 × 2400 px, transparent background**. Files: `curtain-left.png`, `curtain-right.png` (the right one can be a mirrored copy of the left).
> A single tall panel of blush pink chiffon wedding curtain, soft elegant vertical pleats and folds, slightly translucent fabric with a gentle sheen, hanging straight and filling the whole frame from top to bottom, isolated on a transparent background, PNG, product photography lighting, no text

Config: `images.curtainBackdrop`, `images.curtainLeft`, `images.curtainRight`

---

## 4. Venue illustration ("Order of Celebration" card)

Size: **landscape 16:10, 1600 × 1000 px**. File: `venue-illustration.jpg`.
> Charming isometric 3D illustration of a Kerala Catholic church wedding: a white church with a classic facade and bell tower, a garden lawn beside it set for an evening reception with round tables, ivory chairs, a floral stage with blush and white flowers, string lights, a petal-lined aisle and coconut palms, soft warm evening light, clean detailed illustration style, cheerful and elegant, no text

Config: `images.venue: "assets/venue-illustration.jpg"`

---

## 5. Bouquet that drifts across the RSVP card (optional)

Size: **square, 1000 × 1000 px, transparent background**. File: `bouquet.png`.
> A small hand-tied bouquet of dried and fresh flowers: blush roses, baby's breath, pampas grass, eucalyptus and dusty pink strawflowers, tied with natural twine in a bow, soft natural shadows, isolated on a transparent background, PNG, top-down flat-lay photography, no text

Config: `images.bouquet: "assets/bouquet.png"`

---

### Tips
- Ask for "transparent background PNG" for the curtains and bouquet. If your tool can't do transparency, use remove.bg or Photoshop's "Remove background".
- Keep the files small: JPEGs at about 80% quality, 300–600 KB each. Send them to me and I'll optimise them and convert them to WebP.
- Generate 3–4 options for each and pick the one that best matches the warm golden palette of `garden-background.png`.
