(function () {
  "use strict";

  // Edit these blocks to change the shop. Everything else renders from them.
  var CONFIG = { shop: "Offer Desk", cur: "₹", deliveryFee: 49, freeAbove: 999, contact: "",
    whatsapp: "",          // shop number with country code, digits only, for example 919876543210
    logoUrl: "",           // address of your logo image; leave empty to show the M mark
    referralPercent: 5, pointsPer100: 1,
    // GitHub build only: paste your form service address, for example "https://formspree.io/f/xxxxxxxx"
    // Web3Forms also needs your key: formExtra: { access_key: "your-key" }
    formEndpoint: "", formExtra: {},
    // GitHub build only: address of your published Google Sheet (CSV) that lists the offers; leave empty to show the sample offers
    offersCsvUrl: "",
    // colour theme: "sunset", "ocean", "berry", "jungle" or "classic" (visitors can also pick from the dots in the menu)
    theme: "sunset" };
  var SAMPLE_OFFERS = [
    { id: "tee", name: "Everyday Cotton Tee, pack of 2", note: "Soft combed cotton. Mention your size in the order notes.", mrp: 799, price: 549, until: "2026-11-30" },
    { id: "bottle", name: "Steel Bottle, 750 ml", note: "Double-wall insulated bottle with a leak-proof lid.", mrp: 1199, price: 899, until: "2026-11-30" },
    { id: "earbuds", name: "Wireless Earbuds", note: "Bluetooth earbuds with a pocket charging case.", mrp: 2999, price: 1999, until: "2026-11-30" },
    { id: "organiser", name: "Desk Organiser Set", note: "Pen cup, phone stand and tray in matte metal.", mrp: 649, price: 449, until: "2026-11-26" },
    { id: "notebooks", name: "Notebook Bundle, 4 pieces", note: "A5 ruled notebooks with stitched binding.", mrp: 520, price: 399, until: "2026-11-30" },
    { id: "sleeve", name: "Laptop Sleeve, 14 inch", note: "Water-resistant shell with a soft lining.", mrp: 999, price: 699, until: "2026-12-05" }
  ];
  var PRODUCTS = [], ALL_OFFERS = [];
  var PAY = { cod: "Pay on delivery", upi: "UPI after confirmation", bank: "Bank transfer after confirmation" };
  var ORDER_STATUS = {
    "new": { label: "New", tone: "warn" },
    confirmed: { label: "Confirmed", tone: "info" },
    paid: { label: "Paid", tone: "good" },
    delivered: { label: "Delivered", tone: "good" },
    cancelled: { label: "Cancelled", tone: "bad" }
  };
  var REFUND_STATUS = {
    requested: { label: "Requested", tone: "warn" },
    approved: { label: "Approved", tone: "info" },
    refunded: { label: "Refunded", tone: "good" },
    rejected: { label: "Rejected", tone: "bad" }
  };
  var PROOF_STATUS = {
    submitted: { label: "Submitted", tone: "warn" },
    accepted: { label: "Accepted", tone: "good" },
    rejected: { label: "Rejected", tone: "bad" }
  };
  var ICONS = {
    package: "M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12",
    tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
    bag: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
    undo: "M1 4v6h6 M3.51 15a9 9 0 1 0 2.13-9.36L1 10",
    clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
    check: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
    x: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M15 9l-6 6 M9 9l6 6",
    wallet: "M21 12V7H5a2 2 0 0 1 0-4h14v4 M3 5v14a2 2 0 0 0 2 2h16v-5 M18 12a2 2 0 0 0 0 4h4v-4z",
    image: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    chat: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
    doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
    file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8",
    help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01",
    trend: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.59 13.51l6.83 3.98 M15.41 6.51l-6.82 3.98"
  };
  function svg(name, size) {
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + ICONS[name] + '"/></svg>';
  }
  document.querySelectorAll("[data-icon]").forEach(function (n) { n.innerHTML = svg(n.dataset.icon, 20); });

  var $ = function (s, r) { return (r || document).querySelector(s) || document.createElement("div"); }; // a missing element on this page becomes a harmless blank one
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function inr(n) { return CONFIG.cur + Math.round(n).toLocaleString("en-IN"); }
  function pct(p) { return Math.round((1 - p.price / p.mrp) * 100); }
  function daysLeft(p) {
    var end = new Date(p.until + "T00:00:00");
    var t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((end - t) / 864e5);
  }
  function shortDate(iso) { return new Date(iso + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
  function leftText(p) {
    var d = daysLeft(p);
    if (d < 0) return "Offer ended";
    if (d === 0) return "Last day";
    return d === 1 ? "1 day left" : d + " days left";
  }
  function when(iso) {
    var d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  }
  function makeRef(prefix) {
    var a = Date.now().toString(36).slice(-4).toUpperCase();
    var b = Math.random().toString(36).slice(2, 6).toUpperCase();
    return prefix + "-" + a + b;
  }
  function pill(meta) { return el("span", "pill " + meta.tone, meta.label); }
  var smooth = (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) ? "auto" : "smooth";

  /* ---------- who is viewing (set at boot) ---------- */
  var db = null, uid = null, canEdit = false, isOwner = false, booted = false;
  var STATIC = true; // the GitHub build sets this to true

  /* ---------- pages: one view per address ---------- */
  var VIEWS = ["orders", "payments", "offers", "proofs", "referrals", "whatsapp", "order", "refund", "terms", "qna", "rewards", "affiliate", "admin"];
  var LOGIN_VIEWS = ["orders", "payments", "referrals", "rewards"];
  var TITLES = { orders: "Orders Dashboard", payments: "Payment Dashboard", offers: "Deal & Offers", proofs: "Proofs Submit", referrals: "Referral Earnings", whatsapp: "Whatsapp Bot", order: "Order Form", refund: "Refund Form", terms: "Terms & Conditions", qna: "QnA", rewards: "Rewards", affiliate: "Affiliate Program", admin: "Admin: Offers" };
  var SUBS = {
    payments: "Amounts paid and still pending for each order.",
    offers: "Prices shown are the offer prices. Add items, then review and send your order.",
    proofs: "Share a link to a screenshot or video for an order.",
    referrals: "Share your code and see which orders used it.",
    whatsapp: "Message the shop for updates or help.",
    order: "Fill in your delivery details. Nothing is charged on this page.",
    refund: "Tell us what went wrong with an order.",
    terms: "Please read these before you order.",
    qna: "Quick answers to common questions.",
    rewards: "Points you earn on paid orders.",
    affiliate: "Earn by sharing the shop.",
    admin: "Add, change or remove offers. They show on Deals & Offers straight away."
  };
  function subFor(name) {
    if (name !== "orders") return SUBS[name];
    if (STATIC) return "Orders you placed from this device. The shop updates statuses, so they stay at New here.";
    if (canEdit) return "Every order and refund request sent through this page. " + (isOwner ? "Change a status from the menu on each row." : "Only the owner can change statuses.");
    return "Orders and refund requests you sent from this page, with their current status.";
  }
  var currentView = "offers";
  function showView(name) {
    if (VIEWS.indexOf(name) < 0) name = "offers";
    if (name === "admin" && !(canEdit && !STATIC && db)) name = "offers";
    currentView = name;
    document.querySelectorAll(".view").forEach(function (s) { s.hidden = s.dataset.view !== name; });
    document.querySelectorAll("nav a[data-view]").forEach(function (a) {
      if (a.dataset.view === name) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    $("#viewTitle").textContent = TITLES[name]; document.title = TITLES[name] + " · " + CONFIG.shop;
    $("#viewSub").textContent = subFor(name);
    renderPage(name);
    window.scrollTo(0, 0);
  }
  var PAGE = document.body.getAttribute("data-page") || "offers";
  function route() { showView(PAGE); }
  addEventListener("hashchange", route);

  /* ---------- colour theme picker ---------- */
  (function () {
    var PAL = [{"id":"sunset","g1":"#D8421A","g2":"#A8135A"},{"id":"ocean","g1":"#0757B8","g2":"#0A7C8C"},{"id":"berry","g1":"#6A22B0","g2":"#C2185B"},{"id":"jungle","g1":"#0E7A3E","g2":"#0B6E8A"},{"id":"classic","g1":"#0E5A4A","g2":"#0E5A4A"}];
    var cur = CONFIG.theme;
    try { var sv = localStorage.getItem("offerdesk-palette"); if (sv) cur = sv; } catch (_) {}
    if (!PAL.some(function (p) { return p.id === cur; })) cur = "classic";
    function apply(id) {
      document.documentElement.setAttribute("data-palette", id);
      document.querySelectorAll(".themes button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.id === id ? "true" : "false"); });
    }
    document.documentElement.setAttribute("data-palette", cur);
    var box = document.createElement("div"); box.className = "themes";
    var lab = document.createElement("span"); lab.textContent = "Theme"; box.append(lab);
    PAL.forEach(function (p) {
      var b = document.createElement("button"); b.type = "button"; b.dataset.id = p.id;
      b.setAttribute("aria-label", p.id + " theme"); b.title = p.id;
      b.style.background = "linear-gradient(135deg," + p.g1 + "," + p.g2 + ")";
      b.addEventListener("click", function () { apply(p.id); try { localStorage.setItem("offerdesk-palette", p.id); } catch (_) {} });
      box.append(b);
    });
    var side = document.querySelector(".side"); if (side) side.append(box);
    apply(cur);
  })();

  /* ---------- header, facts ---------- */
  $("#brandName").textContent = CONFIG.shop;
  if (CONFIG.logoUrl) {
    var lg = $("#logo"); lg.textContent = ""; lg.classList.add("img");
    var im = document.createElement("img"); im.src = CONFIG.logoUrl; im.alt = ""; lg.append(im);
  }
  // every menu item is shown in both builds
  function renderFacts() {
    var box = $("#facts"); box.textContent = "";
    var out = [
      "Free delivery on orders of " + inr(CONFIG.freeAbove) + " or more",
      inr(CONFIG.deliveryFee) + " delivery below that"
    ];
    var ends = PRODUCTS.map(function (p) { return p.until; }).sort();
    if (ends.length) out.push(ends[0] === ends[ends.length - 1] ? "Offers end " + shortDate(ends[0]) : "Offers end " + shortDate(ends[0]) + " to " + shortDate(ends[ends.length - 1]));
    out.forEach(function (f) { box.append(el("li", null, f)); });
  }
  if (CONFIG.contact) {
    var cl = $("#contactLine"); cl.textContent = "Questions: " + CONFIG.contact; cl.hidden = false;
  }

  /* ---------- order state ---------- */
  var qty = (function () { try { var c = JSON.parse(localStorage.getItem("offerdesk-cart")); return c && typeof c === "object" ? c : {}; } catch (_) { return {}; } })();
  PRODUCTS.forEach(function (p) { qty[p.id] = 0; });
  var cardBtn = {}, rowRef = {};

  function totals() {
    var sub = 0, mrp = 0, n = 0;
    PRODUCTS.forEach(function (p) { var q = qty[p.id]; sub += p.price * q; mrp += p.mrp * q; n += q; });
    var delivery = n === 0 ? 0 : (sub >= CONFIG.freeAbove ? 0 : CONFIG.deliveryFee);
    return { sub: sub, mrp: mrp, n: n, delivery: delivery, total: sub + delivery, save: mrp - sub };
  }

  /* ---------- offers: loaded from the shop's list ---------- */
  var grid = $("#offerGrid"), list = $("#itemList");
  var offersState = "loading"; // loading, ready, unavailable, error
  var assetsApi = null, editingId = null, previewUrl = "";

  function safeImg(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^https:\/\/[^\s"'<>]+$/i.test(u)) return u;
    if (/^\/_blob\/[0-9a-f]{32}$/.test(u)) return u;
    if (/^[\w\-][\w\-.\/]*\.(png|jpe?g|webp|gif|avif)$/i.test(u)) return u;
    return "";
  }
  function imgOf(p) { return p.img || (p.imgId ? "/_blob/" + p.imgId : ""); }
  function normDate(v) {
    v = String(v || "").trim();
    var m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/), y, mo, d;
    if (m) { y = +m[1]; mo = +m[2]; d = +m[3]; }
    else {
      m = v.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/);
      if (!m) return "";
      var a = +m[1], b = +m[2]; y = +m[3];
      if (b > 12) { mo = a; d = b; } else { d = a; mo = b; }
    }
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return "";
    return y + "-" + (mo < 10 ? "0" : "") + mo + "-" + (d < 10 ? "0" : "") + d;
  }
  function num(v) { return parseFloat(String(v == null ? "" : v).replace(/[^0-9.]/g, "")); }
  function normOffer(r, id) {
    r = r || {};
    var name = String(r.name || "").trim().slice(0, 80);
    var mrp = num(r.mrp), price = num(r.price), until = normDate(r.until);
    if (!name || !(price > 0) || !(mrp > 0) || !until) return null;
    if (mrp < price) mrp = price;
    return {
      id: String(id).slice(0, 40), name: name, note: String(r.note || "").trim().slice(0, 200),
      mrp: mrp, price: price, until: until, img: safeImg(r.img),
      imgId: /^[0-9a-f]{32}$/.test(String(r.imgId || "")) ? String(r.imgId) : "",
      createdAt: String(r.createdAt || "")
    };
  }
  function setOffers(all) {
    ALL_OFFERS = all.slice();
    PRODUCTS = ALL_OFFERS.filter(function (p) { return daysLeft(p) >= 0; });
    var keep = {};
    PRODUCTS.forEach(function (p) { keep[p.id] = Math.min(20, Math.max(0, Math.floor(+qty[p.id]) || 0)); });
    qty = keep;
    offersState = "ready";
    renderOffers();
  }
  function offersMsg() {
    if (offersState === "loading") return "Loading offers…";
    if (offersState === "unavailable") return "Offers can't be shown in this view. Sign in to Claude to see them.";
    if (offersState === "error") return "Couldn't load the offers. Please refresh the page.";
    return "No offers are live right now. Please check back soon.";
  }
  function renderOffers() {
    grid.textContent = ""; list.textContent = "";
    cardBtn = {}; rowRef = {};
    if (offersState !== "ready" || !PRODUCTS.length) {
      grid.append(el("div", "empty", offersMsg()));
      list.append(el("p", "muted", offersState === "ready" ? "Nothing to order right now." : offersMsg()));
    }
    PRODUCTS.forEach(function (p) {
      var d = daysLeft(p);
      var card = el("article", "card");
      var im = imgOf(p);
      if (im) {
        var ph = el("div", "pimg"), pic = document.createElement("img");
        pic.src = im; pic.alt = p.name; pic.loading = "lazy"; pic.referrerPolicy = "no-referrer";
        pic.addEventListener("error", function () { ph.remove(); });
        ph.append(pic); card.append(ph);
      }
      if (p.mrp > p.price) {
        var deal = el("div", "deal");
        deal.append(el("span", "pct", pct(p) + "%"), el("span", "off", "off"));
        card.append(deal);
      }
      var body = el("div", "cbody");
      body.append(el("h3", null, p.name));
      if (p.note) body.append(el("p", "muted small", p.note));
      var price = el("p", "price");
      price.append(el("strong", null, inr(p.price)));
      if (p.mrp > p.price) price.append(el("s", "mrp", inr(p.mrp)));
      var meta = el("p", "meta" + (d <= 3 ? " soon" : ""), "Ends " + shortDate(p.until) + " · " + leftText(p));
      var btn = el("button", "btn btn-primary", "Add to order");
      btn.type = "button";
      btn.addEventListener("click", function () { setQty(p.id, qty[p.id] + 1); });
      cardBtn[p.id] = btn;
      body.append(price, meta, btn);
      card.append(body);
      grid.append(card);

      var row = el("div", "item");
      var info = el("div", "iinfo");
      info.append(el("span", "iname", p.name), el("span", "muted small", inr(p.price) + " each"));
      var step = el("div", "step");
      var minus = el("button", "sbtn", "−"); minus.type = "button"; minus.setAttribute("aria-label", "Remove one " + p.name);
      var out = el("output", "sqty", "0");
      var plus = el("button", "sbtn", "+"); plus.type = "button"; plus.setAttribute("aria-label", "Add one " + p.name);
      minus.addEventListener("click", function () { setQty(p.id, qty[p.id] - 1); });
      plus.addEventListener("click", function () { setQty(p.id, qty[p.id] + 1); });
      step.append(minus, out, plus);
      row.append(info, step);
      list.append(row);
      rowRef[p.id] = { row: row, out: out, minus: minus, plus: plus, ended: false };
    });
    renderFacts();
    fillRefundSelect();
    refresh();
    renderAdminOffers();
  }

  function setQty(id, v) {
    qty[id] = Math.max(0, Math.min(20, v));
    refresh();
  }
  function refresh() {
    if (offersState === "ready") { try { localStorage.setItem("offerdesk-cart", JSON.stringify(qty)); } catch (_) {} }
    PRODUCTS.forEach(function (p) {
      var r = rowRef[p.id], q = qty[p.id];
      r.out.textContent = String(q);
      r.row.classList.toggle("has", q > 0);
      r.minus.disabled = q === 0;
      r.plus.disabled = r.ended || q >= 20;
      if (!r.ended) cardBtn[p.id].textContent = q > 0 ? "In your order (" + q + ")" : "Add to order";
    });
    renderSummary();
    renderCart();
  }
  function renderCart() {
    var t = totals(), nc = $("#navCount");
    nc.textContent = t.n ? String(t.n) : "";
    nc.hidden = !t.n;
    $("#cartBar").hidden = !t.n;
    $("#cartText").textContent = t.n + (t.n === 1 ? " item" : " items") + " · " + inr(t.sub);
  }
  function renderSummary() {
    var t = totals(), box = $("#sumBody");
    box.textContent = "";
    if (!t.n) {
      box.append(el("p", "muted", "No items yet. Add something from Deals & Offers, or use + in the item list."));
      return;
    }
    var ul = el("ul", "lines");
    PRODUCTS.forEach(function (p) {
      if (qty[p.id]) {
        var li = el("li");
        li.append(el("span", null, qty[p.id] + " × " + p.name), el("span", "num", inr(p.price * qty[p.id])));
        ul.append(li);
      }
    });
    box.append(ul);
    var dl = el("dl", "totals");
    function add(k, v, cls) { var r = el("div", cls); r.append(el("dt", null, k), el("dd", "num", v)); dl.append(r); }
    add("Subtotal", inr(t.sub));
    if (t.save > 0) add("You save", inr(t.save), "save");
    add("Delivery", t.delivery ? inr(t.delivery) : "Free");
    add("Total", inr(t.total), "grand");
    box.append(dl);
    if (t.delivery) box.append(el("p", "muted small", "Add " + inr(CONFIG.freeAbove - t.sub) + " more for free delivery."));
  }

  /* ---------- refund item select ---------- */
  function fillRefundSelect() {
    var s = $("#r-item"), keepVal = s.value;
    s.textContent = "";
    var first = el("option", null, "Choose the item"); first.value = ""; first.disabled = true; first.selected = true;
    s.append(first);
    ALL_OFFERS.forEach(function (p) { s.append(el("option", null, p.name)); });
    s.append(el("option", null, "Other"));
    if (keepVal) { for (var i = 0; i < s.options.length; i++) { if (s.options[i].value === keepVal) { s.value = keepVal; break; } } }
  }

  /* ---------- storage (db capability) ---------- */
  async function getCap(name) {
    try { return (window.claude && window.claude.use) ? await window.claude.use(name) : null; }
    catch (_) { return null; }
  }
  async function save(kind, rec, summary) {
    if (STATIC) {
      var sent = false, failure = null;
      try {
        if (!CONFIG.formEndpoint) throw { code: "no_endpoint" };
        var LABEL = { orders: "order", refunds: "refund request", proofs: "proof" };
        var contact = rec.contact || "";
        var subject = "New " + LABEL[kind] + " " + rec.ref;
        var payload = Object.assign({}, CONFIG.formExtra, {
          reference: rec.ref,
          type: LABEL[kind],
          subject: subject,
          _subject: subject,
          name: rec.name,
          email: rec.email || (contact.indexOf("@") > 0 ? contact : ""),
          phone: rec.phone || (contact && contact.indexOf("@") < 0 ? contact : ""),
          message: summary || ""
        });
        var res = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw { code: "http_" + res.status };
        sent = true;
      } catch (e) { failure = e; }
      rec.sent = sent;
      localAdd(kind, rec);
      if (!sent) throw failure;
      return;
    }
    if (!db || !uid) throw { code: "unavailable" };
    var ref = db.doc(kind + "/" + uid);
    var body = {}; body[kind] = {}; body[kind][rec.ref] = rec;
    try { await ref.update(body); } catch (_) { await ref.set(body); }
  }

  /* ---------- result card ---------- */
  function showResult(box, desk, ok, title, paras, summaryText, againLabel) {
    box.textContent = "";
    box.className = "result" + (ok ? "" : " warn");
    box.append(el("h3", null, title));
    paras.forEach(function (t) { box.append(el("p", null, t)); });
    if (CONFIG.contact && !ok) box.append(el("p", null, "Send it to: " + CONFIG.contact));
    var ta = el("textarea", "summarybox");
    ta.readOnly = true; ta.value = summaryText;
    ta.rows = Math.min(14, summaryText.split("\n").length + 1);
    ta.setAttribute("aria-label", "Details to copy");
    var actions = el("div", "actions");
    var copy = el("button", "btn", "Copy details"); copy.type = "button";
    copy.addEventListener("click", async function () {
      try { await navigator.clipboard.writeText(ta.value); copy.textContent = "Copied"; }
      catch (_) { ta.focus(); ta.select(); copy.textContent = "Selected, press Ctrl+C"; }
    });
    var again = el("button", "btn", againLabel); again.type = "button";
    again.addEventListener("click", function () { box.hidden = true; desk.hidden = false; });
    actions.append(copy, again);
    if (ok) {
      var go = el("a", "btn btn-primary", "Go to orders dashboard"); go.href = "orders.html";
      actions.append(go);
    }
    box.append(ta, actions);
    box.hidden = false; desk.hidden = true;
    box.scrollIntoView({ behavior: smooth, block: "nearest" });
  }
  function lineItems(items) { return items.map(function (i) { return i.qty + " x " + i.name + " (" + inr(i.price * i.qty) + ")"; }); }

  /* ---------- order submit ---------- */
  var orderForm = $("#orderForm");
  orderForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var err = $("#orderErr"); err.textContent = "";
    var t = totals();
    if (!t.n) { err.textContent = "Add at least one item to your order."; return; }
    var f = new FormData(orderForm);
    var rec = {
      ref: makeRef("ORD"), createdAt: new Date().toISOString(),
      name: String(f.get("name") || "").trim(), phone: String(f.get("phone") || "").trim(),
      email: String(f.get("email") || "").trim(), address: String(f.get("address") || "").trim(),
      pin: String(f.get("pin") || "").trim(), payment: String(f.get("payment") || "cod"),
      notes: String(f.get("notes") || "").trim(),
      referral: String(f.get("referral") || "").trim().toUpperCase(), by: uid || "",
      items: PRODUCTS.filter(function (p) { return qty[p.id] > 0; }).map(function (p) { return { id: p.id, name: p.name, qty: qty[p.id], price: p.price }; }),
      total: t.total, delivery: t.delivery
    };
    var summary = [
      "Order " + rec.ref,
      "Name: " + rec.name,
      "Phone: " + rec.phone + (rec.email ? "  Email: " + rec.email : ""),
      "Address: " + rec.address + ", " + rec.pin,
      "Items: " + lineItems(rec.items).join("; "),
      "Delivery: " + (rec.delivery ? inr(rec.delivery) : "Free"),
      "Total: " + inr(rec.total),
      "Payment: " + PAY[rec.payment] + (rec.referral ? "\nReferral code: " + rec.referral : "") + (rec.notes ? "\nNotes: " + rec.notes : "")
    ].join("\n");
    var btn = $("#orderSubmit"); btn.disabled = true; btn.textContent = "Sending…";
    var ok = true;
    try { await save("orders", rec, summary); } catch (_) { ok = false; }
    btn.disabled = false; btn.textContent = "Send order";
    if (ok) {
      showResult($("#orderResult"), $("#orderDesk"), true, "Order received",
        ["Your reference is " + rec.ref + ". Keep it, you will need it for any refund request." + (STATIC ? " The shop will get in touch to confirm your order." : " You can follow its status on the orders dashboard.")],
        summary, "Place another order");
      PRODUCTS.forEach(function (p) { qty[p.id] = 0; });
      orderForm.reset(); refresh();
    } else {
      showResult($("#orderResult"), $("#orderDesk"), false, "Not sent yet",
        ["This view could not send the order to the shop. Your details are below: copy them and message them to the shop with reference " + rec.ref + "."],
        summary, "Back to the form");
    }
  });

  /* ---------- refund submit ---------- */
  var refundForm = $("#refundForm");
  refundForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    $("#refundErr").textContent = "";
    var f = new FormData(refundForm);
    var rec = {
      ref: makeRef("REF"), createdAt: new Date().toISOString(),
      orderRef: String(f.get("orderRef") || "").trim().toUpperCase(),
      contact: String(f.get("contact") || "").trim(), name: String(f.get("name") || "").trim(),
      item: String(f.get("item") || ""), reason: String(f.get("reason") || ""),
      want: String(f.get("want") || ""), details: String(f.get("details") || "").trim()
    };
    var summary = [
      "Refund request " + rec.ref,
      "Order: " + rec.orderRef,
      "Name: " + rec.name + "  Contact: " + rec.contact,
      "Item: " + rec.item,
      "Reason: " + rec.reason,
      "Would like: " + rec.want,
      "Details: " + rec.details
    ].join("\n");
    var btn = $("#refundSubmit"); btn.disabled = true; btn.textContent = "Sending…";
    var ok = true;
    try { await save("refunds", rec, summary); } catch (_) { ok = false; }
    btn.disabled = false; btn.textContent = "Send refund request";
    if (ok) {
      showResult($("#refundResult"), $("#refundDesk"), true, "Request received",
        ["Your reference is " + rec.ref + ". We will look at it using order " + rec.orderRef + "."],
        summary, "Send another request");
      refundForm.reset();
    } else {
      showResult($("#refundResult"), $("#refundDesk"), false, "Not sent yet",
        ["This view could not send the request to the shop. Copy the details below and message them to the shop with reference " + rec.ref + "."],
        summary, "Back to the form");
    }
  });

  /* ---------- orders dashboard ---------- */
  var orders = [], refunds = [], statusMap = {}, dashReady = false;
  var filter = "all", qType = "ref", qText = "";
  var FILTERS = [["all", "All"], ["new", "New"], ["confirmed", "Confirmed"], ["paid", "Paid"], ["delivered", "Delivered"], ["cancelled", "Cancelled"], ["refund", "Refund requested"]];

  function orderStatus(o) { var s = statusMap[o.ref]; return ORDER_STATUS[s] ? s : "new"; }
  function refundStatus(r) { var s = statusMap[r.ref]; return REFUND_STATUS[s] ? s : "requested"; }
  function hasRefund(ref) { return refunds.some(function (r) { return r.orderRef === ref; }); }
  function setNote(t) { $("#dashNote").textContent = t || ""; }

  var fbox = $("#filters");
  FILTERS.forEach(function (f) {
    var id = "f-" + f[0];
    var lab = el("label", "fopt"); lab.setAttribute("for", id);
    var inp = document.createElement("input");
    inp.type = "radio"; inp.name = "flt"; inp.id = id; inp.value = f[0]; inp.checked = f[0] === "all";
    inp.addEventListener("change", function () { filter = f[0]; renderDash(); });
    var cnt = el("span", "muted num"); cnt.id = "fc-" + f[0];
    lab.append(inp, document.createTextNode(f[1] + " "), cnt);
    fbox.append(lab);
  });
  $("#q").addEventListener("input", function (e) { qText = e.target.value.trim().toLowerCase(); renderDash(); });
  $("#q-type").addEventListener("change", function (e) { qType = e.target.value; renderDash(); });
  $("#resetBtn").addEventListener("click", function () {
    filter = "all"; qText = ""; qType = "ref";
    $("#f-all").checked = true; $("#q").value = ""; $("#q-type").value = "ref";
    renderDash();
  });

  function matches(o) {
    var st = orderStatus(o);
    if (filter === "refund") { if (!hasRefund(o.ref)) return false; }
    else if (filter !== "all" && st !== filter) return false;
    if (qText) {
      var hay = qType === "ref" ? o.ref : qType === "name" ? o.name : o.phone;
      if (String(hay || "").toLowerCase().indexOf(qText) < 0) return false;
    }
    return true;
  }

  function renderStats() {
    var amount = 0, pending = 0, paid = 0, cancelled = 0;
    orders.forEach(function (o) {
      var s = orderStatus(o), t = o.total || 0;
      if (s === "cancelled") cancelled++; else amount += t;
      if (s === "new" || s === "confirmed") pending++;
      if (s === "paid" || s === "delivered") paid += t;
    });
    var cards = [
      ["package", "Orders", String(orders.length), "info"],
      [null, "Amount", inr(amount), "good"],
      ["clock", "Pending", String(pending), "warn"],
      [null, "Paid amount", inr(paid), "good"],
      ["x", "Cancelled", String(cancelled), "bad"],
      ["undo", "Refund requests", String(refunds.length), "warn"]
    ];
    var box = $("#stats"); box.textContent = "";
    cards.forEach(function (c) {
      var card = el("div", "stat");
      var tile = el("span", "tile " + c[3]);
      if (c[0]) tile.innerHTML = svg(c[0], 20); else tile.textContent = CONFIG.cur;
      var txt = el("div");
      txt.append(el("div", "k", c[1]), el("div", "v", c[2]));
      card.append(tile, txt);
      box.append(card);
    });
  }

  function statusSelect(map, current, onChange) {
    var s = el("select", "sel-sm"); s.setAttribute("aria-label", "Change status");
    Object.keys(map).forEach(function (k) {
      var o = el("option", null, map[k].label); o.value = k;
      if (k === current) o.selected = true;
      s.append(o);
    });
    s.addEventListener("change", function () { onChange(s); });
    return s;
  }
  async function setStatus(ref, val, kind, sel, prev) {
    sel.disabled = true;
    try {
      await db.doc("status/" + ref).set({ status: val, kind: kind, at: new Date().toISOString() });
      setNote("");
    } catch (_) {
      sel.value = prev;
      setNote("Couldn't save that status. Try again.");
    }
    sel.disabled = false;
  }
  function startRefund(o) {
    $("#r-order").value = o.ref;
    $("#r-name").value = o.name || "";
    $("#r-contact").value = o.phone || o.email || "";
    $("#refundResult").hidden = true; $("#refundDesk").hidden = false;
    // the refund form is on its own page: hand the details over and open it
    try { sessionStorage.setItem("offerdesk-refund", JSON.stringify({ ref: o.ref, name: o.name || "", contact: o.phone || o.email || "" })); } catch (_) {}
    location.href = "refund.html";
  }
  (function () {
    var raw = null;
    try { raw = sessionStorage.getItem("offerdesk-refund"); sessionStorage.removeItem("offerdesk-refund"); } catch (_) {}
    if (!raw || !document.getElementById("r-order")) return;
    try {
      var d = JSON.parse(raw);
      $("#r-order").value = String(d.ref || ""); $("#r-name").value = String(d.name || ""); $("#r-contact").value = String(d.contact || "");
    } catch (_) {}
  })();

  function orderRow(o) {
    var st = orderStatus(o);
    var row = el("article", "row");
    var top = el("div", "otop");
    var id = el("div", "oid");
    id.append(el("strong", "ref", o.ref), el("span", "muted small", when(o.createdAt)));
    var tags = el("div", "oid");
    if (hasRefund(o.ref)) tags.append(el("span", "pill info", "Refund requested"));
    if (STATIC && o.sent === false) tags.append(el("span", "pill warn", "Not sent"));
    tags.append(pill(ORDER_STATUS[st]));
    top.append(id, tags);
    row.append(top);
    if (canEdit) {
      row.append(el("p", null, [o.name, o.phone, o.email].filter(Boolean).join(" · ")));
      row.append(el("p", "muted small", [o.address, o.pin].filter(Boolean).join(", ")));
    }
    var items = (o.items || []).map(function (i) { return i.qty + " × " + i.name; }).join(", ");
    row.append(el("p", null, items));
    var extra = "Payment: " + (PAY[o.payment] || o.payment || "") + (o.notes ? " · Note: " + o.notes : "");
    row.append(el("p", "small muted", extra));
    var bot = el("div", "obot");
    bot.append(el("span", "amt", inr(o.total || 0)));
    if (isOwner && db) {
      bot.append(statusSelect(ORDER_STATUS, st, function (sel) { setStatus(o.ref, sel.value, "order", sel, st); }));
    } else if (!canEdit && st !== "cancelled" && !hasRefund(o.ref)) {
      var rb = el("button", "btn btn-sm", "Request refund"); rb.type = "button";
      rb.addEventListener("click", function () { startRefund(o); });
      bot.append(rb);
    }
    row.append(bot);
    return row;
  }
  function refundRow(r) {
    var st = refundStatus(r);
    var row = el("article", "row");
    var top = el("div", "otop");
    var id = el("div", "oid");
    id.append(el("strong", "ref", r.ref), el("span", "muted small", when(r.createdAt)));
    top.append(id, pill(REFUND_STATUS[st]));
    row.append(top);
    row.append(el("p", null, "Order " + (r.orderRef || "") + " · " + (r.item || "")));
    if (canEdit) row.append(el("p", null, [r.name, r.contact].filter(Boolean).join(" · ")));
    row.append(el("p", "small", (r.reason || "") + " · wants " + String(r.want || "").toLowerCase()));
    row.append(el("p", "small muted", r.details || ""));
    if (isOwner && db) {
      var bot = el("div", "obot");
      bot.append(el("span"));
      bot.append(statusSelect(REFUND_STATUS, st, function (sel) { setStatus(r.ref, sel.value, "refund", sel, st); }));
      row.append(bot);
    }
    return row;
  }
  function emptyNote(text) { return el("div", "empty", text); }

  function renderDash() {
    renderStats();
    renderPayments(); renderRewards(); renderReferrals(); renderProofList();
    var ol = $("#orderList"), rl = $("#refundList");
    ol.textContent = ""; rl.textContent = "";
    FILTERS.forEach(function (f) {
      var n = orders.filter(function (o) {
        if (f[0] === "all") return true;
        if (f[0] === "refund") return hasRefund(o.ref);
        return orderStatus(o) === f[0];
      }).length;
      var c = $("#fc-" + f[0]); if (c) c.textContent = "(" + n + ")";
    });
    var shown = orders.filter(matches);
    $("#orderCount").textContent = orders.length ? "(" + (shown.length === orders.length ? orders.length : shown.length + " of " + orders.length) + ")" : "";
    $("#refundCount").textContent = refunds.length ? "(" + refunds.length + ")" : "";
    if (!booted) {
      ol.append(emptyNote("Loading orders…")); rl.append(emptyNote("Loading…"));
      return;
    }
    if (!STATIC && !(db && uid)) {
      ol.append(emptyNote("Your orders show here when you open this page signed in. Orders sent from this view are not saved, so keep the summary you copy."));
      rl.append(emptyNote("No refund requests to show."));
      return;
    }
    if (!orders.length) ol.append(emptyNote(dashReady ? "No orders yet. Pick something from Deals & Offers." : "Loading orders…"));
    else if (!shown.length) ol.append(emptyNote("No orders match these filters."));
    shown.forEach(function (o) { ol.append(orderRow(o)); });
    if (!refunds.length) rl.append(emptyNote(dashReady ? "No refund requests yet." : "Loading…"));
    refunds.forEach(function (r) { rl.append(refundRow(r)); });
  }
  function flatten(snap, key) {
    var out = [];
    snap.docs.forEach(function (d) {
      var data = d.data() || {}, m = data[key] || {};
      Object.keys(m).forEach(function (k) { out.push(m[k]); });
    });
    return out.sort(function (a, b) { return String(b.createdAt || "").localeCompare(String(a.createdAt || "")); });
  }
  function watchDash() {
    var timer = setTimeout(function () { if (!dashReady) setNote("Can't reach the store yet. Showing what has loaded so far."); }, 10000);
    function seen(s) { if (!s.metadata.fromCache) { dashReady = true; clearTimeout(timer); if (!$("#dashNote").dataset.sticky) setNote(""); } }
    function fail() { clearTimeout(timer); setNote("Couldn't load orders in this view."); }
    db.collection("orders").onSnapshot(function (s) { orders = flatten(s, "orders"); seen(s); renderDash(); }, fail);
    db.collection("refunds").onSnapshot(function (s) { refunds = flatten(s, "refunds"); seen(s); renderDash(); }, fail);
    db.collection("proofs").onSnapshot(function (s) { proofs = flatten(s, "proofs"); seen(s); renderDash(); }, fail);
    db.collection("status").onSnapshot(function (s) {
      var m = {};
      s.docs.forEach(function (d) { var v = d.data() || {}; m[d.id] = v.status; });
      statusMap = m; renderDash();
    }, fail);
  }

  /* ---------- extra pages ---------- */
  var proofs = [];
  var PROOF_URL = /^https?:\/\//i;
  var TERMS = [
    ["Orders", "An order is confirmed only after the shop contacts you. The shop may cancel an order if an item is unavailable."],
    ["Prices and offers", "Offer prices apply until the end date shown on each offer. The total shown in your order summary is the price for that order."],
    ["Payment", "Nothing is charged on this website. You pay on delivery, or by UPI or bank transfer after the shop confirms your order."],
    ["Delivery", "The delivery fee and the free delivery limit are shown in your order summary."],
    ["Refunds and replacements", "Use the Refund Form with your order reference. Each request is reviewed individually."],
    ["Your details", "Your name, phone and address are used only to process your order and any refund request."]
  ];
  function drawStats(box, cards) {
    box.textContent = "";
    cards.forEach(function (c) {
      var card = el("div", "stat");
      var tile = el("span", "tile " + c[3]);
      if (c[0] && c[0].indexOf("text:") === 0) tile.textContent = c[0].slice(5);
      else if (c[0]) tile.innerHTML = svg(c[0], 20);
      else tile.textContent = CONFIG.cur;
      var txt = el("div");
      txt.append(el("div", "k", c[1]), el("div", "v", c[2]));
      card.append(tile, txt);
      box.append(card);
    });
  }
  function gateMsg(box) {
    box.textContent = "";
    if (!booted) { box.append(emptyNote("Loading…")); return true; }
    if (!STATIC && !(db && uid)) { box.append(emptyNote("This page shows your own data when you open it signed in. It stays empty in this view.")); return true; }
    return false;
  }
  function payState(o) {
    var s = orderStatus(o);
    if (s === "cancelled") return { label: "Cancelled", tone: "bad", paid: false, cancelled: true };
    if (s === "paid" || s === "delivered") return { label: "Paid", tone: "good", paid: true, cancelled: false };
    return { label: "Pending", tone: "warn", paid: false, cancelled: false };
  }

  function renderPayments() {
    var stats = $("#payStats"), box = $("#payList");
    var total = 0, paid = 0, pending = 0, cod = 0;
    orders.forEach(function (o) {
      var p = payState(o), t = o.total || 0;
      if (p.cancelled) return;
      total += t;
      if (p.paid) paid += t; else { pending += t; if (o.payment === "cod") cod += t; }
    });
    drawStats(stats, [
      [null, "Total amount", inr(total), "info"],
      ["check", "Paid", inr(paid), "good"],
      ["clock", "Awaiting payment", inr(pending), "warn"],
      ["bag", "Pay on delivery", inr(cod), "info"]
    ]);
    $("#payCount").textContent = orders.length ? "(" + orders.length + ")" : "";
    if (gateMsg(box)) return;
    if (!orders.length) { box.append(emptyNote(dashReady ? "No orders yet, so no payments to show." : "Loading…")); return; }
    orders.forEach(function (o) {
      var p = payState(o);
      var row = el("article", "row");
      var top = el("div", "otop"), id = el("div", "oid");
      id.append(el("strong", "ref", o.ref), el("span", "muted small", when(o.createdAt)));
      top.append(id, pill(p));
      row.append(top, el("p", "small muted", "Method: " + (PAY[o.payment] || o.payment || "")));
      var bot = el("div", "obot");
      bot.append(el("span", "amt", inr(o.total || 0)));
      if (isOwner && db && !p.paid && !p.cancelled) {
        var b = el("button", "btn btn-sm", "Mark paid"); b.type = "button";
        b.addEventListener("click", function () { setStatus(o.ref, "paid", "order", b, ""); });
        bot.append(b);
      }
      row.append(bot);
      box.append(row);
    });
  }

  function renderRewards() {
    var mine = canEdit ? orders.filter(function (o) { return uid && o.by === uid; }) : orders;
    var paidTotal = 0, paidCount = 0;
    mine.forEach(function (o) { var p = payState(o); if (p.paid) { paidTotal += o.total || 0; paidCount++; } });
    var points = Math.floor(paidTotal / 100 * CONFIG.pointsPer100);
    drawStats($("#rewardStats"), [
      ["text:P", "Points earned", String(points), "good"],
      ["check", "Paid orders", String(paidCount), "info"],
      [null, "Paid amount", inr(paidTotal), "info"]
    ]);
    $("#rewardRule").textContent = "You earn " + CONFIG.pointsPer100 + (CONFIG.pointsPer100 === 1 ? " point" : " points") + " for every " + inr(100) + " of paid orders. This is a sample rule for learning. The shop decides how points can be used.";
    $("#rewardNote").textContent = (booted && !STATIC && !(db && uid)) ? "Open this page signed in to see your points." : (canEdit ? "Shows points for orders you placed yourself." : "");
  }

  function myCode() {
    if (!uid) return "";
    var h = 0;
    for (var i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) >>> 0;
    return "R" + h.toString(36).toUpperCase().padStart(7, "0").slice(-7);
  }
  $("#refCopy").addEventListener("click", async function () {
    var b = this;
    try { await navigator.clipboard.writeText(myCode()); b.textContent = "Copied"; }
    catch (_) { b.textContent = "Select the code and copy it"; }
  });
  function renderReferrals() {
    var code = myCode();
    $("#refCode").textContent = code || "Open this page signed in to get your code";
    $("#refCopy").hidden = !code;
    $("#refRule").textContent = "When someone enters your code on the Order Form and that order is paid, the shop records " + CONFIG.referralPercent + "% of the paid amount as your earnings. This is a sample rate for learning. The shop sets the real rate and records any payout.";
    var admin = $("#refAdmin"), rows = $("#refRows");
    admin.hidden = !canEdit;
    rows.textContent = "";
    if (!canEdit) return;
    var map = {};
    orders.forEach(function (o) {
      if (!o.referral) return;
      var m = map[o.referral] || (map[o.referral] = { orders: 0, paid: 0 });
      m.orders++;
      if (payState(o).paid) m.paid += o.total || 0;
    });
    var codes = Object.keys(map).sort(function (a, b) { return map[b].orders - map[a].orders; });
    if (!codes.length) { rows.append(emptyNote("No order has used a referral code yet.")); return; }
    codes.forEach(function (c) {
      var m = map[c], row = el("article", "row");
      var top = el("div", "otop");
      top.append(el("strong", "ref", c), el("span", "muted small", m.orders + (m.orders === 1 ? " order" : " orders")));
      var bot = el("div", "obot");
      bot.append(el("span", "small muted", "Paid amount " + inr(m.paid)), el("span", "amt", inr(m.paid * CONFIG.referralPercent / 100)));
      row.append(top, bot);
      rows.append(row);
    });
  }

  /* proofs */
  $("#proofForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    $("#proofErr").textContent = "";
    var f = new FormData(e.target);
    var link = String(f.get("link") || "").trim();
    if (!PROOF_URL.test(link)) { $("#proofErr").textContent = "Paste a link that starts with http:// or https://"; return; }
    var rec = {
      ref: makeRef("PRF"), createdAt: new Date().toISOString(),
      orderRef: String(f.get("orderRef") || "").trim().toUpperCase(),
      name: String(f.get("name") || "").trim(), contact: String(f.get("contact") || "").trim(),
      type: String(f.get("type") || ""), link: link, notes: String(f.get("notes") || "").trim(), by: uid || ""
    };
    var summary = [
      "Proof " + rec.ref,
      "Order: " + rec.orderRef,
      "Name: " + rec.name + "  Contact: " + rec.contact,
      "Type: " + rec.type,
      "Link: " + rec.link,
      rec.notes ? "Notes: " + rec.notes : ""
    ].filter(Boolean).join("\n");
    var btn = $("#proofSubmit"); btn.disabled = true; btn.textContent = "Sending…";
    var ok = true;
    try { await save("proofs", rec, summary); } catch (_) { ok = false; }
    btn.disabled = false; btn.textContent = "Submit proof";
    if (ok) {
      showResult($("#proofResult"), $("#proofDesk"), true, "Proof received",
        ["Your reference is " + rec.ref + " for order " + rec.orderRef + "."], summary, "Submit another proof");
      e.target.reset();
    } else {
      showResult($("#proofResult"), $("#proofDesk"), false, "Not sent yet",
        ["This view could not send the proof to the shop. Copy the details below and message them to the shop with reference " + rec.ref + "."], summary, "Back to the form");
    }
  });
  function renderProofList() {
    var wrap = $("#proofListWrap");
    wrap.hidden = false;
    var box = $("#proofList");
    $("#proofCount").textContent = proofs.length ? "(" + proofs.length + ")" : "";
    if (gateMsg(box)) return;
    if (!proofs.length) { box.append(emptyNote(dashReady ? "No proofs submitted yet." : "Loading…")); return; }
    proofs.forEach(function (p) {
      var st = PROOF_STATUS[statusMap[p.ref]] ? statusMap[p.ref] : "submitted";
      var row = el("article", "row");
      var top = el("div", "otop"), id = el("div", "oid");
      id.append(el("strong", "ref", p.ref), el("span", "muted small", when(p.createdAt)));
      top.append(id, pill(PROOF_STATUS[st]));
      row.append(top, el("p", null, "Order " + (p.orderRef || "") + " · " + (p.type || "")));
      if (canEdit) row.append(el("p", null, [p.name, p.contact].filter(Boolean).join(" · ")));
      if (PROOF_URL.test(p.link || "")) {
        var a = el("a", null, p.link); a.href = p.link; a.target = "_blank"; a.rel = "noopener noreferrer";
        row.append(a);
      }
      if (p.notes) row.append(el("p", "small muted", p.notes));
      if (isOwner && db) {
        var bot = el("div", "obot");
        bot.append(el("span"));
        bot.append(statusSelect(PROOF_STATUS, st, function (sel) { setStatus(p.ref, sel.value, "proof", sel, st); }));
        row.append(bot);
      }
      box.append(row);
    });
  }

  /* whatsapp */
  function waLink() {
    var num = String(CONFIG.whatsapp || "").replace(/\D/g, "");
    var ref = $("#wa-order").value.trim();
    var msg = "Hello, I need help" + (ref ? " with order " + ref : "") + ".";
    return num ? "https://wa.me/" + num + "?text=" + encodeURIComponent(msg) : "";
  }
  function updateWa() {
    var a = $("#waLink"), link = waLink();
    a.hidden = !link;
    if (link) a.href = link;
    $("#waText").textContent = link
      ? "Open a WhatsApp chat with the shop. Add your order reference to include it in the message. Automatic bot replies are not set up, the shop answers by hand."
      : "The shop has not added a WhatsApp number yet.";
  }
  $("#wa-order").addEventListener("input", updateWa);

  /* terms, QnA, affiliate */
  function renderTerms() {
    var box = $("#termsBody");
    if (box.dataset.done) return;
    box.dataset.done = "1";
    TERMS.forEach(function (t) {
      var d = el("div");
      d.append(el("h3", null, t[0]), el("p", null, t[1]));
      box.append(d);
    });
  }
  function renderFaq() {
    var box = $("#faqList");
    if (box.dataset.done) return;
    box.dataset.done = "1";
    var items = [
      ["How do I place an order?", "Add items from Deal & Offers, then fill in the Order Form and send it."],
      ["Do I pay on this website?", "No. Nothing is charged here. You pay on delivery, or by UPI or bank transfer after the shop confirms your order."],
      ["How do I ask for a refund?", "Use the Refund Form and enter the order reference you received when you ordered."],
      ["What can I send as proof?", "Use Proofs Submit to share a link to a screenshot or video, together with your order reference."],
      ["I lost my order reference. What now?", "Look for the summary you copied or the confirmation shown after ordering. If you cannot find it, message the shop."]
    ];
    items.splice(2, 0, ["How do I follow my order?", STATIC ? "Open Orders Dashboard to see the orders placed from this device. The shop updates statuses, so they stay at New on this site." : "Open Orders Dashboard while signed in to see its current status."]);
    items.forEach(function (q) {
      var d = el("details");
      d.append(el("summary", null, q[0]), el("p", null, q[1]));
      box.append(d);
    });
  }
  function renderPage(name) {
    if (name === "terms") renderTerms();
    else if (name === "qna") renderFaq();
    else if (name === "whatsapp") updateWa();
    else if (name === "affiliate") $("#affCode").hidden = false;
  }

  /* ---------- GitHub build: keep a copy of what this device sent ---------- */
  var LS_KEY = "offerdesk-v1";
  function lsRead() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (_) { return {}; }
  }
  function lsWrite(d) { try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch (_) {} }
  function localId() {
    var d = lsRead();
    if (!d.id) { d.id = "local" + Math.random().toString(36).slice(2, 12); lsWrite(d); }
    return d.id;
  }
  function byNewest(a, b) { return String(b.createdAt || "").localeCompare(String(a.createdAt || "")); }
  function localAdd(kind, rec) {
    var d = lsRead();
    d[kind] = d[kind] || [];
    d[kind].push(rec);
    lsWrite(d);
    loadLocal();
  }
  function loadLocal() {
    var d = lsRead();
    uid = localId();
    orders = (d.orders || []).slice().sort(byNewest);
    refunds = (d.refunds || []).slice().sort(byNewest);
    proofs = (d.proofs || []).slice().sort(byNewest);
    dashReady = true;
    renderDash();
  }

  /* ---------- admin: add and manage offers (Claude-hosted build) ---------- */
  var offerForm = $("#offerForm"), offerMsg = $("#offerMsg");
  function setOfferMsg(t, bad) { offerMsg.textContent = t || ""; offerMsg.className = "formmsg" + (bad ? " err" : ""); }
  function clearPreview() {
    if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (_) {} previewUrl = ""; }
    var pv = $("#f-prev"); pv.textContent = ""; pv.hidden = true;
  }
  function showPreview(src) {
    var pv = $("#f-prev"); pv.textContent = "";
    if (!src) { pv.hidden = true; return; }
    var i = document.createElement("img"); i.src = src; i.alt = "Photo preview";
    pv.append(i); pv.hidden = false;
  }
  function resetOfferForm() {
    offerForm.reset(); editingId = null; clearPreview(); setOfferMsg("");
    $("#offerLegend").textContent = "New offer";
    $("#offerSave").textContent = "Add offer";
    $("#offerCancel").hidden = true;
    delete offerForm.dataset.imgId;
  }
  $("#offerCancel").addEventListener("click", resetOfferForm);
  $("#f-file").addEventListener("change", function () {
    clearPreview();
    var f = this.files && this.files[0];
    if (f && /^image\//.test(f.type)) { previewUrl = URL.createObjectURL(f); showPreview(previewUrl); }
  });
  function editOffer(p) {
    editingId = p.id;
    $("#f-name").value = p.name; $("#f-note").value = p.note;
    $("#f-mrp").value = p.mrp; $("#f-price").value = p.price; $("#f-until").value = p.until;
    $("#f-file").value = "";
    clearPreview();
    offerForm.dataset.imgId = p.imgId || "";
    showPreview(imgOf(p));
    $("#offerLegend").textContent = "Change offer";
    $("#offerSave").textContent = "Save changes";
    $("#offerCancel").hidden = false;
    setOfferMsg("");
    offerForm.scrollIntoView({ behavior: smooth, block: "start" });
  }
  offerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!db || !canEdit || STATIC) return;
    var name = $("#f-name").value.trim();
    var mrp = num($("#f-mrp").value), price = num($("#f-price").value), until = $("#f-until").value;
    if (!name) return setOfferMsg("Enter the product name.", true);
    if (!(price > 0) || !(mrp > 0)) return setOfferMsg("Enter both prices.", true);
    if (mrp < price) return setOfferMsg("The original price must be the same as or higher than the deal price.", true);
    if (!normDate(until) || daysLeft({ until: until }) < 0) return setOfferMsg("Pick an end date that is today or later.", true);
    var file = $("#f-file").files && $("#f-file").files[0];
    if (file && (!/^image\//.test(file.type) || file.size > 5 * 1024 * 1024)) return setOfferMsg("Choose an image smaller than 5 MB.", true);
    var btn = $("#offerSave"); btn.disabled = true; setOfferMsg("Saving…");
    try {
      var imgId = offerForm.dataset.imgId || "";
      if (file) {
        if (!assetsApi) throw { code: "no_assets" };
        var up = await assetsApi.upload(file);
        imgId = up.id;
      }
      var id = editingId || "o" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      var old = ALL_OFFERS.filter(function (p) { return p.id === id; })[0];
      var rec = { name: name, note: $("#f-note").value.trim().slice(0, 200), mrp: mrp, price: price, until: until, createdAt: (old && old.createdAt) || new Date().toISOString() };
      if (imgId) rec.imgId = imgId;
      await db.doc("offers/" + id).set(rec);
      resetOfferForm();
      setOfferMsg("Saved. It is live on Deals & Offers.");
    } catch (err) {
      setOfferMsg(err && err.code === "no_assets" ? "Photo upload isn't available for your account. Save without a photo." : "Couldn't save. Check that you're signed in as an editor and try again.", true);
    } finally { btn.disabled = false; }
  });
  function renderAdminOffers() {
    var box = $("#adminList");
    if (!box) return;
    box.textContent = "";
    if (!ALL_OFFERS.length) {
      box.append(el("p", "muted", offersState === "ready" ? "No offers yet. Use the form above, or start with the sample offers." : offersMsg()));
      if (offersState === "ready" && db && canEdit && !STATIC) {
        var seed = el("button", "btn", "Add the sample offers"); seed.type = "button";
        seed.addEventListener("click", async function () {
          seed.disabled = true;
          try {
            for (var i = 0; i < SAMPLE_OFFERS.length; i++) {
              var p = SAMPLE_OFFERS[i];
              await db.doc("offers/" + p.id).set({ name: p.name, note: p.note, mrp: p.mrp, price: p.price, until: p.until, createdAt: new Date(Date.now() - i * 1000).toISOString() });
            }
          } catch (_) { setOfferMsg("Couldn't add the samples.", true); seed.disabled = false; }
        });
        box.append(seed);
      }
      return;
    }
    ALL_OFFERS.forEach(function (p) {
      var d = daysLeft(p);
      var row = el("div", "orow");
      var im = imgOf(p);
      if (im) { var t = document.createElement("img"); t.className = "thumb"; t.src = im; t.alt = ""; t.addEventListener("error", function () { t.remove(); }); row.append(t); }
      var info = el("div", "oinfo");
      info.append(el("strong", null, p.name), el("span", "muted small", inr(p.price) + " (was " + inr(p.mrp) + ") · ends " + shortDate(p.until)));
      var st = d < 0 ? { label: "Ended", tone: "bad" } : (d <= 3 ? { label: "Ends soon", tone: "warn" } : { label: "Live", tone: "good" });
      var edit = el("button", "btn btn-sm", "Change"); edit.type = "button";
      edit.addEventListener("click", function () { editOffer(p); });
      var del = el("button", "btn btn-sm", "Delete"); del.type = "button";
      var armed = false;
      del.addEventListener("click", async function () {
        if (!armed) { armed = true; del.textContent = "Sure? Delete"; setTimeout(function () { armed = false; del.textContent = "Delete"; }, 4000); return; }
        del.disabled = true;
        try { await db.doc("offers/" + p.id).delete(); } catch (_) { setOfferMsg("Couldn't delete that offer.", true); del.disabled = false; }
      });
      row.append(info, pill(st), edit, del);
      box.append(row);
    });
  }
  function watchOffers() {
    var timer = setTimeout(function () { if (offersState === "loading") { offersState = "error"; renderOffers(); } }, 10000);
    db.collection("offers").onSnapshot(function (snap) {
      clearTimeout(timer);
      var arr = [];
      snap.docs.forEach(function (d) { var o = normOffer(d.data(), d.id); if (o) arr.push(o); });
      arr.sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
      setOffers(arr);
    }, function () { clearTimeout(timer); offersState = "error"; renderOffers(); });
  }

  /* ---------- GitHub build: offers from a published Google Sheet (CSV) ---------- */
  function parseCsv(t) {
    var rows = [], row = [], f = "", q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) {
        if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; }
        else f += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(f); f = ""; rows.push(row); row = []; }
      else f += c;
    }
    if (f !== "" || row.length) { row.push(f); rows.push(row); }
    return rows;
  }
  async function loadCsvOffers() {
    offersState = "loading"; renderOffers();
    try {
      var res = await fetch(CONFIG.offersCsvUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("http");
      var rows = parseCsv(await res.text());
      var head = (rows.shift() || []).map(function (h) { return String(h).trim().toLowerCase(); });
      function col(keys, not) {
        for (var k = 0; k < keys.length; k++) for (var i = 0; i < head.length; i++) if (i !== not && head[i].indexOf(keys[k]) >= 0) return i;
        return -1;
      }
      var iMrp = col(["original", "mrp"]);
      var iName = col(["name", "product"]), iNote = col(["description", "note"]), iImg = col(["image", "photo"]);
      var iPrice = col(["deal", "offer price", "price"], iMrp), iUntil = col(["ends", "end date", "until", "valid"]);
      if (iName < 0 || iMrp < 0 || iPrice < 0 || iUntil < 0) throw new Error("columns");
      var arr = [];
      rows.forEach(function (r, n) {
        var o = normOffer({ name: r[iName], note: iNote >= 0 ? r[iNote] : "", img: iImg >= 0 ? r[iImg] : "", mrp: r[iMrp], price: r[iPrice], until: r[iUntil] }, "c" + n);
        if (o) arr.push(o);
      });
      arr.reverse(); // newest rows first
      setOffers(arr);
    } catch (_) { offersState = "error"; renderOffers(); }
  }

  function updateWho() {
    var w = $("#who");
    if (!booted || STATIC) { w.textContent = ""; return; }
    w.textContent = canEdit ? (isOwner ? "Owner view, all orders" : "Editor view, all orders") : (uid ? "Showing your orders" : "Not signed in");
  }

  /* ---------- boot ---------- */
  if (STATIC && !CONFIG.offersCsvUrl) setOffers(SAMPLE_OFFERS);
  else { renderOffers(); if (STATIC) loadCsvOffers(); }
  refresh();
  renderDash();
  route();
  (async function () {
    var caps = await Promise.all([getCap("db"), getCap("user")]);
    db = caps[0];
    var u = caps[1];
    if (u) {
      try { uid = await u.id(); } catch (_) {}
      try { canEdit = await u.canEdit(); } catch (_) {}
      try { isOwner = await u.isOwner(); } catch (_) {}
    }
    booted = true;
    if (!STATIC) {
      if (db) watchOffers(); else { offersState = "unavailable"; renderOffers(); }
      if (db && canEdit) {
        $("#adminLink").hidden = false;
        getCap("assets").then(function (a) { assetsApi = a; $("#f-file-wrap").hidden = !a; });
      }
    }
    if (STATIC ? !CONFIG.formEndpoint : (!db || !uid)) {
      var msg = "Orders from this view can't be sent automatically. After you submit, you'll get a summary to copy and send to the shop.";
      ["#sendNote", "#sendNote2", "#sendNote3"].forEach(function (s) { var n = $(s); n.textContent = msg; n.hidden = false; });
    }
    updateWho();
    route();
    renderDash();
    if (STATIC) loadLocal(); else if (db && uid) watchDash();
  })();
})();
