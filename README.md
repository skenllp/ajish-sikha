# Ajish & Sikha — Wedding Invitation Website

A static site (HTML, CSS, vanilla JS and GSAP from a CDN). It needs no build step, no npm and no backend.
Its layout follows the reference site (sarah-james-wedding.vercel.app), using Ajish & Sikha's own details and artwork.

```
ajish-sikha-wedding/
├── index.html
├── css/style.css
├── js/config.js        ← every editable detail is here
├── google-apps-script.gs ← paste into your Google Sheet (RSVP → Sheet)
├── js/script.js
├── assets/             ← optimised images (WebP plus PNG/JPG fallbacks)
├── IMAGE-PROMPTS.md    ← prompts for the extra images
└── favicon.ico
```

## Page flow

1. **Hero:** the garden scene with the couple's hands gliding together, a top menu (A & S · Schedule · RSVP · Countdown), stacked names, and the date, venue and *Kindly respond* button.
2. **Curtain reveal:** a blush curtain slides up over the hero, then parts as you scroll to reveal *"Our journey begins here"*, with drifting petals.
3. **A Love in Five Frames:** a film strip that moves sideways as you scroll down.
4. **RSVP:** a handmade-paper card on sage green, with a drifting bouquet. Guests give first and last name and email, then choose *Joyfully accepts / Regretfully declines* and *Just me / Yes, +1 / With family*. After a confirmed RSVP they get a **"You're on the list!" ticket with a QR code**.
5. **Order of Celebration:** a date ring, "at a glance" tiles, the venue card with *Get directions*, and a timeline of the day.
6. **Countdown:** *"The Big Day is Almost Here"*, counting to 14 January 2027, 4:00 PM IST.
7. **Footer:** family blessings, the monogram and the menu.

---

## 1. Edit details (`js/config.js`)

While a detail is unconfirmed, leave it `""`, `null` or `[]`, and the site shows "To be confirmed" or "coming soon".

| What | Key |
|---|---|
| Church Maps link / full address | `church.mapsUrl`, `church.address` |
| Ceremony end time (calendar file) | `church.endTime` |
| Reception venue / address / Maps link | `reception.name`, `reception.address`, `reception.mapsUrl` |
| Timeline rows | `schedule` |
| Story frames (photo, year, text) | `story` |
| Replacement artwork | `images.*` (see `IMAGE-PROMPTS.md`) |
| RSVP endpoint / deadline / max guests | `rsvp.endpoint`, `rsvp.deadline`, `rsvp.maxGuests` |
| Siblings | `family.siblings` |
| Music | `music.enabled`, `music.file`. It starts on the guest's first tap, and a mute button appears. |

## 2. Turn on RSVP (Formspree)

1. Create a form at https://formspree.io and copy its endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
2. Set `rsvp.endpoint` to it. Each RSVP goes to that account's email address with name, email, attendance, guest count, message and a ticket reference.
3. The ticket and QR appear **only after Formspree confirms** it received the RSVP. They're remembered on the guest's phone, so the QR can be shown at the hall.

## 3. WhatsApp preview: do this after deploying

In `index.html`, replace every `https://YOUR-DOMAIN.com` with your real address (`og:url`, `og:image`, `og:image:secure_url`, `twitter:image`). Then check the preview with https://developers.facebook.com/tools/debug/.

## 4. Deploy on Vercel

- **Dashboard:** go to **Add New → Project**, upload this folder (or import it from GitHub), set the framework preset to **Other**, and leave the build command empty. The output directory is the root (`.`).
- **CLI:** `npm i -g vercel`, then `cd ajish-sikha-wedding`, then `vercel --prod`.

## 5. Deploy on Hostinger

hPanel → **Websites → File Manager → `public_html/`**. Upload the **contents** of this folder so that `public_html/index.html` exists, or upload the ZIP and **Extract** it. Make sure SSL is on.

---

## Notes

- **Fallbacks:** if GSAP fails to load, everything still works. The curtains rest open and the film strip becomes a swipeable row. With "reduce motion" switched on, scroll effects are turned off.
- **Hands:** the fingertip contact points are `HANDS.groomTip` / `HANDS.brideTip` at the top of `js/script.js`. They've been checked at widths from 320 px to 1920 px.
- **Calendar:** "Add to calendar" downloads an RFC 5545 `.ics` file (Asia/Kolkata timezone, CRLF line endings). On iPhone it opens the native sheet, and a Google Calendar link is also offered.
