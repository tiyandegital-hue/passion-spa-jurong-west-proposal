/* Passion Spa — interactions. All forms are client-side only:
   they compose a WhatsApp message and open wa.me/6583803422. No backend, no email. */
(function () {
  "use strict";
  var WA_NUMBER = "6583803422";
  function waLink(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- mobile nav ---------- */
  var toggle = $(".nav-toggle"), nav = $(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "✕" : "☰";
    });
  }

  /* ---------- sticky WhatsApp bar slides in after first scroll ---------- */
  var bar = $(".sticky-bar");
  function onScroll() {
    if (!bar) return;
    bar.classList.toggle("show", window.scrollY > 240);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- $49 count-up on load ---------- */
  $$("[data-countup]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-countup"), 10) || 0;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { el.textContent = target; return; }
    var start = null, dur = 1100;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  /* ---------- generic single-select option groups ---------- */
  $$("[data-opt-group]").forEach(function (group) {
    $$(".opt", group).forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$(".opt", group).forEach(function (b) {
          b.classList.remove("selected");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("selected");
        btn.setAttribute("aria-pressed", "true");
        group.dispatchEvent(new CustomEvent("optchange", { bubbles: true }));
      });
    });
  });
  function selectedValue(groupName) {
    var g = document.querySelector('[data-opt-group="' + groupName + '"]');
    if (!g) return "";
    var sel = g.querySelector(".opt.selected");
    return sel ? (sel.getAttribute("data-value") || sel.textContent.trim()) : "";
  }

  /* ---------- HOME booking bar ---------- */
  var homeBtn = $("#home-book-btn");
  if (homeBtn) {
    homeBtn.addEventListener("click", function () {
      var ritual = $("#home-ritual") ? $("#home-ritual").value : "";
      var day = $("#home-day") ? $("#home-day").value : "";
      var time = $("#home-time") ? $("#home-time").value : "";
      var msg = "Hello Passion Spa! I'd like to check availability at Blk 456 Jurong West St 41, #01-748.\n" +
        "• Ritual: " + ritual + "\n• Day: " + day + "\n• Preferred time: " + time +
        "\nPlease let me know if this slot is available. Thank you!";
      window.open(waLink(msg), "_blank");
    });
  }

  /* ---------- BOOK NOW star page ---------- */
  var preview = $("#wa-preview");
  if (preview) {
    /* Preselect ritual from ?ritual=deep|relax|express|passion (card links) */
    try {
      var rq = new URLSearchParams(window.location.search).get("ritual");
      if (rq) {
        var target = document.querySelector('[data-opt-group="ritual"] .opt[data-ritual="' + rq + '"]');
        if (target) target.click();
      }
    } catch (e) { /* ignore */ }
    var nameInput = $("#book-name"), notesInput = $("#book-notes"), dateInput = $("#book-date");
    function bookMessage() {
      var ritual = selectedValue("ritual") || "Passion Hour ($49/hr)";
      var date = selectedValue("date") || "Today";
      if (dateInput && dateInput.value) {
        var d = new Date(dateInput.value + "T12:00:00");
        if (!isNaN(d)) {
          date = d.toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        }
      }
      var time = selectedValue("time") || "2:00 PM";
      var pressure = selectedValue("pressure") || "—";
      var name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "—";
      var notes = notesInput && notesInput.value.trim() ? notesInput.value.trim() : "—";
      return {
        text: "Hello Passion Spa! I'd like to book:\n" +
          "• Ritual: " + ritual + "\n• Date: " + date + "\n• Time: " + time +
          "\n• Guest: " + name + "\n• Pressure: " + pressure + "\n• Notes: " + notes +
          "\nLocation: Blk 456 Jurong West St 41, #01-748.\nPlease let me know if this slot is available!",
        ritual: ritual, date: date, time: time, name: name, pressure: pressure, notes: notes
      };
    }
    function renderPreview() {
      var m = bookMessage();
      preview.textContent = "Hello Passion Spa! I'd like to book:\n" +
        "• Ritual: " + m.ritual + "\n• Date: " + m.date + "\n• Time: " + m.time +
        "\n• Guest: " + m.name + "\n• Pressure: " + m.pressure + "\n• Notes: " + m.notes +
        "\nLocation: Blk 456 Jurong West St 41, #01-748.\nPlease let me know if this slot is available!";
      var t = $("#wa-preview-time");
      if (t) t.textContent = "Just now";
    }
    document.addEventListener("optchange", renderPreview);
    [nameInput, notesInput, dateInput].forEach(function (el) {
      if (el) el.addEventListener("input", renderPreview);
    });
    var sendBtn = $("#book-send");
    if (sendBtn) {
      sendBtn.addEventListener("click", function () {
        window.open(waLink(bookMessage().text), "_blank");
      });
    }
    renderPreview();
  }

  /* ---------- PACKAGES gift-card composer ---------- */
  var giftPreview = $("#gift-preview");
  if (giftPreview) {
    var recipient = $("#gift-recipient"), voucher = $("#gift-voucher");
    function giftMessage() {
      var denom = selectedValue("denomination") || "$100 [TO CONFIRM]";
      var format = selectedValue("format") || "Digital e-Voucher";
      var v = voucher ? voucher.value : "1x Passion Hour (60-min) [TO CONFIRM]";
      var r = recipient && recipient.value.trim() ? recipient.value.trim() : "—";
      return "Hi Passion Spa! I'd like to purchase a Gift Card for " + r +
        " — " + v + " (" + format + ", " + denom + "). How can I arrange payment and collection? Thank you!";
    }
    function renderGift() {
      var v = voucher ? voucher.value : "";
      var r = recipient && recipient.value.trim() ? recipient.value.trim() : "—";
      var denom = selectedValue("denomination") || "";
      var format = selectedValue("format") || "";
      giftPreview.textContent = "Hi Passion Spa! I'd like to purchase a Gift Card for " + r +
        " — " + v + " (" + format + ", " + denom + "). How can I arrange payment and collection? Thank you!";
      var vpTo = $("#voucher-to"), vpVal = $("#voucher-value"), vpFmt = $("#voucher-format");
      if (vpTo) vpTo.textContent = "For: " + r;
      if (vpVal) vpVal.textContent = v + (denom ? " • " + denom : "");
      if (vpFmt) vpFmt.textContent = format;
    }
    document.addEventListener("optchange", renderGift);
    [recipient, voucher].forEach(function (el) {
      if (el) el.addEventListener("input", renderGift);
    });
    var orderBtn = $("#gift-order");
    if (orderBtn) {
      orderBtn.addEventListener("click", function () {
        window.open(waLink(giftMessage()), "_blank");
      });
    }
    renderGift();
  }

  /* ---------- FAQ: filter pills + accordion ---------- */
  $$(".acc-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".acc-item");
      var panel = item.querySelector(".acc-panel");
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
    });
  });
  $$("[data-faq-filter]").forEach(function (pill) {
    pill.addEventListener("click", function () {
      $$("[data-faq-filter]").forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
      var f = pill.getAttribute("data-faq-filter");
      $$(".acc-item").forEach(function (item) {
        var cats = (item.getAttribute("data-cat") || "").split(" ");
        var show = f === "all" || cats.indexOf(f) !== -1;
        item.classList.toggle("hidden", !show);
        if (!show && item.classList.contains("open")) {
          item.classList.remove("open");
          item.querySelector(".acc-panel").style.maxHeight = "0px";
        }
      });
    });
  });

  /* ---------- FAQ inquiry composer ---------- */
  var faqPreview = $("#faq-preview");
  if (faqPreview) {
    var faqTemplate = $("#faq-template");
    function faqMessage() {
      var t = faqTemplate ? faqTemplate.value : "";
      return "Hi Passion Spa, " + t + " — Blk 456 Jurong West St 41, #01-748. Please advise. Thank you!";
    }
    function renderFaq() {
      faqPreview.textContent = faqMessage();
    }
    if (faqTemplate) faqTemplate.addEventListener("change", renderFaq);
    var faqSend = $("#faq-send");
    if (faqSend) faqSend.addEventListener("click", function () {
      window.open(waLink(faqMessage()), "_blank");
    });
    renderFaq();
  }

  /* ---------- CONTACT inquiry composer ---------- */
  var contactPreview = $("#contact-preview");
  if (contactPreview) {
    var cName = $("#contact-name"), cType = $("#contact-type"),
        cWhen = $("#contact-when"), cNotes = $("#contact-notes");
    function contactMessage() {
      var name = cName && cName.value.trim() ? cName.value.trim() : "—";
      var type = cType ? cType.value : "";
      var when = cWhen && cWhen.value.trim() ? cWhen.value.trim() : "—";
      var notes = cNotes && cNotes.value.trim() ? cNotes.value.trim() : "—";
      return "Hello Passion Spa (Blk 456 Jurong West), I'm " + name +
        " and I'm inquiring about: " + type + ".\n• Preferred date & time: " + when +
        "\n• Notes: " + notes + "\nPlease let me know. Thank you!";
    }
    function renderContact() {
      contactPreview.textContent = contactMessage();
    }
    [cName, cType, cWhen, cNotes].forEach(function (el) {
      if (el) el.addEventListener("input", renderContact);
      if (el) el.addEventListener("change", renderContact);
    });
    var cSend = $("#contact-send");
    if (cSend) cSend.addEventListener("click", function () {
      window.open(waLink(contactMessage()), "_blank");
    });
    renderContact();
  }

  /* ---------- generic WhatsApp deep links [data-wa-msg] ---------- */
  $$("[data-wa-msg]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      window.open(waLink(el.getAttribute("data-wa-msg")), "_blank");
    });
  });
})();
