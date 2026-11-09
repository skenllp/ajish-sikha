/* =====================================================================
   AJISH & SIKHA — INTERACTIVE INVITATION
   Vanilla JS + GSAP/ScrollTrigger (with graceful fallbacks).
   All wedding details come from window.weddingConfig (js/config.js).
   ===================================================================== */
(function () {
  "use strict";

  var cfg = window.weddingConfig || {};
  var root = document.documentElement;
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  if (hasST) gsap.registerPlugin(ScrollTrigger);
  if (!hasST) root.classList.add("no-gsap");
  if (reduceMotion) root.classList.add("rm");

  var QR_LIB = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";

  /* Contact points in the 1600 × 624 hand images (fingertips meet here). */
  var HANDS = { width: 1600, height: 624, groomTip: { x: 1170, y: 306 }, brideTip: { x: 508, y: 245 } };

  /* ===================== Helpers ===================== */
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function getPath(obj, path) { return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj); }
  function hasValue(v) { return v !== null && v !== undefined && String(v).trim() !== ""; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function parseDate(iso) { var p = String(iso || "").split("-").map(Number); return { y: p[0], m: p[1], d: p[2] }; }
  function weekdayOf(iso) { var p = parseDate(iso); return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay(); }
  function formatDateLong(iso) { var p = parseDate(iso); return WEEKDAYS[weekdayOf(iso)] + ", " + p.d + " " + MONTHS[p.m - 1] + " " + p.y; }
  function formatDateShort(iso) { var p = parseDate(iso); return p.d + " " + MONTHS[p.m - 1] + " " + p.y; }
  function timeParts(hhmm) {
    var parts = String(hhmm || "").split(":").map(Number);
    if (parts.length < 2 || isNaN(parts[0])) return null;
    var h = parts[0], m = parts[1] || 0;
    return { h12: h % 12 === 0 ? 12 : h % 12, mm: (m < 10 ? "0" : "") + m, ampm: h >= 12 ? "PM" : "AM" };
  }
  function formatTime(hhmm) { var t = timeParts(hhmm); return t ? t.h12 + ":" + t.mm + " " + t.ampm : ""; }
  function eventTimestamp(dateIso, hhmm) { return Date.parse(dateIso + "T" + hhmm + ":00" + (cfg.utcOffset || "+05:30")); }
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  // CSS custom properties resolve url() against the stylesheet, so pass absolute URLs
  function absUrl(path) { try { return new URL(path, document.baseURI).href; } catch (e) { return path; } }
  function isSafeUrl(url) { return /^https:\/\//i.test(String(url || "").trim()); }
  function storage() { try { var s = window.localStorage; s.setItem("__t", "1"); s.removeItem("__t"); return s; } catch (e) { return null; } }
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* ===================== 1. Bind config to the page ===================== */
  function bindConfig() {
    $$("[data-config]").forEach(function (el) {
      var v = getPath(cfg, el.getAttribute("data-config"));
      if (hasValue(v)) el.textContent = v;
    });
    $$("[data-tbc]").forEach(function (el) {
      var v = getPath(cfg, el.getAttribute("data-tbc"));
      if (hasValue(v)) { el.textContent = v; el.classList.remove("is-tbc"); }
      else { el.textContent = el.getAttribute("data-tbc-label") || "To be confirmed"; el.classList.add("is-tbc"); }
    });
    if (hasValue(cfg.weddingDate)) {
      $$('[data-format="date-long"]').forEach(function (el) { el.textContent = formatDateLong(cfg.weddingDate); });
      $$('[data-format="date-short"]').forEach(function (el) { el.textContent = formatDateShort(cfg.weddingDate); });
      $$('[data-format="date-upper"]').forEach(function (el) { el.textContent = formatDateShort(cfg.weddingDate).toUpperCase(); });
    }
    $$('[data-format="time"]').forEach(function (el) { var t = formatTime(getPath(cfg, el.getAttribute("data-source"))); if (t) el.textContent = t; });
    $$('[data-format="time-short"]').forEach(function (el) { var t = timeParts(getPath(cfg, el.getAttribute("data-source"))); if (t) el.textContent = t.h12 + ":" + t.mm; });
    $$('[data-format="ampm"]').forEach(function (el) { var t = timeParts(getPath(cfg, el.getAttribute("data-source"))); if (t) el.textContent = t.ampm; });

    // Maps buttons: only active once a real https link is configured
    $$("[data-map]").forEach(function (wrap) {
      var url = getPath(cfg, wrap.getAttribute("data-map") + ".mapsUrl");
      if (!isSafeUrl(url)) return;
      var btn = wrap.querySelector("button");
      var a = document.createElement("a");
      a.className = btn ? btn.className : "btn-dark btn-dark--sm";
      a.href = url.trim(); a.target = "_blank"; a.rel = "noopener noreferrer";
      a.innerHTML = btn ? btn.innerHTML : esc(wrap.getAttribute("data-label") || "Get directions");
      if (btn) btn.replaceWith(a); else wrap.prepend(a);
      var note = wrap.querySelector(".map-note"); if (note) note.remove();
    });

    // Date card
    if (hasValue(cfg.weddingDate)) {
      var p = parseDate(cfg.weddingDate);
      $("#ring-day").textContent = p.d;
      $("#ring-month").textContent = MONTHS[p.m - 1].slice(0, 3).toUpperCase();
      $("#ring-year").textContent = p.y;
      $("#ring-weekday").textContent = WEEKDAYS[weekdayOf(cfg.weddingDate)];
    }
    var events = [cfg.church, cfg.reception].filter(function (e) { return e && hasValue(e.time); }).length;
    $("#glance-events").textContent = events;

    // Optional artwork overrides
    var img = cfg.images || {};
    if (hasValue(img.heroDesktop)) {
      var hb = $(".hero-bg");
      hb.style.setProperty("--hero-desktop", 'url("' + absUrl(img.heroDesktop) + '")');
      hb.classList.add("has-desktop");
    }
    if (hasValue(img.curtainBackdrop)) {
      var jb = $(".journey-backdrop");
      jb.style.setProperty("--journey-bg", 'url("' + absUrl(img.curtainBackdrop) + '")');
      jb.classList.add("has-custom");
    }
    [["curtainLeft", ".curtain--left .drape"], ["curtainRight", ".curtain--right .drape"]].forEach(function (pair) {
      if (!hasValue(img[pair[0]])) return;
      var d = $(pair[1]);
      d.classList.add("is-image");
      d.innerHTML = '<img src="' + esc(img[pair[0]]) + '" alt="" decoding="async" />';
    });
    if (hasValue(img.venue)) { var v = $("#venue-img"); v.src = img.venue; v.removeAttribute("width"); v.removeAttribute("height"); v.style.objectPosition = "center"; }
    if (hasValue(img.bouquet)) { $("#bouquet").src = img.bouquet; }

    // RSVP deadline line
    var rsvp = cfg.rsvp || {};
    if (hasValue(rsvp.deadline)) {
      $("#rsvp-sub").innerHTML = "Kindly respond by <strong>" + esc(formatDateShort(rsvp.deadline)) + "</strong>";
    }

    // Family / siblings
    var siblings = (cfg.family && Array.isArray(cfg.family.siblings)) ? cfg.family.siblings.filter(hasValue) : [];
    var list = $("#sibling-list");
    if (list && siblings.length) {
      list.innerHTML = siblings.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("");
      list.hidden = false;
    }
  }

  /* ===================== 2. Story frames (film strip) ===================== */
  var PLACEHOLDER_CROPS = ["14% 10%", "88% 82%", "6% 88%", "92% 18%", "50% 96%"];
  function buildStory() {
    var track = $("#story-track");
    if (!track) return;
    var story = Array.isArray(cfg.story) ? cfg.story : [];
    var html = "";
    story.forEach(function (s, i) {
      var hasPhoto = hasValue(s.photo);
      var photo = hasPhoto
        ? '<div class="frame-photo"><img src="' + esc(s.photo) + '" alt="' + esc(s.title || "") + '" loading="lazy" decoding="async" /></div>'
        : '<div class="frame-photo is-placeholder"><img src="assets/garden-background.webp" alt="" loading="lazy" decoding="async" style="object-position:' + PLACEHOLDER_CROPS[i % PLACEHOLDER_CROPS.length] + ';transform:scale(1.9);transform-origin:' + PLACEHOLDER_CROPS[i % PLACEHOLDER_CROPS.length] + '" /><span class="ph-label">Photo coming soon</span></div>';
      var text = hasValue(s.text)
        ? '<p class="frame-text">' + esc(s.text) + "</p>"
        : (hasPhoto ? "" : '<p class="frame-text is-tbc">Our story, coming soon.</p>');
      html += '<article class="frame" aria-label="' + esc(s.title || "Frame " + (i + 1)) + '">' +
        '<p class="frame-num">' + pad(i + 1) + "</p>" + photo +
        '<div class="frame-cap"><p class="frame-year">' + esc(s.year || "") + "</p>" +
        '<h3 class="frame-title">' + esc(s.title || "") + "</h3>" + text + "</div></article>";
    });
    track.insertAdjacentHTML("beforeend", html);
    if (!story.length) $("#story").hidden = true;
  }

  /* ===================== 3. Timeline ===================== */
  function buildTimeline() {
    var ol = $("#timeline");
    if (!ol) return;
    var rows = Array.isArray(cfg.schedule) ? cfg.schedule : [];
    ol.innerHTML = rows.map(function (r) {
      var place = hasValue(r.place) ? esc(r.place) : '<span class="is-tbc">Venue to be confirmed</span>';
      return '<li><p class="tl-time">' + esc(formatTime(r.time)) + '</p><p class="tl-title">' + esc(r.title) + '</p><p class="tl-place">' + place + "</p></li>";
    }).join("");
  }

  /* ===================== 4. Calendar file (.ics) & Google Calendar ===================== */
  function icsEscape(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
  function foldLine(line) {
    var out = [], cur = "", bytes = 0;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i], b = new Blob([ch]).size;
      if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ""; bytes = 0; }
      cur += ch; bytes += b;
    }
    out.push(cur);
    return out.join("\r\n ");
  }
  function utcStamp(ms) { return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  function localFromUtc(ms) {
    var off = cfg.utcOffset || "+05:30", sign = off[0] === "-" ? -1 : 1, parts = off.slice(1).split(":").map(Number);
    return new Date(ms + sign * (parts[0] * 60 + (parts[1] || 0)) * 60000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "");
  }
  function eventTimes() {
    var start = eventTimestamp(cfg.weddingDate, cfg.church.time);
    var end = hasValue(cfg.church.endTime) ? eventTimestamp(cfg.weddingDate, cfg.church.endTime)
      : start + ((cfg.calendar && cfg.calendar.defaultDurationMinutes) || 60) * 60000;
    return { start: start, end: end };
  }
  function buildICS() {
    var t = eventTimes(), cal = cfg.calendar || {}, tz = cfg.timezone || "Asia/Kolkata";
    var off = (cfg.utcOffset || "+05:30").replace(":", "");
    var lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ajish & Sikha//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VTIMEZONE", "TZID:" + tz, "BEGIN:STANDARD", "DTSTART:19700101T000000", "TZOFFSETFROM:" + off, "TZOFFSETTO:" + off, "TZNAME:IST", "END:STANDARD", "END:VTIMEZONE",
      "BEGIN:VEVENT",
      "UID:wedding-" + cfg.weddingDate.replace(/-/g, "") + "-ajish-sikha@invitation",
      "DTSTAMP:" + utcStamp(Date.now()),
      "DTSTART;TZID=" + tz + ":" + localFromUtc(t.start),
      "DTEND;TZID=" + tz + ":" + localFromUtc(t.end),
      "SUMMARY:" + icsEscape(cal.eventTitle || "Wedding Ceremony"),
      "LOCATION:" + icsEscape(cal.location || cfg.church.name),
      "DESCRIPTION:" + icsEscape(cal.description || "")
    ];
    if (isSafeUrl(cfg.church.mapsUrl)) lines.push("URL:" + cfg.church.mapsUrl.trim());
    lines.push("STATUS:CONFIRMED", "TRANSP:OPAQUE", "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsEscape(cal.eventTitle || "Wedding"), "TRIGGER:-P1D", "END:VALARM", "END:VEVENT", "END:VCALENDAR");
    return lines.map(foldLine).join("\r\n") + "\r\n";
  }
  function downloadICS() {
    var ics = buildICS();
    var ua = navigator.userAgent || "";
    var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) { window.location.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics); return; }
    try {
      var url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
      var a = document.createElement("a");
      a.href = url; a.download = "ajish-sikha-wedding.ics"; a.rel = "noopener";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
    } catch (e) { window.location.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics); }
  }
  function setupCalendarActions() {
    var btn = $("#add-to-calendar"); if (btn) btn.addEventListener("click", downloadICS);
    var g = $("#google-calendar");
    if (g) {
      var t = eventTimes(), cal = cfg.calendar || {};
      g.href = "https://calendar.google.com/calendar/render?" + [
        "action=TEMPLATE",
        "text=" + encodeURIComponent(cal.eventTitle || "Wedding"),
        "dates=" + utcStamp(t.start) + "/" + utcStamp(t.end),
        "details=" + encodeURIComponent(cal.description || ""),
        "location=" + encodeURIComponent(cal.location || cfg.church.name),
        "ctz=" + encodeURIComponent(cfg.timezone || "Asia/Kolkata")
      ].join("&");
    }
  }

  /* ===================== 5. Countdown (IST) + date ring ===================== */
  function setupCountdown() {
    var grid = $("#countdown-grid"), done = $("#countdown-done");
    if (!grid) return;
    var target = eventTimestamp(cfg.weddingDate, cfg.church.time); // 2027-01-14T16:00:00+05:30
    var els = { days: $('[data-unit="days"]', grid), hours: $('[data-unit="hours"]', grid), minutes: $('[data-unit="minutes"]', grid), seconds: $('[data-unit="seconds"]', grid) };
    var timer = null;
    function render() {
      var diff = target - Date.now();
      if (!(diff > 0)) { grid.hidden = true; if (done) done.hidden = false; clearTimeout(timer); return false; }
      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
      els.days.textContent = d < 10 ? pad(d) : String(d);
      els.hours.textContent = pad(h); els.minutes.textContent = pad(m); els.seconds.textContent = pad(sec);
      grid.setAttribute("aria-label", d + " days, " + h + " hours, " + m + " minutes until the ceremony");
      return true;
    }
    function loop() { if (render()) timer = setTimeout(loop, 1000 - (Date.now() % 1000) + 5); }
    loop();
    document.addEventListener("visibilitychange", function () { if (!document.hidden) { clearTimeout(timer); loop(); } });

    // Date ring fills toward the day (share of the final year that has passed)
    var fill = $("#ring-fill");
    if (fill) {
      var C = 2 * Math.PI * 52;
      var daysLeft = Math.max(0, (target - Date.now()) / 86400000);
      var progress = Math.min(1, Math.max(0.04, 1 - daysLeft / 365));
      var setRing = function () { fill.style.setProperty("--ring-offset", (C * (1 - progress)).toFixed(2)); };
      if ("IntersectionObserver" in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { setRing(); io.disconnect(); }
        }, { threshold: 0.4 });
        io.observe(fill.closest(".card"));
      } else setRing();
    }
  }

  /* ===================== 6. RSVP ===================== */
  function setupRSVP() {
    var form = $("#rsvp-form");
    if (!form) return;
    var rsvp = cfg.rsvp || {};
    var endpoint = String(rsvp.endpoint || "").trim();
    var enabled = isSafeUrl(endpoint);
    var maxGuests = parseInt(rsvp.maxGuests, 10) || 10;
    var store = storage();
    var KEY = "ajish-sikha-rsvp";

    var first = $("#rsvp-first"), last = $("#rsvp-last"), email = $("#rsvp-email");
    var partySet = $("#party-set"), familyBox = $("#family-count"), guests = $("#rsvp-guests");
    var submitBtn = $("#rsvp-submit"), status = $("#rsvp-status");
    var ticket = $("#rsvp-ticket");
    var submitting = false;
    guests.max = String(maxGuests);

    if (!enabled) {
      $("#rsvp-notice").hidden = false;
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-describedby", "rsvp-notice");
    }

    function val(name) { var r = form.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ""; }
    function setError(id, msg, input) {
      document.getElementById(id).textContent = msg || "";
      if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    function partySize() {
      var p = val("party");
      if (p === "family") return Number(guests.value);
      return p === "2" ? 2 : 1;
    }
    function updateParty() {
      var accepts = val("attending") === "accepts";
      partySet.hidden = !accepts;
      familyBox.hidden = !(accepts && val("party") === "family");
    }
    function validate(showAll) {
      var firstInvalid = null;
      [[first, "err-first", "Please enter your first name."], [last, "err-last", "Please enter your last name."]].forEach(function (f) {
        var ok = f[0].value.trim().length >= 1;
        if (!ok) { if (showAll || f[0].dataset.touched) setError(f[1], f[2], f[0]); firstInvalid = firstInvalid || f[0]; }
        else setError(f[1], "", f[0]);
      });
      var e = email.value.trim();
      if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) {
        if (showAll || email.dataset.touched) setError("err-email", "Please check your email address.", email);
        firstInvalid = firstInvalid || email;
      } else setError("err-email", "", email);

      var attendSet = $("#attend-set");
      if (!val("attending")) {
        if (showAll) { setError("err-attending", "Please let us know if you can attend."); attendSet.classList.add("is-invalid"); }
        firstInvalid = firstInvalid || form.querySelector('input[name="attending"]');
      } else { setError("err-attending", ""); attendSet.classList.remove("is-invalid"); }

      if (val("attending") === "accepts" && val("party") === "family") {
        var n = Number(guests.value), msg = "";
        if (!Number.isInteger(n) || guests.value.trim() === "") msg = "Please enter the number of guests.";
        else if (n < 1) msg = "Number of guests must be at least 1.";
        else if (n > maxGuests) msg = "For more than " + maxGuests + " guests, please contact the family directly.";
        if (msg) { setError("err-party", msg, guests); firstInvalid = firstInvalid || guests; }
        else setError("err-party", "", guests);
      } else setError("err-party", "", guests);
      return firstInvalid;
    }

    form.addEventListener("change", function (e) {
      if (e.target.name === "attending" || e.target.name === "party") { updateParty(); validate(false); }
    });
    [first, last, email].forEach(function (inp) {
      inp.addEventListener("blur", function () { inp.dataset.touched = "1"; validate(false); });
      inp.addEventListener("input", function () { if (inp.getAttribute("aria-invalid") === "true") validate(false); });
    });
    $$(".step", form).forEach(function (b) {
      b.addEventListener("click", function () {
        var n = Math.min(maxGuests, Math.max(1, (Number(guests.value) || 1) + Number(b.getAttribute("data-step"))));
        guests.value = n; validate(false);
      });
    });

    function setLoading(on) {
      submitting = on;
      submitBtn.disabled = on || !enabled;
      submitBtn.classList.toggle("is-loading", on);
      submitBtn.setAttribute("aria-busy", on ? "true" : "false");
      submitBtn.querySelector(".btn-label").textContent = on ? "Sending…" : "Send RSVP";
    }

    function showTicket(data, focus) {
      form.hidden = true;
      ticket.hidden = false;
      var accepts = data.attending === "accepts";
      $("#ticket-eyebrow").textContent = accepts ? "You're on the list!" : "Thank you for letting us know";
      $("#ticket-name").textContent = data.firstName + " " + data.lastName;
      $("#ticket-party").textContent = accepts ? (data.guests > 1 ? "Party of " + data.guests : "") : "";
      var card = $("#ticket-card"), hint = $("#ticket-hint");
      if (!accepts || rsvp.showTicket === false) {
        card.hidden = true;
        hint.textContent = accepts ? "We can't wait to celebrate with you." : "You will be dearly missed. Thank you for your blessings.";
      } else {
        card.hidden = false;
        hint.textContent = "Show this QR code at the hall entrance";
        renderQR(data);
      }
      if (focus) ticket.focus();
    }
    function renderQR(data) {
      var box = $("#ticket-qr");
      var text = [
        (cfg.couple.groom + " & " + cfg.couple.bride + " Wedding").toUpperCase(),
        formatDateShort(cfg.weddingDate) + " · " + cfg.church.name,
        "Guest: " + data.firstName + " " + data.lastName,
        "Party: " + data.guests,
        "Ref: " + data.ref
      ].join("\n");
      var draw = function () {
        try {
          var qr = window.qrcode(0, "M");
          qr.addData(unescape(encodeURIComponent(text)));
          qr.make();
          box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
        } catch (e) { box.closest(".ticket-card").hidden = true; }
      };
      if (window.qrcode) draw();
      else loadScript(QR_LIB).then(draw).catch(function () { box.closest(".ticket-card").hidden = true; $("#ticket-hint").textContent = "Your RSVP is confirmed."; });
    }

    // Returning guest on this device — show their saved ticket
    if (store) {
      try { var saved = JSON.parse(store.getItem(KEY) || "null"); if (saved && saved.firstName) showTicket(saved, false); } catch (e) {}
    }
    $("#rsvp-again").addEventListener("click", function () {
      if (store) try { store.removeItem(KEY); } catch (e) {}
      ticket.hidden = true; form.hidden = false; setLoading(false);
      first.focus();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submitting) return;
      status.textContent = ""; status.classList.remove("is-error");
      var invalid = validate(true);
      if (invalid) { invalid.focus(); return; }
      if (!enabled) { status.textContent = "RSVP submissions are not enabled yet. Please check back soon."; status.classList.add("is-error"); return; }

      var attending = val("attending");
      var data = {
        firstName: first.value.trim(),
        lastName: last.value.trim(),
        email: email.value.trim(),
        attending: attending,
        guests: attending === "accepts" ? partySize() : 0,
        ref: Math.random().toString(36).slice(2, 8).toUpperCase()
      };
      var payload = {
        name: data.firstName + " " + data.lastName,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        attending: attending === "accepts" ? "Joyfully accepts" : "Regretfully declines",
        guests: data.guests,
        message: $("#rsvp-message").value.trim(),
        reference: data.ref,
        _subject: "RSVP — " + data.firstName + " " + data.lastName + " (" + (attending === "accepts" ? "Accepts, " + data.guests : "Declines") + ")",
        _gotcha: $("#rsvp-company").value
      };
      if (data.email) payload._replyto = data.email;

      setLoading(true);
      var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timeout = setTimeout(function () { if (controller) controller.abort(); }, 20000);
      fetch(endpoint, {
        method: "POST",
        // text/plain keeps this a "simple" request, which Google Apps Script accepts without CORS preflight
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      }).then(function (res) {
        clearTimeout(timeout);
        if (!res.ok) {
          return res.json().catch(function () { return {}; }).then(function (d) {
            throw new Error((d && d.errors && d.errors.map(function (x) { return x.message; }).join(" ")) || "Server responded with " + res.status);
          });
        }
        return res.json().catch(function () { return {}; }).then(function (d) {
          if (d && d.result === "error") throw new Error(d.message || "Sheet rejected the RSVP");
          return d;
        });
      }).then(function () {
        // Success is shown only after the backend has confirmed
        if (store) try { store.setItem(KEY, JSON.stringify(data)); } catch (e) {}
        showTicket(data, true);
      }).catch(function (err) {
        clearTimeout(timeout);
        setLoading(false);
        status.classList.add("is-error");
        status.textContent = (err && err.name === "AbortError")
          ? "The connection timed out. Please check your network and try again."
          : "Sorry, we couldn’t send your RSVP just now. Please try again in a moment.";
        if (window.console && err) console.warn("RSVP error:", err.message || err);
      });
    });
  }

  /* ===================== 7. Optional music ===================== */
  var music = {};
  function setupMusic() {
    var m = cfg.music || {}, btn = $(".music-toggle");
    if (!btn || !m.enabled || !hasValue(m.file)) return;
    var audio = new Audio(); audio.src = m.file; audio.loop = true; audio.preload = "none";
    var target = typeof m.volume === "number" ? m.volume : 0.55;
    btn.hidden = false;
    btn.classList.add("is-inviting");
    var userMuted = false, started = false;
    var sync = function (on) {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-label", on ? "Mute background music" : "Play background music");
      if (on) btn.classList.remove("is-inviting");
    };
    var fadeIn = function () { // gentle 2-second fade so the song never starts abruptly
      audio.volume = 0;
      var t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - t0) / 2000);
        audio.volume = Math.max(0, Math.min(1, target * k));
        if (k < 1 && !audio.paused) requestAnimationFrame(step);
      })(t0);
    };
    var play = function () {
      var p = audio.play();
      if (p && p.then) {
        return p.then(function () { started = true; sync(true); fadeIn(); return true; })
          .catch(function () { sync(false); return false; });
      }
      started = true; sync(true); fadeIn();
      return Promise.resolve(true);
    };
    btn.addEventListener("click", function () {
      if (audio.paused) { userMuted = false; play(); }
      else { userMuted = true; audio.pause(); sync(false); }
    });
    // Browsers only allow sound after a real tap/click/key press (scrolling does not count),
    // so the song starts on the guest's first interaction anywhere on the page.
    var GESTURES = ["pointerup", "click", "touchend", "keydown"];
    var firstGesture = function (e) {
      if (btn.contains(e.target)) return cleanup(); // the button handles its own click
      if (started || userMuted) return cleanup();
      // keep listening if the browser refused (e.g. a touch that was really a scroll)
      play().then(function (ok) { if (ok) cleanup(); });
    };
    var cleanup = function () { GESTURES.forEach(function (t) { window.removeEventListener(t, firstGesture, true); }); };
    GESTURES.forEach(function (t) { window.addEventListener(t, firstGesture, true); });
    audio.addEventListener("error", function () { btn.hidden = true; cleanup(); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (!audio.paused) { audio.pause(); music.resume = true; } }
      else if (music.resume && !userMuted) { music.resume = false; audio.play().catch(function () {}); }
    });
  }

  /* "Scroll down" arrow → glides to the second page (curtain reveal) */
  function setupScrollDown() {
    var b = $("#scroll-down"), target = $("#journey");
    if (!b || !target) return;
    b.addEventListener("click", function (e) {
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.pageYOffset;
      try { window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" }); } catch (x) { window.scrollTo(0, y); }
    });
  }

  /* ===================== 8. Hero — joined hands ===================== */
  var hero = $("#home"), heroHands = $(".hero-hands"), groom = $(".groom-hand"), bride = $(".bride-hand"), glow = $(".touch-glow");
  var heroState = { lastWidth: 0, spread: 0 };

  function layoutHero() {
    if (!hero) return;
    var vw = hero.clientWidth || window.innerWidth;
    if (Math.abs(vw - heroState.lastWidth) > 1 || !heroState.lastWidth) {
      root.style.setProperty("--hero-h", window.innerHeight + "px"); // stable: ignores mobile toolbar resizes
      heroState.lastWidth = vw;
    }
    var vh = hero.clientHeight || window.innerHeight;
    var aspect = vw / vh;
    var W, cy;
    if (aspect >= 1) { W = Math.min(vw * 0.8, vh * 1.4, 1500); cy = vh * 0.68; }
    else { W = Math.min(vw * 1.12, vh * 0.62, 900); cy = vh * 0.59; }
    var s = W / HANDS.width, cx = vw / 2;
    groom.style.width = bride.style.width = W + "px";
    groom.style.left = (cx - HANDS.groomTip.x * s) + "px";
    groom.style.top = (cy - HANDS.groomTip.y * s) + "px";
    bride.style.left = (cx - HANDS.brideTip.x * s) + "px";
    bride.style.top = (cy - HANDS.brideTip.y * s) + "px";
    hero.style.setProperty("--contact-x", cx + "px");
    hero.style.setProperty("--contact-y", cy + "px");
    var g = Math.max(110, Math.min(240, W * 0.24));
    glow.style.width = glow.style.height = g + "px";
    glow.style.margin = (-g / 2) + "px 0 0 " + (-g / 2) + "px";
    heroState.spread = Math.round(Math.min(Math.max(vw * 0.12, 40), 180));
    heroHands.classList.add("is-laid-out");
  }

  function heroIntro() {
    if (!hasGSAP || reduceMotion) {
      if (hasGSAP) gsap.set(glow, { opacity: 0.55 });
      else glow.style.opacity = "0.55";
      return;
    }
    var tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(".hero-bg", { scale: 1.08 }, { scale: 1, duration: 3.2, ease: "power2.out" }, 0)
      .fromTo(groom, { x: -heroState.spread, y: 10, rotation: -3, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 2.2, ease: "power2.inOut" }, 0.3)
      .fromTo(bride, { x: heroState.spread, y: -10, rotation: 3, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 2.2, ease: "power2.inOut" }, 0.3)
      .fromTo(glow, { opacity: 0, scale: 0.4 }, { opacity: 0.9, scale: 1, duration: 0.6 }, 2.3)
      .to(glow, { opacity: 0.5, scale: 0.85, duration: 1.4, ease: "sine.inOut" }, 2.9)
      .fromTo(".site-nav", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 1 }, 0.4)
      .fromTo(".hero-tagline", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1 }, 0.6)
      .fromTo(".hero-names > *", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.18 }, 0.85)
      .fromTo(".hero-meta > *", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 1.8)
      .fromTo(".hero-cue", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2.6);
  }

  /* ===================== 9. Scroll storytelling ===================== */
  function storyDistance() {
    var track = $("#story-track"), vp = $(".story-viewport");
    return Math.max(0, track.scrollWidth - vp.clientWidth);
  }
  function sizeStory() {
    var story = $("#story");
    if (!story || story.hidden) return;
    if (!hasST || reduceMotion) { story.style.height = ""; return; }
    // sticky pane is var(--screen) tall (svh), so size against the same unit: no jump when the phone's toolbar hides
    story.style.height = "calc(var(--screen) + " + storyDistance() + "px)";
  }

  function setupScroll() {
    // Petals only animate while the curtain scene is on screen (saves battery)
    var journey = $("#journey");
    if (journey && "IntersectionObserver" in window && !reduceMotion) {
      new IntersectionObserver(function (entries) {
        journey.classList.toggle("is-active", entries[0].isIntersecting);
      }).observe(journey);
    }

    if (!hasST || reduceMotion) return;

    // Phones: the address bar showing/hiding fires resize events; ignore those so the page never re-lays out mid-scroll
    var touch = window.matchMedia && window.matchMedia("(hover: none)").matches;
    ScrollTrigger.config({ ignoreMobileResize: true });
    var SCRUB = touch ? 0.25 : 0.7;

    // Hero darkens and drifts as the curtain scene slides over it
    gsap.timeline({ scrollTrigger: { trigger: journey, start: "top bottom", end: "top top", scrub: SCRUB } })
      .to(".hero-shade", { "--hero-dim": 0.6, ease: "none" }, 0)
      .to(".hero-bg", { scale: 1.12, ease: "none" }, 0)
      .to(".hero-content", { y: -70, opacity: 0.25, ease: "none" }, 0)
      .to(".hero-meta, .hero-cue", { opacity: 0, ease: "none" }, 0);

    // Curtains part → "Our journey begins here"
    gsap.set(".journey-text", { opacity: 0, scale: 0.94, y: 30, force3D: true });
    gsap.set(".drape", { "--swag": "0%" });
    gsap.timeline({ scrollTrigger: { trigger: journey, start: "top top", end: "bottom bottom", scrub: SCRUB, invalidateOnRefresh: true } })
      .to({}, { duration: 0.1 })
      .to(".drape", { scaleX: function () { return window.innerWidth < 700 ? 0.15 : 0.26; }, "--swag": "70%", ease: "power1.inOut", duration: 0.62 }, 0.1)
      .to(".garland--l", { xPercent: -14, yPercent: -6, ease: "none", duration: 0.62 }, 0.1)
      .to(".garland--r", { xPercent: 14, yPercent: -6, ease: "none", duration: 0.62 }, 0.1)
      .to(".journey-backdrop", { scale: 1, ease: "none", duration: 0.9 }, 0.1)
      .to(".journey-text", { opacity: 1, scale: 1, y: 0, ease: "power2.out", duration: 0.4 }, 0.38)
      .to({}, { duration: 0.1 });

    // Film strip: vertical scroll drives the horizontal track
    var story = $("#story");
    if (story && !story.hidden) {
      gsap.to("#story-track", {
        x: function () { return -storyDistance(); },
        ease: "none",
        scrollTrigger: { trigger: story, start: "top top", end: "bottom bottom", scrub: SCRUB, invalidateOnRefresh: true }
      });
    }

    // Bouquet drifts across the paper
    var paper = $(".rsvp-paper");
    gsap.fromTo("#bouquet",
      { x: 0, y: -60, rotation: -14 },
      { x: function () { return -paper.clientWidth * 0.05; }, y: function () { return paper.clientHeight * 0.55; }, rotation: 16, ease: "none",
        scrollTrigger: { trigger: paper, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true } });

    // Gentle reveals
    $$("[data-reveal]").forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    gsap.fromTo(".rsvp-inner > *", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: ".rsvp-paper", start: "top 75%", once: true } });
    gsap.fromTo(".timeline li", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: ".timeline", start: "top 85%", once: true } });
    gsap.fromTo(".cd-unit", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: "#countdown-grid", start: "top 88%", once: true } });
  }

  /* ===================== Init ===================== */
  function init() {
    [bindConfig, buildStory, buildTimeline, setupCalendarActions, setupCountdown, setupRSVP, setupMusic, setupScrollDown].forEach(function (fn) {
      try { fn(); } catch (e) { console.warn(e); }
    });
    try { layoutHero(); heroIntro(); } catch (e) { console.warn(e); if (heroHands) heroHands.classList.add("is-laid-out"); }
    try { sizeStory(); setupScroll(); } catch (e) { console.warn(e); root.classList.add("no-gsap"); }

    var resizeTimer, lastW = window.innerWidth;
    window.addEventListener("resize", function () {
      // height-only changes (mobile toolbar) are ignored; only real width changes / rotation re-layout
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        layoutHero();
        sizeStory();
        if (hasST) ScrollTrigger.refresh();
      }, 200);
    });
    // Images in the film strip change its width once loaded
    window.addEventListener("load", function () { sizeStory(); if (hasST) ScrollTrigger.refresh(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
