'use client';
import { useState, useEffect, useRef } from "react";
import { Search, MapPin, MessageCircle, Plus, X, ArrowUpRight, Wheat, ShieldCheck, Flag, AlertTriangle, Wrench, Tag, TrendingUp, Share2, Star, Heart, HelpCircle, Bell, BellRing } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const TOKENS = `
  :root {
    --ground: #FFFFFF;
    --ground-raised: #FFF7F0;
    --gold: #F0761E;
    --clay: #D2402A;
    --clay-dark: #A82F1E;
    --leaf: #7FA65F;
    --leaf-dark: #5E7F45;
    --cream: #2B2015;
    --cream-dim: #8A7A68;
    --line: #F0DFC9;
  }
  .stall-root { background: var(--ground); color: var(--cream); font-family: 'Work Sans', sans-serif; }
  .display { font-family: 'Bricolage Grotesque', sans-serif; }
  .mono { font-family: 'IBM Plex Mono', monospace; }
  .card { background: var(--ground-raised); border: 1px solid var(--line); }
  .tag-baker { background: rgba(240,118,30,0.14); color: var(--gold); border: 1px solid rgba(240,118,30,0.45); }
  .tag-caterer { background: rgba(210,64,42,0.12); color: var(--clay); border: 1px solid rgba(210,64,42,0.4); }
  .tag-supplier { background: rgba(127,166,95,0.16); color: var(--leaf-dark); border: 1px solid rgba(127,166,95,0.45); }
  .pin-corner { position: absolute; top: -7px; right: 14px; width: 14px; height: 14px; background: var(--clay); clip-path: polygon(50% 0, 100% 100%, 0 100%); }
  .zigzag { height: 8px; background-image: linear-gradient(135deg, var(--gold) 25%, transparent 25%), linear-gradient(225deg, var(--clay) 25%, transparent 25%); background-size: 12px 8px; background-position: 0 0; opacity: 0.55; }
  .btn-primary { background: var(--gold); color: #FFFFFF; font-weight: 600; }
  .btn-primary:hover { background: #d9670f; }
  .pill { border: 1px solid var(--line); color: var(--cream-dim); }
  .pill-active { background: var(--gold); color: #FFFFFF; border-color: var(--gold); font-weight: 600; }
  .badge-verified { background: rgba(127,166,95,0.16); color: var(--leaf-dark); border: 1px solid rgba(127,166,95,0.45); }
  .report-btn { color: var(--cream-dim); }
  .report-btn:hover { color: var(--clay); }
  .nudge { background: rgba(210,64,42,0.06); border: 1px solid rgba(210,64,42,0.2); color: var(--cream-dim); }
  input, textarea { background: #FFFFFF; border: 1px solid var(--line); color: var(--cream); }
  input::placeholder, textarea::placeholder { color: var(--cream-dim); }
`;

const SEED_LISTINGS = [
  { id: 1, name: "Ama's Buttercream Bar", type: "baker", area: "East Legon, Accra", price: "GH₵150–800", overflow: true, verified: true, listedOn: "2026-06-02", photos: ["https://picsum.photos/seed/agoro1/400/300"], whatsapp: "233241111111", blurb: "Custom celebration cakes, ribbon icing, fondant work.", status: "approved" },
  { id: 2, name: "Osu Chop House Catering", type: "caterer", area: "Osu, Accra", price: "GH₵40/head+", overflow: false, verified: true, listedOn: "2026-06-04", photos: ["https://picsum.photos/seed/agoro2/400/300"], whatsapp: "233242222222", blurb: "Full-service event catering — jollof, grilled tilapia, chin chin platters.", status: "approved" },
  { id: 3, name: "Kente Cake Box Co.", type: "supplier", area: "Dansoman, Accra", price: "GH₵5–25/box", overflow: false, verified: true, listedOn: "2026-06-10", photos: ["https://picsum.photos/seed/agoro3/400/300"], whatsapp: "233243333333", blurb: "Cake boxes, ribbon, food coloring gel, cake boards.", status: "approved" },
  { id: 4, name: "Nana's Naked Cakes", type: "baker", area: "Tema", price: "GH₵200–600", overflow: true, verified: false, listedOn: "2026-07-01", photos: ["https://picsum.photos/seed/agoro4/400/300"], whatsapp: "233244444444", blurb: "Semi-naked cakes, cupcakes, small-batch orders welcome.", status: "approved" },
  { id: 5, name: "Golden Grain Flour Supply", type: "supplier", area: "Kumasi", price: "Wholesale", overflow: false, verified: true, listedOn: "2026-06-20", photos: [], whatsapp: "233245555555", blurb: "Bulk flour, sugar, cocoa — deliveries across Ashanti region.", status: "approved" },
  { id: 6, name: "Efua's Small Chops", type: "caterer", area: "Dansoman, Accra", price: "GH₵25/head+", overflow: true, verified: false, listedOn: "2026-07-08", photos: ["https://picsum.photos/seed/agoro6/400/300"], whatsapp: "233246666666", blurb: "Spring rolls, samosas, meat pies — takes overflow orders from other vendors.", status: "approved" },
];

const SEED_THREADS = [
  { id: 1, category: "Ingredient Sourcing", title: "Where to find gel food coloring right now?", postedOn: "2026-07-09", status: "approved", replies: [
      { author: "Adjoa", text: "Kente Cake Box Co. has it in stock as of this week, check their listing." },
      { author: "Kwame", text: "Also seen it at Makola near the fabric section, small shop by the entrance." },
    ]},
  { id: 2, category: "Pricing Advice", title: "How much for a 2-tier wedding cake, 150 guests?", postedOn: "2026-07-05", status: "approved", replies: [
      { author: "Ama", text: "I usually quote GH₵1,800–2,400 depending on design complexity, that range holds up." },
    ]},
  { id: 3, category: "Equipment", title: "Anyone selling a used stand mixer, Accra area?", postedOn: "2026-07-12", status: "approved", replies: [] },
  { id: 4, category: "General", title: "Best way to package cakes for okada delivery without damage?", postedOn: "2026-06-28", status: "approved", replies: [
      { author: "Efua", text: "Box + non-slip mat inside, and always tell the rider to keep it flat on the seat." },
    ]},
];

const CATS = ["All", "baker", "caterer", "supplier"];
const CAT_LABEL = { baker: "Bakers", caterer: "Caterers", supplier: "Suppliers" };
const FORUM_CATS = ["All", "Ingredient Sourcing", "Pricing Advice", "Equipment", "General"];

const SEED_TOOLS = [
  { id: 1, title: "6-Tier Cake Stand (adjustable height)", description: "Barely used, adjustable turntable stand, great for wedding displays.", price: "GH₵350", location: "East Legon, Accra", category: "Decorating Tools", seller: "Ama", postedOn: "2026-07-14", whatsapp: "233241111111", photos: ["https://picsum.photos/seed/tool1/400/300"], status: "approved" },
  { id: 2, title: "KitchenAid Stand Mixer, 5L", description: "Used for 2 years, still strong motor, comes with whisk and dough hook.", price: "GH₵2,200", location: "Tema", category: "Mixers", postedOn: "2026-07-10", seller: "Nana", whatsapp: "233244444444", photos: ["https://picsum.photos/seed/tool2/400/300"], status: "approved" },
  { id: 3, title: "Set of 12 Silicone Cake Pans", description: "Assorted round and square sizes, non-stick, minor wear.", price: "GH₵180", location: "Dansoman, Accra", category: "Pans & Molds", postedOn: "2026-07-08", seller: "Efua", whatsapp: "233246666666", photos: [], status: "approved" },
  { id: 4, title: "Gas Deck Oven (double)", description: "Selling as I'm upgrading — reliable, even bake, buyer arranges pickup.", price: "GH₵4,500", location: "Kumasi", category: "Ovens & Ranges", postedOn: "2026-07-01", seller: "Golden Grain Bakery", whatsapp: "233245555555", photos: ["https://picsum.photos/seed/tool4/400/300"], status: "approved" },
];

const TOOL_CATS = ["All", "Mixers", "Ovens & Ranges", "Pans & Molds", "Decorating Tools", "Other"];

const SEED_PRICES = [
  { id: 1, item: "Walmart Jasmine Rice, 20lb", price: "GH₵95", store: "Palace Mall, Accra", reporter: "Adjoa", postedOn: "2026-07-16", status: "approved" },
  { id: 2, item: "Gel Food Coloring (Wilton set)", price: "GH₵60", store: "Makola Market", reporter: "Kwame", postedOn: "2026-07-15", status: "approved" },
  { id: 3, item: "Baking Flour, 50kg bag", price: "GH₵410", store: "Kaneshie Market", reporter: "Nana", postedOn: "2026-07-13", status: "approved" },
  { id: 4, item: "Butter, 1kg block", price: "GH₵75", store: "Shoprite, Accra Mall", reporter: "Efua", postedOn: "2026-07-11", status: "approved" },
];

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function renderStars(rating) {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

// PushManager wants the VAPID public key as a Uint8Array, not the base64url
// string it's normally shared as.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const BLURB_MAX = 220;

function waLink(number, itemName) {
  if (!number) return null;
  const message = `Hi! I saw your listing for "${itemName}" on Agoro and I'm interested.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function compressImage(file, maxWidth = 1400, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve(file);
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file); // compression failed — fall back to the original file
            resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file); // couldn't decode — fall back to the original file
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function StallDirectory() {
  const [tab, setTab] = useState("directory");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState(supabase ? [] : SEED_LISTINGS);
  const [showAdd, setShowAdd] = useState(false);
  const [reported, setReported] = useState({});
  const [loading, setLoading] = useState(!!supabase);
  const [photoPreview, setPhotoPreview] = useState([]);
  const [submittingListing, setSubmittingListing] = useState(false);
  const [listingPhotoNote, setListingPhotoNote] = useState("");
  // Ids of items just submitted in this session — shown to their own submitter
  // right away even though they're "pending" and hidden from everyone else.
  const [myListingIds, setMyListingIds] = useState(() => new Set());

  const [forumFilter, setForumFilter] = useState("All");
  const [threads, setThreads] = useState(supabase ? [] : SEED_THREADS);
  const [openThread, setOpenThread] = useState(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [threadError, setThreadError] = useState("");
  const [replyError, setReplyError] = useState({}); // { [threadId]: message }
  const [subscribedThreads, setSubscribedThreads] = useState(() => new Set()); // thread ids notified on this device
  const [subscribingThread, setSubscribingThread] = useState(null); // thread id currently mid-subscribe
  const [subscribeError, setSubscribeError] = useState({}); // { [threadId]: message }

  const [toolFilter, setToolFilter] = useState("All");
  const [toolQuery, setToolQuery] = useState("");
  const [tools, setTools] = useState(supabase ? [] : SEED_TOOLS);
  const [showAddTool, setShowAddTool] = useState(false);
  const [reportedTools, setReportedTools] = useState({});
  const [toolPhotoPreview, setToolPhotoPreview] = useState([]);
  const [submittingTool, setSubmittingTool] = useState(false);
  const [toolPhotoNote, setToolPhotoNote] = useState("");
  const [myToolIds, setMyToolIds] = useState(() => new Set());

  const [prices, setPrices] = useState(supabase ? [] : SEED_PRICES);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [priceIndex, setPriceIndex] = useState(0);
  const [priceSubmitted, setPriceSubmitted] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [adBanner, setAdBanner] = useState(null); // { image, link, label } — set from Supabase once a real advertiser signs on

  // Manage / edit my listing flow
  const [manageOpen, setManageOpen] = useState(false);
  const [manageStep, setManageStep] = useState("lookup"); // lookup | results | edit
  const [manageWhatsapp, setManageWhatsapp] = useState("");
  const [manageResults, setManageResults] = useState([]); // [{kind:'listing'|'tool', ...row}]
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [editingItem, setEditingItem] = useState(null); // {kind, ...row}
  const [manageSaved, setManageSaved] = useState(false);
  const [editKeepPhotos, setEditKeepPhotos] = useState([]); // existing photo URLs not yet removed
  const [editNewPhotoPreviews, setEditNewPhotoPreviews] = useState([]);
  const [editPhotoNote, setEditPhotoNote] = useState("");

  // Reviews — open+moderated like threads/prices; only approved ones count/show.
  const [reviews, setReviews] = useState([]);
  const [openReviews, setOpenReviews] = useState(null); // `${kind}-${id}` currently expanded
  const [reviewFormOpen, setReviewFormOpen] = useState(null); // `${kind}-${id}` showing the leave-a-review form
  const [reviewSubmitted, setReviewSubmitted] = useState({}); // { [`${kind}-${id}`]: true } — thank-you message
  const [reviewError, setReviewError] = useState({}); // { [`${kind}-${id}`]: message }

  // Favorites — device-local only (no accounts in this app), persisted in localStorage.
  const [favorites, setFavorites] = useState(() => new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFavoritesOnlyTools, setShowFavoritesOnlyTools] = useState(false);

  // Photo lightbox — view all photos on a listing/tool, not just the first one
  const [lightbox, setLightbox] = useState(null); // { photos: [], index: 0, title: '' }

  function openLightbox(photos, index, title) {
    setLightbox({ photos, index, title });
  }
  function closeLightbox() {
    setLightbox(null);
  }
  function lightboxNext() {
    setLightbox((lb) => (lb ? { ...lb, index: (lb.index + 1) % lb.photos.length } : lb));
  }
  function lightboxPrev() {
    setLightbox((lb) => (lb ? { ...lb, index: (lb.index - 1 + lb.photos.length) % lb.photos.length } : lb));
  }
  const touchStartX = useRef(null);
  function handleLightboxTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleLightboxTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) lightboxNext();
      else lightboxPrev();
    }
    touchStartX.current = null;
  }

  // Synchronous guards against double-tap duplicate submissions — state-based
  // disabling isn't fast enough to catch a rapid second tap before re-render.
  const listingSubmitLock = useRef(false);
  const toolSubmitLock = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("agoro_favorites");
      if (raw) setFavorites(new Set(JSON.parse(raw)));
      const rawSubs = localStorage.getItem("agoro_subscribed_threads");
      if (rawSubs) setSubscribedThreads(new Set(JSON.parse(rawSubs)));
    } catch {
      // localStorage unavailable (private browsing, etc.) — favorites just won't persist
    }
  }, []);

  useEffect(() => {
    if (!supabase) return; // no env vars set yet — running on seed data only
    (async () => {
      const { data: listingRows } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      const { data: threadRows } = await supabase.from("threads").select("*").order("created_at", { ascending: false });
      const { data: replyRows } = await supabase.from("replies").select("*").order("created_at", { ascending: true });
      const { data: toolRows } = await supabase.from("tools").select("*").order("created_at", { ascending: false });
      const { data: priceRows } = await supabase.from("prices").select("*").order("created_at", { ascending: false });
      const { data: reviewRows } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      const { data: adRow } = await supabase.from("ad_banner").select("*").eq("id", 1).maybeSingle();

      setListings(
        (listingRows || []).map((l) => ({
          id: l.id, name: l.name, type: l.type, area: l.area, price: l.price, whatsapp: l.whatsapp,
          overflow: l.overflow, verified: l.verified, featured: l.featured, listedOn: l.created_at?.slice(0, 10), blurb: l.blurb,
          photos: l.photos || [], status: l.status, faq: l.faq, contactClickCount: l.contact_click_count || 0,
        }))
      );
      setThreads(
        (threadRows || []).map((t) => ({
          id: t.id, category: t.category, title: t.title, postedOn: t.created_at?.slice(0, 10), status: t.status,
          replies: (replyRows || []).filter((r) => r.thread_id === t.id).map((r) => ({ author: r.author, text: r.text })),
        }))
      );
      setTools(
        (toolRows || []).map((t) => ({
          id: t.id, title: t.title, description: t.description, price: t.price, location: t.location, whatsapp: t.whatsapp,
          category: t.category, seller: t.seller, postedOn: t.created_at?.slice(0, 10), photos: t.photos || [], status: t.status,
          faq: t.faq, contactClickCount: t.contact_click_count || 0,
        }))
      );
      setPrices(
        (priceRows || []).map((p) => ({
          id: p.id, item: p.item, price: p.price, store: p.store, reporter: p.reporter,
          postedOn: p.created_at?.slice(0, 10), status: p.status,
        }))
      );
      setReviews(
        (reviewRows || []).map((r) => ({
          id: r.id, itemId: r.item_id, kind: r.kind, reviewer: r.reviewer, rating: r.rating, text: r.text, status: r.status,
        }))
      );
      if (adRow) {
        setAdBanner({ image: adRow.image, link: adRow.link, label: adRow.label });
      }
      setLoading(false);
    })();
  }, []);

  const approvedPrices = prices.filter((p) => p.status === "approved");

  useEffect(() => {
    if (approvedPrices.length < 2) return;
    const timer = setInterval(() => {
      setPriceIndex((i) => (i + 1) % approvedPrices.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [approvedPrices.length]);

  const filtered = listings.filter(
    (l) =>
      (l.status === "approved" || myListingIds.has(l.id)) &&
      (filter === "All" || l.type === filter) &&
      (!showFavoritesOnly || favorites.has(`listing-${l.id}`)) &&
      (l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.area.toLowerCase().includes(query.toLowerCase()) ||
        l.blurb.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredThreads = threads.filter((t) => t.status === "approved" && (forumFilter === "All" || t.category === forumFilter));

  const filteredTools = tools.filter(
    (t) =>
      (t.status === "approved" || myToolIds.has(t.id)) &&
      (toolFilter === "All" || t.category === toolFilter) &&
      (!showFavoritesOnlyTools || favorites.has(`tool-${t.id}`)) &&
      (t.title.toLowerCase().includes(toolQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(toolQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(toolQuery.toLowerCase()))
  );

  const featuredListing =
    filtered.find((l) => l.featured && l.photos && l.photos.length > 0) ||
    filtered.find((l) => l.verified && l.photos && l.photos.length > 0) ||
    filtered.find((l) => l.photos && l.photos.length > 0) ||
    null;

  function approvedReviewsFor(kind, id) {
    return reviews.filter((r) => r.kind === kind && r.itemId === id && r.status === "approved");
  }
  function ratingSummary(kind, id) {
    const rs = approvedReviewsFor(kind, id);
    if (rs.length === 0) return null;
    const avg = rs.reduce((sum, r) => sum + r.rating, 0) / rs.length;
    return { avg, count: rs.length };
  }

  async function addReview(kind, itemId, e) {
    e.preventDefault();
    const f = e.target;
    const key = `${kind}-${itemId}`;
    const draft = {
      item_id: itemId,
      kind,
      reviewer: f.reviewer.value,
      rating: Number(f.rating.value),
      text: f.text.value,
      status: "approved",
    };
    if (supabase) {
      const { error } = await supabase.from("reviews").insert(draft).select();
      if (error) {
        setReviewError((prev) => ({ ...prev, [key]: `Couldn't submit: ${error.message}` }));
        return;
      }
    }
    setReviews((prev) => [{ id: Date.now(), itemId, kind, reviewer: draft.reviewer, rating: draft.rating, text: draft.text, status: "approved" }, ...prev]);
    setReviewError((prev) => ({ ...prev, [key]: "" }));
    setReviewFormOpen(null);
    setReviewSubmitted((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setReviewSubmitted((prev) => ({ ...prev, [key]: false })), 6000);
  }

  function toggleFavorite(kind, id) {
    const key = `${kind}-${id}`;
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem("agoro_favorites", JSON.stringify([...next]));
      } catch {
        // localStorage unavailable — favorite still works for this session
      }
      return next;
    });
  }

  function trackContactClick(kind, id) {
    if (!supabase) return;
    const table = kind === "tool" ? "tools" : "listings";
    supabase.rpc("increment_contact_click", { p_table: table, p_id: id }).then(() => {}, () => {});
  }

  async function addListing(e) {
    e.preventDefault();
    if (listingSubmitLock.current) return; // already submitting — ignore a fast double-tap/double-click
    const f = e.target;
    const files = Array.from(f.photos.files).slice(0, 4);
    let photos = [];
    let failedCount = 0;

    if (files.length === 0) {
      setListingPhotoNote("Please add at least one photo before submitting.");
      return;
    }

    listingSubmitLock.current = true;
    setSubmittingListing(true);
    setListingPhotoNote("");

    try {
      if (supabase && files.length) {
        const uploads = await Promise.all(
          files.map(async (file) => {
            const compressed = await compressImage(file);
            const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
            let { error } = await supabase.storage.from("listing-photos").upload(path, compressed);
            if (error) {
              // one retry — mobile connections drop mid-upload sometimes
              ({ error } = await supabase.storage.from("listing-photos").upload(path, compressed));
            }
            if (error) {
              failedCount += 1;
              return null;
            }
            return supabase.storage.from("listing-photos").getPublicUrl(path).data.publicUrl;
          })
        );
        photos = uploads.filter(Boolean);
      } else if (files.length) {
        photos = files.map((file) => URL.createObjectURL(file)); // preview-only, doesn't persist without Supabase
      }

      const draft = {
        name: f.name.value,
        type: f.type.value,
        area: f.area.value,
        price: f.price.value,
        whatsapp: f.whatsapp.value.replace(/[^0-9]/g, ""),
        overflow: f.overflow.checked,
        verified: true,
        blurb: f.blurb.value,
        photos,
        status: "approved",
        edit_pin: f.pin.value.trim(),
        faq: f.faq.value.trim() || null,
      };
      let newId = Date.now();
      if (supabase) {
        // .select() forces Supabase to report RLS/schema failures as a real
        // error instead of returning 201 success while writing zero rows —
        // and gives us back the real uuid, needed since reviews reference
        // this id as a foreign key (a fake local id would break "leave a
        // review" on a listing submitted this same session).
        const { data: insertData, error: insertError } = await supabase.from("listings").insert(draft).select();
        if (insertError) {
          setListingPhotoNote(`Your listing wasn't saved: ${insertError.message}`);
          return;
        }
        if (insertData && insertData[0]) newId = insertData[0].id;
      }
      setListings([{ ...draft, id: newId, listedOn: new Date().toISOString().slice(0, 10) }, ...listings]);
      setMyListingIds((prev) => new Set(prev).add(newId));
      setShowAdd(false);
      setPhotoPreview([]);
      f.reset();
      if (failedCount > 0) {
        setListingPhotoNote(`Your listing posted, but ${failedCount} photo${failedCount > 1 ? "s" : ""} didn't upload — you can add ${failedCount > 1 ? "them" : "it"} by posting again with just that photo, or check your connection and try later.`);
        setTimeout(() => setListingPhotoNote(""), 8000);
      }
    } catch (err) {
      setListingPhotoNote("Something went wrong submitting your listing — check your connection and try again.");
    } finally {
      setSubmittingListing(false);
      listingSubmitLock.current = false;
    }
  }

  async function addThread(e) {
    e.preventDefault();
    const f = e.target;
    const draft = { category: f.category.value, title: f.title.value, status: "approved" };
    let newId = Date.now();
    if (supabase) {
      // Needs the real uuid back, not a fake local id — replies reference
      // this thread's id as a foreign key.
      const { data, error } = await supabase.from("threads").insert(draft).select();
      if (error) {
        setThreadError(`Couldn't post: ${error.message}`);
        return;
      }
      if (data && data[0]) newId = data[0].id;
    }
    setThreadError("");
    setThreads([{ ...draft, id: newId, postedOn: new Date().toISOString().slice(0, 10), replies: [] }, ...threads]);
    setShowNewThread(false);
    f.reset();
  }

  async function addReply(threadId, e) {
    e.preventDefault();
    const f = e.target;
    const draft = { thread_id: threadId, author: f.author.value, text: f.text.value, status: "approved" };
    if (supabase) {
      const { error } = await supabase.from("replies").insert(draft).select();
      if (error) {
        setReplyError((prev) => ({ ...prev, [threadId]: `Couldn't post: ${error.message}` }));
        return;
      }
    }
    setReplyError((prev) => ({ ...prev, [threadId]: "" }));
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, replies: [...t.replies, { author: draft.author, text: draft.text }] } : t))
    );
    f.reset();

    if (supabase) {
      const thread = threads.find((t) => t.id === threadId);
      fetch("/api/notify-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          threadTitle: thread ? thread.title : "",
          replyAuthor: draft.author,
          replyText: draft.text,
        }),
      }).catch(() => {}); // best-effort — a failed push shouldn't block the reply from posting
    }
  }

  async function subscribeToThread(threadId) {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setSubscribeError((prev) => ({ ...prev, [threadId]: "Notifications aren't supported in this browser." }));
      return;
    }
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      setSubscribeError((prev) => ({ ...prev, [threadId]: "Notifications aren't set up yet." }));
      return;
    }
    setSubscribeError((prev) => ({ ...prev, [threadId]: "" }));
    setSubscribingThread(threadId);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setSubscribeError((prev) => ({ ...prev, [threadId]: "Notifications were blocked — enable them in your browser settings to turn this on." }));
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing || (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) }));
      const subJson = subscription.toJSON();
      if (supabase) {
        // Plain insert rather than upsert — this project's RLS authorizes a
        // straight INSERT but not the ON CONFLICT DO UPDATE path an upsert
        // generates, even with an UPDATE policy in place. A duplicate-key
        // error here just means this browser is already subscribed to this
        // thread, which isn't a real failure.
        const { error } = await supabase
          .from("push_subscriptions")
          .insert({ thread_id: threadId, endpoint: subJson.endpoint, p256dh: subJson.keys.p256dh, auth: subJson.keys.auth });
        if (error && error.code !== "23505") {
          setSubscribeError((prev) => ({ ...prev, [threadId]: `Couldn't save subscription: ${error.message}` }));
          return;
        }
      }
      setSubscribedThreads((prev) => {
        const next = new Set(prev).add(threadId);
        try {
          localStorage.setItem("agoro_subscribed_threads", JSON.stringify([...next]));
        } catch {
          // localStorage unavailable — subscription still works for this session
        }
        return next;
      });
    } catch (err) {
      setSubscribeError((prev) => ({ ...prev, [threadId]: "Something went wrong turning on notifications." }));
    } finally {
      setSubscribingThread(null);
    }
  }

  async function reportListing(id) {
    setReported({ ...reported, [id]: true });
    if (supabase) await supabase.from("reports").insert({ listing_id: id });
  }

  async function addTool(e) {
    e.preventDefault();
    if (toolSubmitLock.current) return; // already submitting — ignore a fast double-tap/double-click
    const f = e.target;
    const files = Array.from(f.photos.files).slice(0, 4);
    let photos = [];
    let failedCount = 0;

    if (files.length === 0) {
      setToolPhotoNote("Please add at least one photo before submitting.");
      return;
    }

    toolSubmitLock.current = true;
    setSubmittingTool(true);
    setToolPhotoNote("");

    try {
      if (supabase && files.length) {
        const uploads = await Promise.all(
          files.map(async (file) => {
            const compressed = await compressImage(file);
            const path = `tools/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
            let { error } = await supabase.storage.from("listing-photos").upload(path, compressed);
            if (error) {
              ({ error } = await supabase.storage.from("listing-photos").upload(path, compressed));
            }
            if (error) {
              failedCount += 1;
              return null;
            }
            return supabase.storage.from("listing-photos").getPublicUrl(path).data.publicUrl;
          })
        );
        photos = uploads.filter(Boolean);
      } else if (files.length) {
        photos = files.map((file) => URL.createObjectURL(file)); // preview-only, doesn't persist without Supabase
      }

      const draft = {
        title: f.title.value,
        description: f.description.value,
        price: f.price.value,
        location: f.location.value,
        category: f.category.value,
        seller: f.seller.value,
        whatsapp: f.whatsapp.value.replace(/[^0-9]/g, ""),
        photos,
        status: "approved",
        edit_pin: f.pin.value.trim(),
        faq: f.faq.value.trim() || null,
      };
      let newId = Date.now();
      if (supabase) {
        const { data: insertData, error: insertError } = await supabase.from("tools").insert(draft).select();
        if (insertError) {
          setToolPhotoNote(`Your listing wasn't saved: ${insertError.message}`);
          return;
        }
        if (insertData && insertData[0]) newId = insertData[0].id;
      }
      setTools([{ ...draft, id: newId, postedOn: new Date().toISOString().slice(0, 10) }, ...tools]);
      setMyToolIds((prev) => new Set(prev).add(newId));
      setShowAddTool(false);
      setToolPhotoPreview([]);
      f.reset();
      if (failedCount > 0) {
        setToolPhotoNote(`Your listing posted, but ${failedCount} photo${failedCount > 1 ? "s" : ""} didn't upload — you can add ${failedCount > 1 ? "them" : "it"} by posting again with just that photo, or check your connection and try later.`);
        setTimeout(() => setToolPhotoNote(""), 8000);
      }
    } catch (err) {
      setToolPhotoNote("Something went wrong submitting your listing — check your connection and try again.");
    } finally {
      setSubmittingTool(false);
      toolSubmitLock.current = false;
    }
  }

  async function reportTool(id) {
    setReportedTools({ ...reportedTools, [id]: true });
    if (supabase) await supabase.from("reports").insert({ listing_id: id });
  }

  async function addPrice(e) {
    e.preventDefault();
    const f = e.target;
    const draft = {
      item: f.item.value,
      price: f.price.value,
      store: f.store.value,
      reporter: f.reporter.value,
      status: "approved",
    };
    if (supabase) {
      const { error } = await supabase.from("prices").insert(draft).select();
      if (error) {
        setPriceError(`Couldn't submit: ${error.message}`);
        return;
      }
    }
    setPriceError("");
    setPrices([{ ...draft, id: Date.now(), postedOn: new Date().toISOString().slice(0, 10) }, ...prices]);
    setShowAddPrice(false);
    setPriceSubmitted(true);
    setTimeout(() => setPriceSubmitted(false), 4000);
    f.reset();
  }

  async function shareApp() {
    const shareData = {
      title: "Agoro",
      text: "Agoro — find bakers, caterers, suppliers, and used baking tools, all in one place. Check it out:",
      url: typeof window !== "undefined" ? window.location.origin : "",
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      return; // person cancelled the native share sheet, nothing to do
    }
    try {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch (err) {
      // clipboard unavailable — nothing more we can do silently
    }
  }

  function openManage() {
    setManageOpen(true);
    setManageStep("lookup");
    setManageWhatsapp("");
    setManageResults([]);
    setManageError("");
    setEditingItem(null);
    setManageSaved(false);
    setPinInput("");
    setPinError("");
  }

  function closeManage() {
    setManageOpen(false);
  }

  async function lookupMyListings(e) {
    e.preventDefault();
    setManageError("");
    const raw = manageWhatsapp.trim();
    const digits = raw.replace(/[^0-9]/g, "");
    if (!raw) {
      setManageError("Enter your WhatsApp number, or the business/item name you posted under.");
      return;
    }
    setManageLoading(true);

    if (supabase) {
      const filters = [];
      if (digits) filters.push(`whatsapp.eq.${digits}`);
      filters.push(`name.ilike.%${raw}%`);
      const toolFilters = [];
      if (digits) toolFilters.push(`whatsapp.eq.${digits}`);
      toolFilters.push(`title.ilike.%${raw}%`);

      const [{ data: myListings }, { data: myTools }] = await Promise.all([
        supabase.from("listings").select("*").or(filters.join(",")).order("created_at", { ascending: false }),
        supabase.from("tools").select("*").or(toolFilters.join(",")).order("created_at", { ascending: false }),
      ]);
      const combined = [
        ...(myListings || []).map((l) => ({ kind: "listing", ...l })),
        ...(myTools || []).map((t) => ({ kind: "tool", ...t })),
      ];
      setManageResults(combined);
    } else {
      // demo mode without Supabase — search whatever's in local state
      const combined = [
        ...listings
          .filter((l) => (digits && l.whatsapp === digits) || l.name.toLowerCase().includes(raw.toLowerCase()))
          .map((l) => ({ kind: "listing", ...l })),
        ...tools
          .filter((t) => (digits && t.whatsapp === digits) || t.title.toLowerCase().includes(raw.toLowerCase()))
          .map((t) => ({ kind: "tool", ...t })),
      ];
      setManageResults(combined);
    }
    setManageLoading(false);
    setManageStep("results");
  }

  function startEditItem(item) {
    setEditingItem({ ...item });
    setPinInput("");
    setPinError("");
    setEditKeepPhotos(item.photos || []);
    setEditNewPhotoPreviews([]);
    setEditPhotoNote("");
    // Legacy items posted before PINs existed have no edit_pin yet — let the
    // owner straight in this one time, but they'll be required to set a PIN
    // while editing, which protects it going forward.
    setManageStep(item.edit_pin ? "pin" : "edit");
  }

  function confirmPin(e) {
    e.preventDefault();
    if (!editingItem) return;
    if (pinInput.trim() === editingItem.edit_pin) {
      setPinError("");
      setManageStep("edit");
    } else {
      setPinError("That PIN doesn't match. If you've forgotten it, you'll need to post a new listing.");
    }
  }

  async function saveEditedItem(e) {
    e.preventDefault();
    if (!editingItem) return;
    const f = e.target;

    // Legacy items posted before PINs existed require setting one now, as a
    // condition of this edit — protects the listing going forward.
    if (!editingItem.edit_pin) {
      const newPin = f.newPin.value.trim();
      if (!newPin || newPin.length < 4) {
        setManageError("Please set a PIN (at least 4 digits) to protect this listing going forward.");
        return;
      }
    }
    setManageError("");
    setEditPhotoNote("");
    setManageLoading(true);

    const newFiles = f.newPhotos ? Array.from(f.newPhotos.files).slice(0, 4 - editKeepPhotos.length) : [];
    let uploadedPhotoUrls = [];
    let failedPhotoCount = 0;
    if (supabase && newFiles.length) {
      const uploads = await Promise.all(
        newFiles.map(async (file) => {
          const compressed = await compressImage(file);
          const prefix = editingItem.kind === "tool" ? "tools/" : "";
          const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
          let { error } = await supabase.storage.from("listing-photos").upload(path, compressed);
          if (error) {
            // one retry — mobile connections drop mid-upload sometimes
            ({ error } = await supabase.storage.from("listing-photos").upload(path, compressed));
          }
          if (error) {
            failedPhotoCount += 1;
            return null;
          }
          return supabase.storage.from("listing-photos").getPublicUrl(path).data.publicUrl;
        })
      );
      uploadedPhotoUrls = uploads.filter(Boolean);
    }
    const finalPhotos = [...editKeepPhotos, ...uploadedPhotoUrls];

    if (editingItem.kind === "listing") {
      const updates = {
        name: f.name.value,
        type: f.type.value,
        area: f.area.value,
        price: f.price.value,
        blurb: f.blurb.value,
        whatsapp: f.whatsapp.value.replace(/[^0-9]/g, ""),
        edit_pin: editingItem.edit_pin || f.newPin.value.trim(),
        photos: finalPhotos,
        faq: f.faq.value.trim() || null,
      };
      if (supabase) {
        // .select() forces Supabase to report a failed/blocked update as a real
        // error instead of returning success while updating zero rows.
        const { data: updateData, error: updateError } = await supabase.from("listings").update(updates).eq("id", editingItem.id).select();
        if (updateError) {
          setManageError(`Couldn't save: ${updateError.message}`);
          setManageLoading(false);
          return;
        }
        if (!updateData || updateData.length === 0) {
          setManageError("Couldn't save: the listing wasn't found or you don't have permission to edit it.");
          setManageLoading(false);
          return;
        }
      }
      setListings((prev) => prev.map((l) => (l.id === editingItem.id ? { ...l, ...updates } : l)));
    } else {
      const updates = {
        title: f.title.value,
        description: f.description.value,
        price: f.price.value,
        location: f.location.value,
        category: f.category.value,
        whatsapp: f.whatsapp.value.replace(/[^0-9]/g, ""),
        edit_pin: editingItem.edit_pin || f.newPin.value.trim(),
        photos: finalPhotos,
        faq: f.faq.value.trim() || null,
      };
      if (supabase) {
        const { data: updateData, error: updateError } = await supabase.from("tools").update(updates).eq("id", editingItem.id).select();
        if (updateError) {
          setManageError(`Couldn't save: ${updateError.message}`);
          setManageLoading(false);
          return;
        }
        if (!updateData || updateData.length === 0) {
          setManageError("Couldn't save: the listing wasn't found or you don't have permission to edit it.");
          setManageLoading(false);
          return;
        }
      }
      setTools((prev) => prev.map((t) => (t.id === editingItem.id ? { ...t, ...updates } : t)));
    }

    setManageLoading(false);
    setManageSaved(true);
    if (failedPhotoCount > 0) {
      setEditPhotoNote(`Saved, but ${failedPhotoCount} new photo${failedPhotoCount > 1 ? "s" : ""} didn't upload — check your connection and try adding ${failedPhotoCount > 1 ? "them" : "it"} again.`);
    } else {
      setTimeout(() => {
        setManageOpen(false);
      }, 1500);
    }
  }

  return (
    <div className="stall-root" style={{ minHeight: "100%" }}>
      <style>{TOKENS}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" />

      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between max-w-4xl mx-auto flex-wrap gap-2">
          <img src="/agoro-logo.png" alt="Agoro" style={{ height: 168, width: "auto" }} />
          <div className="flex items-center gap-3">
            <button
              onClick={openManage}
              className="pill rounded-full px-3 py-1.5 text-xs mono flex items-center gap-1.5 shrink-0"
            >
              <Tag size={13} /> Manage my listing
            </button>
            <button
              onClick={shareApp}
              className="pill rounded-full px-3 py-1.5 text-xs mono flex items-center gap-1.5 shrink-0"
            >
              <Share2 size={13} /> Share Agoro
            </button>
          </div>
        </div>
        {shareCopied && (
          <p className="max-w-4xl mx-auto mt-1 text-xs mono" style={{ color: "var(--leaf-dark)" }}>
            Link copied — paste it anywhere to share.
          </p>
        )}
        <p className="max-w-4xl mx-auto mt-1 text-sm" style={{ color: "var(--cream-dim)" }}>
          Hi 👋 — find bakers, caterers and suppliers near you, or ask the market anything.
        </p>
      </div>

      <div className="zigzag" />

      {/* Advertising banner */}
      <div className="max-w-4xl mx-auto px-6 pt-3">
        {adBanner && adBanner.image ? (
          <a
            href={adBanner.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--line)" }}
          >
            <img src={adBanner.image} alt={adBanner.label || "Sponsored"} className="w-full h-20 sm:h-24 object-cover" />
          </a>
        ) : (
          <div
            className="rounded-lg flex items-center justify-center h-16 sm:h-20"
            style={{ background: "var(--ground-raised)", border: "1px dashed var(--line)" }}
          >
            <span className="mono text-xs" style={{ color: "var(--cream-dim)" }}>
              Advertising space available — reach 400+ bakers, caterers & suppliers
            </span>
          </div>
        )}
      </div>

      {/* Trending price ticker */}
      <div className="max-w-4xl mx-auto px-6 py-2 flex items-start gap-3 flex-wrap" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <TrendingUp size={14} style={{ color: "var(--leaf-dark)", flexShrink: 0, marginTop: 2 }} />
          {approvedPrices.length > 0 ? (
            <span className="mono text-xs" style={{ color: "var(--cream-dim)", wordBreak: "break-word" }}>
              Trending price: <span style={{ color: "var(--cream)", fontWeight: 600 }}>{approvedPrices[priceIndex % approvedPrices.length].item}</span>
              {" — "}
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                {approvedPrices[priceIndex % approvedPrices.length].price || "price not reported"}
              </span>
              {approvedPrices[priceIndex % approvedPrices.length].store && ` · ${approvedPrices[priceIndex % approvedPrices.length].store}`}
            </span>
          ) : (
            <span className="mono text-xs" style={{ color: "var(--cream-dim)" }}>No price reports yet — be the first to share one.</span>
          )}
        </div>
        <button
          onClick={() => setShowAddPrice(!showAddPrice)}
          className="mono text-xs px-3 py-1 rounded-full pill whitespace-nowrap shrink-0"
        >
          + Report a price
        </button>
      </div>

      {showAddPrice && (
        <div className="max-w-4xl mx-auto px-6 pt-3">
          <form onSubmit={addPrice} className="card rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input name="item" required placeholder="Item (e.g. Walmart Jasmine Rice, 20lb)" className="rounded px-3 py-2 text-sm sm:col-span-2" />
            <input name="price" required placeholder="Price (e.g. GH₵95)" className="rounded px-3 py-2 text-sm" />
            <input name="store" placeholder="Store / market (optional)" className="rounded px-3 py-2 text-sm" />
            <input name="reporter" required placeholder="Your name" className="rounded px-3 py-2 text-sm sm:col-span-2" />
            {priceError && <p className="text-xs sm:col-span-2" style={{ color: "var(--clay)" }}>{priceError}</p>}
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAddPrice(false)} className="pill rounded-lg px-4 py-2 text-sm flex items-center gap-1">
                <X size={14} /> Cancel
              </button>
              <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm">Submit</button>
            </div>
          </form>
        </div>
      )}
      {priceSubmitted && (
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs mono mb-3" style={{ color: "var(--leaf-dark)" }}>Thanks! Your price is live in the ticker.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-6 pt-6 flex gap-2">
        <button
          onClick={() => setTab("directory")}
          className={`px-4 py-2 rounded-full text-sm mono ${tab === "directory" ? "pill-active" : "pill"}`}
        >
          Directory
        </button>
        <button
          onClick={() => setTab("forum")}
          className={`px-4 py-2 rounded-full text-sm mono ${tab === "forum" ? "pill-active" : "pill"}`}
        >
          Ask the Market
        </button>
        <button
          onClick={() => setTab("tools")}
          className={`px-4 py-2 rounded-full text-sm mono ${tab === "tools" ? "pill-active" : "pill"}`}
        >
          Used Tools
        </button>
      </div>

      {/* DIRECTORY */}
      {tab === "directory" && loading && (
        <p className="max-w-4xl mx-auto px-6 py-6 text-sm mono" style={{ color: "var(--cream-dim)" }}>Loading listings…</p>
      )}
      {tab === "directory" && !loading && (
        <div className="max-w-4xl mx-auto px-6 py-6">
          {listingPhotoNote && (
            <p className="nudge rounded px-3 py-2 text-xs mb-4 flex items-start gap-1.5">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" /> {listingPhotoNote}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1 px-3 rounded-lg" style={{ border: "1px solid var(--line)" }}>
              <Search size={16} style={{ color: "var(--cream-dim)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, area, or specialty..."
                className="w-full py-2 bg-transparent outline-none text-sm"
                style={{ border: "none" }}
              />
            </div>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-2 rounded-lg text-sm mono flex items-center gap-1 shrink-0 ${showFavoritesOnly ? "pill-active" : "pill"}`}
            >
              <Heart size={14} fill={showFavoritesOnly ? "#fff" : "none"} /> Saved
            </button>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="btn-primary rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-1"
            >
              <Plus size={16} /> List your stall
            </button>
          </div>

          {featuredListing && !query && filter === "All" && (
            <div className="rounded-lg overflow-hidden relative mb-6" style={{ border: "1px solid var(--line)" }}>
              <img src={featuredListing.photos[0]} alt={featuredListing.name} className="w-full h-44 sm:h-52 object-cover" />
              <div
                className="absolute inset-0 flex flex-col justify-end p-4"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.05) 60%)" }}
              >
                <span className="mono text-[10px] px-2 py-0.5 rounded-full self-start mb-1.5" style={{ background: "var(--gold)", color: "#fff", fontWeight: 700 }}>
                  Featured this week
                </span>
                <h3 className="display text-xl sm:text-2xl" style={{ color: "#fff", fontWeight: 700 }}>{featuredListing.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="mono text-xs flex items-center gap-1" style={{ color: "#f0f0f0" }}>
                    <MapPin size={12} /> {featuredListing.area}
                  </span>
                  <span className="mono text-xs" style={{ color: "var(--gold)", fontWeight: 700 }}>{featuredListing.price}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-6 flex-wrap">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs mono ${filter === c ? "pill-active" : "pill"}`}
              >
                {c === "All" ? "All" : CAT_LABEL[c]}
              </button>
            ))}
          </div>

          {showAdd && (
            <form onSubmit={addListing} className="card rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input name="name" required placeholder="Stall / business name" className="rounded px-3 py-2 text-sm" />
              <select name="type" className="rounded px-3 py-2 text-sm" style={{ background: "#FFFFFF", border: "1px solid var(--line)", color: "var(--cream)" }}>
                <option value="baker">Baker</option>
                <option value="caterer">Caterer</option>
                <option value="supplier">Supplier</option>
              </select>
              <input name="area" required placeholder="Area / city" className="rounded px-3 py-2 text-sm" />
              <input name="price" required placeholder="Price range" className="rounded px-3 py-2 text-sm" />
              <input name="whatsapp" required placeholder="WhatsApp number, e.g. 233241234567" className="rounded px-3 py-2 text-sm sm:col-span-2" />
              <input name="pin" required minLength={4} maxLength={6} inputMode="numeric" placeholder="Set a 4-digit PIN (to edit this later)" className="rounded px-3 py-2 text-sm sm:col-span-2" />
              <p className="text-xs sm:col-span-2 -mt-1" style={{ color: "var(--cream-dim)" }}>Remember this PIN — you'll need it to edit your listing later. It's private, not shown to anyone else.</p>
              <p className="text-xs sm:col-span-2 -mt-2" style={{ color: "var(--cream-dim)" }}>Include your country code, no spaces or dashes (Ghana: 233...)</p>
              <textarea name="blurb" required maxLength={BLURB_MAX} placeholder="Short description" className="rounded px-3 py-2 text-sm sm:col-span-2" rows={2} />
              <p className="text-xs sm:col-span-2 -mt-1" style={{ color: "var(--cream-dim)" }}>Keep it short — {BLURB_MAX} characters max, so it fits nicely on your card.</p>
              <textarea name="faq" maxLength={BLURB_MAX} placeholder="FAQ / anything buyers usually ask (optional) — e.g. delivery area, lead time, custom orders" className="rounded px-3 py-2 text-sm sm:col-span-2" rows={2} />
              <div className="sm:col-span-2">
                <label className="text-xs block mb-1" style={{ color: "var(--cream-dim)" }}>Photos (up to 4)</label>
                <input
                  type="file"
                  name="photos"
                  accept="image/*"
                  multiple
                  onChange={(e) => setPhotoPreview(Array.from(e.target.files).slice(0, 4).map((f) => URL.createObjectURL(f)))}
                  className="text-xs w-full rounded px-3 py-2"
                  style={{ background: "#FFFFFF", border: "1px solid var(--line)", color: "var(--cream)" }}
                />
                {photoPreview.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {photoPreview.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-14 h-14 object-cover rounded" style={{ border: "1px solid var(--line)" }} />
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 text-xs sm:col-span-2" style={{ color: "var(--cream-dim)" }}>
                <input type="checkbox" name="overflow" /> Takes overflow / subcontracted orders
              </label>
              <p className="text-xs sm:col-span-2 flex items-center gap-1" style={{ color: "var(--cream-dim)" }}>
                <ShieldCheck size={12} style={{ color: "var(--leaf-dark)" }} /> Sign-up is limited to existing group members for now, so your listing will show as verified.
              </p>
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowAdd(false); setPhotoPreview([]); }} className="pill rounded-lg px-4 py-2 text-sm flex items-center gap-1">
                  <X size={14} /> Cancel
                </button>
                <button type="submit" disabled={submittingListing} className="btn-primary rounded-lg px-4 py-2 text-sm" style={submittingListing ? { opacity: 0.6, cursor: "wait" } : {}}>
                  {submittingListing ? "Uploading photos…" : "Add listing"}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((l) => {
              const favKey = `listing-${l.id}`;
              const rating = ratingSummary("listing", l.id);
              const reviewKey = `listing-${l.id}`;
              return (
              <div key={l.id} className="card rounded-lg overflow-hidden relative">
                <div className="pin-corner" style={{ zIndex: 2 }} />
                {l.photos && l.photos.length > 0 ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => openLightbox(l.photos, 0, l.name)}
                      className="block w-full"
                      style={{ padding: 0, border: "none", background: "none", cursor: "pointer" }}
                    >
                      <img src={l.photos[0]} alt={l.name} className="w-full h-32 sm:h-40 object-cover" />
                    </button>
                    {l.photos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => openLightbox(l.photos, 0, l.name)}
                        className="mono text-[10px] px-1.5 py-0.5 rounded absolute bottom-2 right-2"
                        style={{ background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", cursor: "pointer" }}
                      >
                        +{l.photos.length - 1} more
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-32 sm:h-40 flex items-center justify-center" style={{ background: "var(--line)", opacity: 0.35 }}>
                    <Wheat size={28} style={{ color: "var(--cream-dim)" }} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleFavorite("listing", l.id)}
                  title={favorites.has(favKey) ? "Remove from saved" : "Save"}
                  className="absolute top-2 left-2 flex items-center justify-center rounded-full"
                  style={{ width: 26, height: 26, background: "rgba(0,0,0,0.45)", border: "none", cursor: "pointer", zIndex: 2 }}
                >
                  <Heart size={13} fill={favorites.has(favKey) ? "#D2402A" : "none"} color={favorites.has(favKey) ? "#D2402A" : "#fff"} />
                </button>
                <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="display text-lg" style={{ fontWeight: 600 }}>{l.name}</h3>
                    {l.status === "pending" ? (
                      <span className="mono text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap" style={{ background: "rgba(0,0,0,0.06)", color: "var(--cream-dim)", border: "1px solid var(--line)" }}>
                        pending review
                      </span>
                    ) : l.verified && (
                      <span className="badge-verified mono text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                        <ShieldCheck size={10} /> verified member
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => reportListing(l.id)}
                    disabled={reported[l.id]}
                    title="Report this listing"
                    className="report-btn shrink-0"
                  >
                    <Flag size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: "var(--cream-dim)" }}>
                  <MapPin size={12} /> {l.area}
                  <span className="mono">· listed {formatDate(l.listedOn)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenReviews(openReviews === reviewKey ? null : reviewKey)}
                  className="flex items-center gap-1 mt-1 text-xs"
                  style={{ color: rating ? "var(--gold)" : "var(--cream-dim)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  {rating ? (
                    <><span className="mono">{renderStars(rating.avg)}</span> {rating.avg.toFixed(1)} ({rating.count})</>
                  ) : (
                    <span className="mono">No reviews yet</span>
                  )}
                </button>
                <p
                  className="text-sm mt-2"
                  style={{
                    color: "var(--cream-dim)",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {l.blurb}
                </p>
                {l.faq && (
                  <p className="text-xs mt-2 flex items-start gap-1" style={{ color: "var(--cream-dim)" }}>
                    <HelpCircle size={12} className="shrink-0 mt-0.5" /> {l.faq}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="mono text-xs" style={{ color: "var(--gold)" }}>{l.price}</span>
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {!l.verified && (
                      <span className="mono text-[9px] px-1.5 py-0.5 rounded-full" style={{ color: "var(--cream-dim)", border: "1px solid var(--line)" }}>
                        new
                      </span>
                    )}
                    {l.overflow && (
                      <span className="mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(210,64,42,0.08)", color: "var(--clay)", border: "1px solid rgba(210,64,42,0.3)" }}>
                        takes overflow orders
                      </span>
                    )}
                  </div>
                </div>
                {reported[l.id] && (
                  <p className="mt-2 text-xs flex items-center gap-1" style={{ color: "var(--clay)" }}>
                    <Flag size={11} /> Reported — thanks, we'll take a look.
                  </p>
                )}
                {waLink(l.whatsapp, l.name) ? (
                  <a
                    href={waLink(l.whatsapp, l.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackContactClick("listing", l.id)}
                    className="mt-3 w-full flex items-center justify-center gap-1 rounded-lg py-2 text-sm"
                    style={{ background: "#25D366", color: "#FFFFFF", fontWeight: 600, textDecoration: "none" }}
                  >
                    <MessageCircle size={14} /> Contact on WhatsApp
                  </a>
                ) : (
                  <button
                    disabled
                    className="mt-3 w-full flex items-center justify-center gap-1 rounded-lg py-2 text-sm"
                    style={{ background: "var(--line)", color: "var(--cream-dim)", fontWeight: 600, cursor: "not-allowed" }}
                  >
                    <MessageCircle size={14} /> No WhatsApp number on file
                  </button>
                )}
                <p className="nudge mt-2 rounded px-2 py-1.5 text-[11px] flex items-start gap-1.5">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                  Never send full payment before you've confirmed order details directly with the seller.
                </p>
                {openReviews === reviewKey && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
                    {approvedReviewsFor("listing", l.id).length === 0 ? (
                      <p className="text-xs" style={{ color: "var(--cream-dim)" }}>No reviews yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2 mb-2">
                        {approvedReviewsFor("listing", l.id).map((r) => (
                          <div key={r.id} className="text-xs">
                            <span className="mono" style={{ color: "var(--gold)" }}>{renderStars(r.rating)}</span>{" "}
                            <span style={{ fontWeight: 600 }}>{r.reviewer}</span>
                            {r.text && <span style={{ color: "var(--cream-dim)" }}> — {r.text}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {reviewSubmitted[reviewKey] ? (
                      <p className="text-xs" style={{ color: "var(--leaf-dark)" }}>Thanks for the review!</p>
                    ) : reviewFormOpen === reviewKey ? (
                      <form onSubmit={(e) => addReview("listing", l.id, e)} className="flex flex-col gap-1.5 mt-1">
                        <input name="reviewer" required placeholder="Your name" className="rounded px-2 py-1.5 text-xs" />
                        <select name="rating" defaultValue="5" className="rounded px-2 py-1.5 text-xs" style={{ background: "#FFFFFF", border: "1px solid var(--line)", color: "var(--cream)" }}>
                          <option value="5">★★★★★ (5)</option>
                          <option value="4">★★★★☆ (4)</option>
                          <option value="3">★★★☆☆ (3)</option>
                          <option value="2">★★☆☆☆ (2)</option>
                          <option value="1">★☆☆☆☆ (1)</option>
                        </select>
                        <textarea name="text" maxLength={BLURB_MAX} placeholder="What was your experience? (optional)" rows={2} className="rounded px-2 py-1.5 text-xs" />
                        {reviewError[reviewKey] && <p className="text-xs" style={{ color: "var(--clay)" }}>{reviewError[reviewKey]}</p>}
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => setReviewFormOpen(null)} className="pill rounded-full px-3 py-1 text-xs">Cancel</button>
                          <button type="submit" className="btn-primary rounded-full px-3 py-1 text-xs">Submit review</button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReviewFormOpen(reviewKey)}
                        className="mono text-xs px-3 py-1 rounded-full pill"
                      >
                        Leave a review
                      </button>
                    )}
                  </div>
                )}
                </div>
              </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm col-span-2" style={{ color: "var(--cream-dim)" }}>No listings match yet — be the first to add one.</p>
            )}
          </div>
        </div>
      )}

      {/* FORUM */}
      {tab === "forum" && (
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              {FORUM_CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForumFilter(c)}
                  className={`px-3 py-1.5 rounded-full text-xs mono ${forumFilter === c ? "pill-active" : "pill"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button onClick={() => setShowNewThread(!showNewThread)} className="btn-primary rounded-lg px-4 py-2 text-sm flex items-center gap-1">
              <Plus size={16} /> New question
            </button>
          </div>

          {showNewThread && (
            <form onSubmit={addThread} className="card rounded-lg p-4 mb-6 flex flex-col gap-3">
              <select name="category" className="rounded px-3 py-2 text-sm" style={{ background: "#FFFFFF", border: "1px solid var(--line)", color: "var(--cream)" }}>
                {FORUM_CATS.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
              </select>
              <input name="title" required placeholder="What do you want to ask the market?" className="rounded px-3 py-2 text-sm" />
              <p className="nudge rounded px-2 py-1.5 text-[11px] flex items-start gap-1.5">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                Please don't post phone numbers or contact details here — replies will help connect you directly.
              </p>
              {threadError && <p className="text-xs" style={{ color: "var(--clay)" }}>{threadError}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowNewThread(false)} className="pill rounded-lg px-4 py-2 text-sm">Cancel</button>
                <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm">Post</button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-3">
            {filteredThreads.map((t) => (
              <div key={t.id} className="card rounded-lg p-4">
                <button className="w-full text-left flex items-start justify-between gap-3" onClick={() => setOpenThread(openThread === t.id ? null : t.id)}>
                  <div>
                    <span className="mono text-[10px] px-2 py-0.5 rounded-full tag-baker">{t.category}</span>
                    {t.status === "pending" && (
                      <span className="mono text-[10px] px-2 py-0.5 rounded-full ml-1" style={{ background: "rgba(0,0,0,0.06)", color: "var(--cream-dim)", border: "1px solid var(--line)" }}>
                        pending review
                      </span>
                    )}
                    <h3 className="mt-2 text-sm" style={{ fontWeight: 600 }}>{t.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 mono text-xs whitespace-nowrap" style={{ color: "var(--cream-dim)" }}>
                    {formatDate(t.postedOn)} · {t.replies.length} replies <ArrowUpRight size={12} />
                  </div>
                </button>
                {openThread === t.id && (
                  <div className="mt-3 pt-3 flex flex-col gap-2" style={{ borderTop: "1px solid var(--line)" }}>
                    {t.replies.length === 0 && <p className="text-xs" style={{ color: "var(--cream-dim)" }}>No replies yet — be the first to answer.</p>}
                    {t.replies.map((r, i) => (
                      <div key={i} className="text-sm">
                        <span className="mono text-xs" style={{ color: "var(--gold)" }}>{r.author}: </span>
                        <span style={{ color: "var(--cream-dim)" }}>{r.text}</span>
                      </div>
                    ))}
                    <form onSubmit={(e) => addReply(t.id, e)} className="flex flex-col gap-1.5 mt-1">
                      <input name="author" required placeholder="Your name" className="rounded px-2 py-1.5 text-xs" />
                      <textarea name="text" required maxLength={BLURB_MAX} placeholder="Write a reply..." rows={2} className="rounded px-2 py-1.5 text-xs" />
                      {replyError[t.id] && <p className="text-xs" style={{ color: "var(--clay)" }}>{replyError[t.id]}</p>}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {subscribedThreads.has(t.id) ? (
                          <span className="mono text-xs flex items-center gap-1" style={{ color: "var(--leaf-dark)" }}>
                            <BellRing size={12} /> You'll be notified of replies
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => subscribeToThread(t.id)}
                            disabled={subscribingThread === t.id}
                            className="mono text-xs px-3 py-1 rounded-full pill flex items-center gap-1"
                            style={subscribingThread === t.id ? { opacity: 0.6, cursor: "wait" } : {}}
                          >
                            <Bell size={12} /> {subscribingThread === t.id ? "Turning on…" : "Notify me about replies"}
                          </button>
                        )}
                        <button type="submit" className="btn-primary rounded-full px-3 py-1 text-xs">Reply</button>
                      </div>
                      {subscribeError[t.id] && <p className="text-xs" style={{ color: "var(--clay)" }}>{subscribeError[t.id]}</p>}
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USED TOOLS MARKETPLACE */}
      {tab === "tools" && (
        <div className="max-w-4xl mx-auto px-6 py-6">
          {toolPhotoNote && (
            <p className="nudge rounded px-3 py-2 text-xs mb-4 flex items-start gap-1.5">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" /> {toolPhotoNote}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1 px-3 rounded-lg" style={{ border: "1px solid var(--line)" }}>
              <Search size={16} style={{ color: "var(--cream-dim)" }} />
              <input
                value={toolQuery}
                onChange={(e) => setToolQuery(e.target.value)}
                placeholder="Search tools by name, location..."
                className="w-full py-2 bg-transparent outline-none text-sm"
                style={{ border: "none" }}
              />
            </div>
            <button
              onClick={() => setShowFavoritesOnlyTools(!showFavoritesOnlyTools)}
              className={`px-3 py-2 rounded-lg text-sm mono flex items-center gap-1 shrink-0 ${showFavoritesOnlyTools ? "pill-active" : "pill"}`}
            >
              <Heart size={14} fill={showFavoritesOnlyTools ? "#fff" : "none"} /> Saved
            </button>
            <button
              onClick={() => setShowAddTool(!showAddTool)}
              className="btn-primary rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-1"
            >
              <Plus size={16} /> Sell a tool
            </button>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {TOOL_CATS.map((c) => (
              <button
                key={c}
                onClick={() => setToolFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs mono ${toolFilter === c ? "pill-active" : "pill"}`}
              >
                {c}
              </button>
            ))}
          </div>

          {showAddTool && (
            <form onSubmit={addTool} className="card rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input name="title" required placeholder="What are you selling?" className="rounded px-3 py-2 text-sm sm:col-span-2" />
              <select name="category" className="rounded px-3 py-2 text-sm" style={{ background: "#FFFFFF", border: "1px solid var(--line)", color: "var(--cream)" }}>
                {TOOL_CATS.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
              </select>
              <input name="price" required placeholder="Price (e.g. GH₵350)" className="rounded px-3 py-2 text-sm" />
              <input name="location" required placeholder="Area / city" className="rounded px-3 py-2 text-sm" />
              <input name="seller" required placeholder="Your name" className="rounded px-3 py-2 text-sm" />
              <input name="whatsapp" required placeholder="WhatsApp number, e.g. 233241234567" className="rounded px-3 py-2 text-sm" />
              <input name="pin" required minLength={4} maxLength={6} inputMode="numeric" placeholder="Set a 4-digit PIN (to edit this later)" className="rounded px-3 py-2 text-sm" />
              <p className="text-xs sm:col-span-2 -mt-1" style={{ color: "var(--cream-dim)" }}>Remember this PIN — you'll need it to edit your listing later. It's private, not shown to anyone else.</p>
              <p className="text-xs sm:col-span-2 -mt-2" style={{ color: "var(--cream-dim)" }}>Include your country code, no spaces or dashes (Ghana: 233...)</p>
              <textarea name="description" required maxLength={BLURB_MAX} placeholder="Condition, age, why you're selling..." className="rounded px-3 py-2 text-sm sm:col-span-2" rows={2} />
              <p className="text-xs sm:col-span-2 -mt-1" style={{ color: "var(--cream-dim)" }}>Keep it short — {BLURB_MAX} characters max, so it fits nicely on your card.</p>
              <textarea name="faq" maxLength={BLURB_MAX} placeholder="FAQ / anything buyers usually ask (optional)" className="rounded px-3 py-2 text-sm sm:col-span-2" rows={2} />
              <div className="sm:col-span-2">
                <label className="text-xs block mb-1" style={{ color: "var(--cream-dim)" }}>Photos (up to 4)</label>
                <input
                  type="file"
                  name="photos"
                  accept="image/*"
                  multiple
                  onChange={(e) => setToolPhotoPreview(Array.from(e.target.files).slice(0, 4).map((f) => URL.createObjectURL(f)))}
                  className="text-xs w-full rounded px-3 py-2"
                  style={{ background: "#FFFFFF", border: "1px solid var(--line)", color: "var(--cream)" }}
                />
                {toolPhotoPreview.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {toolPhotoPreview.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-14 h-14 object-cover rounded" style={{ border: "1px solid var(--line)" }} />
                    ))}
                  </div>
                )}
              </div>
              <p className="nudge sm:col-span-2 rounded px-2 py-1.5 text-[11px] flex items-start gap-1.5">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                Buyers contact you directly on WhatsApp — arrange payment and pickup safely, ideally in person.
              </p>
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowAddTool(false); setToolPhotoPreview([]); }} className="pill rounded-lg px-4 py-2 text-sm flex items-center gap-1">
                  <X size={14} /> Cancel
                </button>
                <button type="submit" disabled={submittingTool} className="btn-primary rounded-lg px-4 py-2 text-sm" style={submittingTool ? { opacity: 0.6, cursor: "wait" } : {}}>
                  {submittingTool ? "Uploading photos…" : "List item"}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {filteredTools.map((t) => {
              const favKey = `tool-${t.id}`;
              const rating = ratingSummary("tool", t.id);
              const reviewKey = `tool-${t.id}`;
              return (
              <div key={t.id} className="card rounded-lg overflow-hidden relative">
                {t.photos && t.photos.length > 0 ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => openLightbox(t.photos, 0, t.title)}
                      className="block w-full"
                      style={{ padding: 0, border: "none", background: "none", cursor: "pointer" }}
                    >
                      <img src={t.photos[0]} alt={t.title} className="w-full h-32 sm:h-40 object-cover" />
                    </button>
                    {t.photos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => openLightbox(t.photos, 0, t.title)}
                        className="mono text-[10px] px-1.5 py-0.5 rounded absolute bottom-2 right-2"
                        style={{ background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", cursor: "pointer" }}
                      >
                        +{t.photos.length - 1} more
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-32 sm:h-40 flex items-center justify-center" style={{ background: "var(--line)", opacity: 0.35 }}>
                    <Wrench size={28} style={{ color: "var(--cream-dim)" }} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleFavorite("tool", t.id)}
                  title={favorites.has(favKey) ? "Remove from saved" : "Save"}
                  className="absolute top-2 left-2 flex items-center justify-center rounded-full"
                  style={{ width: 26, height: 26, background: "rgba(0,0,0,0.45)", border: "none", cursor: "pointer", zIndex: 2 }}
                >
                  <Heart size={13} fill={favorites.has(favKey) ? "#D2402A" : "none"} color={favorites.has(favKey) ? "#D2402A" : "#fff"} />
                </button>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="display text-base" style={{ fontWeight: 600 }}>{t.title}</h3>
                      {t.status === "pending" && (
                        <span className="mono text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap" style={{ background: "rgba(0,0,0,0.06)", color: "var(--cream-dim)", border: "1px solid var(--line)" }}>
                          pending review
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => reportTool(t.id)}
                      disabled={reportedTools[t.id]}
                      title="Report this listing"
                      className="report-btn shrink-0"
                    >
                      <Flag size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs flex-wrap" style={{ color: "var(--cream-dim)" }}>
                    <Tag size={11} /> {t.category}
                    <span className="mono">· {formatDate(t.postedOn)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: "var(--cream-dim)" }}>
                    <MapPin size={12} /> {t.location} · sold by {t.seller}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenReviews(openReviews === reviewKey ? null : reviewKey)}
                    className="flex items-center gap-1 mt-1 text-xs"
                    style={{ color: rating ? "var(--gold)" : "var(--cream-dim)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    {rating ? (
                      <><span className="mono">{renderStars(rating.avg)}</span> {rating.avg.toFixed(1)} ({rating.count})</>
                    ) : (
                      <span className="mono">No reviews yet</span>
                    )}
                  </button>
                  <p
                    className="text-sm mt-2"
                    style={{
                      color: "var(--cream-dim)",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {t.description}
                  </p>
                  {t.faq && (
                    <p className="text-xs mt-2 flex items-start gap-1" style={{ color: "var(--cream-dim)" }}>
                      <HelpCircle size={12} className="shrink-0 mt-0.5" /> {t.faq}
                    </p>
                  )}
                  <div className="mt-3">
                    <span className="mono text-base" style={{ color: "var(--gold)", fontWeight: 700 }}>{t.price}</span>
                  </div>
                  {reportedTools[t.id] && (
                    <p className="mt-2 text-xs flex items-center gap-1" style={{ color: "var(--clay)" }}>
                      <Flag size={11} /> Reported — thanks, we'll take a look.
                    </p>
                  )}
                  {waLink(t.whatsapp, t.title) ? (
                    <a
                      href={waLink(t.whatsapp, t.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackContactClick("tool", t.id)}
                      className="mt-3 w-full flex items-center justify-center gap-1 rounded-lg py-2 text-sm"
                      style={{ background: "#25D366", color: "#FFFFFF", fontWeight: 600, textDecoration: "none" }}
                    >
                      <MessageCircle size={14} /> Contact on WhatsApp
                    </a>
                  ) : (
                    <button
                      disabled
                      className="mt-3 w-full flex items-center justify-center gap-1 rounded-lg py-2 text-sm"
                      style={{ background: "var(--line)", color: "var(--cream-dim)", fontWeight: 600, cursor: "not-allowed" }}
                    >
                      <MessageCircle size={14} /> No WhatsApp number on file
                    </button>
                  )}
                  {openReviews === reviewKey && (
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
                      {approvedReviewsFor("tool", t.id).length === 0 ? (
                        <p className="text-xs" style={{ color: "var(--cream-dim)" }}>No reviews yet.</p>
                      ) : (
                        <div className="flex flex-col gap-2 mb-2">
                          {approvedReviewsFor("tool", t.id).map((r) => (
                            <div key={r.id} className="text-xs">
                              <span className="mono" style={{ color: "var(--gold)" }}>{renderStars(r.rating)}</span>{" "}
                              <span style={{ fontWeight: 600 }}>{r.reviewer}</span>
                              {r.text && <span style={{ color: "var(--cream-dim)" }}> — {r.text}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      {reviewSubmitted[reviewKey] ? (
                        <p className="text-xs" style={{ color: "var(--leaf-dark)" }}>Thanks for the review!</p>
                      ) : reviewFormOpen === reviewKey ? (
                        <form onSubmit={(e) => addReview("tool", t.id, e)} className="flex flex-col gap-1.5 mt-1">
                          <input name="reviewer" required placeholder="Your name" className="rounded px-2 py-1.5 text-xs" />
                          <select name="rating" defaultValue="5" className="rounded px-2 py-1.5 text-xs" style={{ background: "#FFFFFF", border: "1px solid var(--line)", color: "var(--cream)" }}>
                            <option value="5">★★★★★ (5)</option>
                            <option value="4">★★★★☆ (4)</option>
                            <option value="3">★★★☆☆ (3)</option>
                            <option value="2">★★☆☆☆ (2)</option>
                            <option value="1">★☆☆☆☆ (1)</option>
                          </select>
                          <textarea name="text" maxLength={BLURB_MAX} placeholder="What was your experience? (optional)" rows={2} className="rounded px-2 py-1.5 text-xs" />
                          {reviewError[reviewKey] && <p className="text-xs" style={{ color: "var(--clay)" }}>{reviewError[reviewKey]}</p>}
                          <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setReviewFormOpen(null)} className="pill rounded-full px-3 py-1 text-xs">Cancel</button>
                            <button type="submit" className="btn-primary rounded-full px-3 py-1 text-xs">Submit review</button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReviewFormOpen(reviewKey)}
                          className="mono text-xs px-3 py-1 rounded-full pill"
                        >
                          Leave a review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
            {filteredTools.length === 0 && (
              <p className="text-sm col-span-2" style={{ color: "var(--cream-dim)" }}>No tools listed yet — be the first to sell something.</p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 pb-8 pt-4 text-center">
        <p className="mono text-xs" style={{ color: "var(--cream-dim)" }}>
          Phase 1 prototype — click-to-WhatsApp only, no payments yet.
        </p>
        <p className="display text-sm mt-2" style={{ color: "var(--clay)", fontWeight: 600 }}>
          A Cake Vocation Community Initiative
        </p>
      </div>

      {manageOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", zIndex: 50 }}
          onClick={closeManage}
        >
          <div
            className="card rounded-lg p-5 w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="display text-lg" style={{ fontWeight: 600 }}>Manage my listing</h3>
              <button onClick={closeManage}><X size={18} /></button>
            </div>

            {manageStep === "lookup" && (
              <form onSubmit={lookupMyListings}>
                <p className="text-sm mb-3" style={{ color: "var(--cream-dim)" }}>
                  Enter your WhatsApp number, or the business/item name you posted under, and we'll pull up your listings so you can edit them.
                </p>
                <input
                  value={manageWhatsapp}
                  onChange={(e) => setManageWhatsapp(e.target.value)}
                  placeholder="WhatsApp number or business name"
                  className="rounded px-3 py-2 text-sm w-full mb-2"
                />
                {manageError && <p className="text-xs mb-2" style={{ color: "var(--clay)" }}>{manageError}</p>}
                <button type="submit" disabled={manageLoading} className="btn-primary rounded-lg px-4 py-2 text-sm w-full">
                  {manageLoading ? "Looking up…" : "Find my listings"}
                </button>
              </form>
            )}

            {manageStep === "results" && (
              <div>
                {manageResults.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--cream-dim)" }}>
                    No listings or tools found with that WhatsApp number or name. Double check what you entered.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {manageResults.map((item) => (
                      <button
                        key={`${item.kind}-${item.id}`}
                        onClick={() => startEditItem(item)}
                        className="pill rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between gap-2"
                      >
                        <span>
                          {item.kind === "listing" ? item.name : item.title}
                          {item.status === "pending" && (
                            <span className="mono text-[10px] ml-2" style={{ color: "var(--cream-dim)" }}>(pending review)</span>
                          )}
                        </span>
                        <span className="mono text-xs" style={{ color: "var(--cream-dim)" }}>Edit →</span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setManageStep("lookup")}
                  className="mono text-xs mt-3 flex items-center gap-1"
                  style={{ color: "var(--cream-dim)" }}
                >
                  ← Try a different number
                </button>
              </div>
            )}

            {manageStep === "pin" && editingItem && (
              <form onSubmit={confirmPin}>
                <p className="text-sm mb-3" style={{ color: "var(--cream-dim)" }}>
                  Enter the PIN you set when you posted <strong>{editingItem.kind === "listing" ? editingItem.name : editingItem.title}</strong> to edit it.
                </p>
                <input
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Your PIN"
                  inputMode="numeric"
                  className="rounded px-3 py-2 text-sm w-full mb-2"
                />
                {pinError && <p className="text-xs mb-2" style={{ color: "var(--clay)" }}>{pinError}</p>}
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setManageStep("results")} className="pill rounded-lg px-4 py-2 text-sm">Back</button>
                  <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm">Confirm PIN</button>
                </div>
              </form>
            )}

            {manageStep === "edit" && editingItem && (
              <form onSubmit={saveEditedItem} className="flex flex-col gap-2">
                {editingItem.kind === "listing" ? (
                  <>
                    <input name="name" required defaultValue={editingItem.name} placeholder="Stall / business name" className="rounded px-3 py-2 text-sm" />
                    <select name="type" defaultValue={editingItem.type} className="rounded px-3 py-2 text-sm" style={{ background: "#FFFFFF", border: "1px solid var(--line)", color: "var(--cream)" }}>
                      <option value="baker">Baker</option>
                      <option value="caterer">Caterer</option>
                      <option value="supplier">Supplier</option>
                    </select>
                    <input name="area" required defaultValue={editingItem.area} placeholder="Area / city" className="rounded px-3 py-2 text-sm" />
                    <input name="price" required defaultValue={editingItem.price} placeholder="Price range" className="rounded px-3 py-2 text-sm" />
                    <input name="whatsapp" required defaultValue={editingItem.whatsapp} placeholder="WhatsApp number, e.g. 233241234567" className="rounded px-3 py-2 text-sm" />
                    <textarea name="blurb" required maxLength={BLURB_MAX} defaultValue={editingItem.blurb} placeholder="Short description" rows={2} className="rounded px-3 py-2 text-sm" />
                    <p className="text-xs -mt-1" style={{ color: "var(--cream-dim)" }}>{BLURB_MAX} characters max.</p>
                    <textarea name="faq" maxLength={BLURB_MAX} defaultValue={editingItem.faq || ""} placeholder="FAQ / anything buyers usually ask (optional)" rows={2} className="rounded px-3 py-2 text-sm" />
                  </>
                ) : (
                  <>
                    <input name="title" required defaultValue={editingItem.title} placeholder="What are you selling?" className="rounded px-3 py-2 text-sm" />
                    <input name="price" required defaultValue={editingItem.price} placeholder="Price" className="rounded px-3 py-2 text-sm" />
                    <input name="location" required defaultValue={editingItem.location} placeholder="Area / city" className="rounded px-3 py-2 text-sm" />
                    <input name="whatsapp" required defaultValue={editingItem.whatsapp} placeholder="WhatsApp number, e.g. 233241234567" className="rounded px-3 py-2 text-sm" />
                    <select name="category" defaultValue={editingItem.category} className="rounded px-3 py-2 text-sm" style={{ background: "#FFFFFF", border: "1px solid var(--line)", color: "var(--cream)" }}>
                      {TOOL_CATS.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <textarea name="description" required maxLength={BLURB_MAX} defaultValue={editingItem.description} placeholder="Condition, age, why you're selling..." rows={2} className="rounded px-3 py-2 text-sm" />
                    <p className="text-xs -mt-1" style={{ color: "var(--cream-dim)" }}>{BLURB_MAX} characters max.</p>
                    <textarea name="faq" maxLength={BLURB_MAX} defaultValue={editingItem.faq || ""} placeholder="FAQ / anything buyers usually ask (optional)" rows={2} className="rounded px-3 py-2 text-sm" />
                  </>
                )}
                <p className="text-xs mono" style={{ color: "var(--cream-dim)" }}>
                  {(() => {
                    const clicks = editingItem.contact_click_count ?? editingItem.contactClickCount ?? 0;
                    return `${clicks} WhatsApp contact click${clicks === 1 ? "" : "s"} so far`;
                  })()}
                </p>
                <div>
                  <label className="text-xs block mb-1" style={{ color: "var(--cream-dim)" }}>Photos (up to 4)</label>
                  {editKeepPhotos.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-2">
                      {editKeepPhotos.map((url, i) => (
                        <div key={url + i} className="relative">
                          <img src={url} alt="" className="w-14 h-14 object-cover rounded" style={{ border: "1px solid var(--line)" }} />
                          <button
                            type="button"
                            onClick={() => setEditKeepPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                            title="Remove photo"
                            className="absolute flex items-center justify-center rounded-full"
                            style={{ top: -6, right: -6, width: 18, height: 18, background: "var(--clay)", color: "#fff", border: "none", cursor: "pointer" }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {editKeepPhotos.length + editNewPhotoPreviews.length < 4 && (
                    <input
                      type="file"
                      name="newPhotos"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const slotsLeft = 4 - editKeepPhotos.length;
                        setEditNewPhotoPreviews(Array.from(e.target.files).slice(0, slotsLeft).map((file) => URL.createObjectURL(file)));
                      }}
                      className="text-xs w-full rounded px-3 py-2"
                      style={{ background: "#FFFFFF", border: "1px solid var(--line)", color: "var(--cream)" }}
                    />
                  )}
                  {editNewPhotoPreviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {editNewPhotoPreviews.map((src, i) => (
                        <img key={i} src={src} alt="" className="w-14 h-14 object-cover rounded" style={{ border: "1px solid var(--line)" }} />
                      ))}
                    </div>
                  )}
                  {editPhotoNote && (
                    <p className="text-xs mt-1" style={{ color: "var(--clay)" }}>{editPhotoNote}</p>
                  )}
                </div>
                {!editingItem.edit_pin && (
                  <>
                    <input name="newPin" required minLength={4} maxLength={6} inputMode="numeric" placeholder="Set a 4-digit PIN (required to protect this listing)" className="rounded px-3 py-2 text-sm" />
                    <p className="text-xs -mt-1" style={{ color: "var(--cream-dim)" }}>
                      This listing was posted before PINs existed — set one now so only you can edit it from here on.
                    </p>
                  </>
                )}
                {manageError && <p className="text-xs" style={{ color: "var(--clay)" }}>{manageError}</p>}
                {manageSaved && <p className="text-xs" style={{ color: "var(--leaf-dark)" }}>Saved!</p>}
                <div className="flex gap-2 justify-end mt-1">
                  <button type="button" onClick={() => setManageStep("results")} className="pill rounded-lg px-4 py-2 text-sm">Back</button>
                  <button type="submit" disabled={manageLoading} className="btn-primary rounded-lg px-4 py-2 text-sm">
                    {manageLoading ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", zIndex: 60 }}
          onClick={closeLightbox}
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
        >
          <button
            onClick={closeLightbox}
            className="fixed top-4 right-4"
            style={{ color: "#fff", background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={28} />
          </button>

          <div className="relative max-w-2xl w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {lightbox.photos.length > 1 && (
              <button
                onClick={lightboxPrev}
                className="absolute left-2 sm:-left-14 top-1/2 flex items-center justify-center"
                style={{ color: "#fff", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "9999px", width: 44, height: 44, cursor: "pointer", transform: "translateY(-50%)", fontSize: 24, zIndex: 61 }}
              >
                ‹
              </button>
            )}
            <div className="flex flex-col items-center gap-2 w-full">
              <img
                src={lightbox.photos[lightbox.index]}
                alt={lightbox.title}
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
              />
              <div className="flex items-center gap-2">
                <span className="mono text-xs" style={{ color: "#fff" }}>
                  {lightbox.title} — {lightbox.index + 1} / {lightbox.photos.length}
                </span>
              </div>
            </div>
            {lightbox.photos.length > 1 && (
              <button
                onClick={lightboxNext}
                className="absolute right-2 sm:-right-14 top-1/2 flex items-center justify-center"
                style={{ color: "#fff", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "9999px", width: 44, height: 44, cursor: "pointer", transform: "translateY(-50%)", fontSize: 24, zIndex: 61 }}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
