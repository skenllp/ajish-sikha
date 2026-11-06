/* =====================================================================
   AJISH & SIKHA — WEDDING CONFIGURATION
   ---------------------------------------------------------------------
   Every editable detail lives here. Leave a value "" / null / [] while
   it is unconfirmed — the page shows a clear "To be confirmed" or
   "coming soon" state instead of inventing information.
   ===================================================================== */

window.weddingConfig = {
  couple: {
    groom: "Ajish",          // groom's name always appears first
    bride: "Sikha",
    monogram: "A & S"
  },

  weddingDate: "2027-01-14",
  timezone: "Asia/Kolkata",
  utcOffset: "+05:30",       // India Standard Time

  hero: {
    tagline: "We are finally getting married!"
  },

  church: {
    name: "St. Joseph's Church",
    location: "Thannipuzha, Kerala",
    address: "",             // full street address — "" shows "To be confirmed"
    time: "16:00",           // 4:00 PM
    endTime: null,           // e.g. "17:30" once confirmed (used for the calendar file)
    mapsUrl: ""              // exact Google Maps link
  },

  reception: {
    name: "",                // "" shows "Venue to be confirmed"
    address: "",
    time: "18:45",           // 6:45 PM
    mapsUrl: ""
  },

  /* Order of Celebration timeline. Add rows when the programme is final. */
  schedule: [
    { time: "16:00", title: "The Ceremony", place: "St. Joseph's Church" },
    { time: "18:45", title: "Wedding Reception", place: "" } // "" → "Venue to be confirmed"
  ],

  /* "A Love in Five Frames" — film-strip story.
     photo: path to an image in assets/, e.g. "assets/story-1.jpg"
     year / text: add when ready — empty text simply shows the title. */
  story: [
    { year: "", title: "How We Met",         text: "", photo: "assets/story-1.webp" },
    { year: "", title: "First Conversation", text: "", photo: "assets/story-2.webp" },
    { year: "", title: "Our World",          text: "", photo: "assets/story-3.webp" },
    { year: "", title: "The Proposal",       text: "", photo: "assets/story-4.webp" },
    { year: "2027", title: "Forever Starts", text: "14 January 2027, St. Joseph's Church, Thannipuzha — the first day of our forever.", photo: "assets/story-5.webp" }
  ],

  /* Artwork (see IMAGE-PROMPTS.md). "" falls back to the built-in look. */
  images: {
    heroDesktop: "assets/hero-desktop.webp",        // wide screens; phones keep the portrait garden scene
    curtainBackdrop: "assets/curtain-backdrop.webp",
    curtainLeft: "assets/curtain.webp",             // transparent panel
    curtainRight: "assets/curtain.webp",            // same panel, mirrored automatically
    venue: "assets/venue-illustration.webp",
    bouquet: "assets/bouquet.webp"                  // transparent
  },

  calendar: {
    eventTitle: "Ajish & Sikha — Wedding Ceremony",
    location: "St. Joseph's Church, Thannipuzha, Kerala",
    description: "With joy in our hearts, we invite you to celebrate the wedding of Ajish & Sikha.",
    defaultDurationMinutes: 60   // used only while church.endTime is null
  },

  rsvp: {
    deadline: null,          // e.g. "2026-12-20"
    endpoint: "",            // e.g. "https://formspree.io/f/xxxxxxxx"
    maxGuests: 10,
    showTicket: true         // show the "You're on the list" QR ticket after a confirmed RSVP
  },

  family: {
    heading: "With love and blessings from our families and siblings",
    siblings: []             // e.g. ["Anu & Joseph", "Bibin"]
  },

  music: {
    enabled: true,
    file: "assets/love-story.mp3", // starts on the guest's first tap; mute button bottom-right
    volume: 0.55             // 0 – 1
  },

  siteUrl: "https://ajish-sikha.vercel.app/"
};
