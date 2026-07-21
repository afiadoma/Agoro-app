'use client';
import { useState, useEffect } from "react";
import { Search, MapPin, MessageCircle, Plus, X, ArrowUpRight, Wheat, ShieldCheck, Flag, AlertTriangle, Wrench, Tag, TrendingUp, Share2 } from "lucide-react";
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
  { id: 1, name: "Ama's Buttercream Bar", type: "baker", area: "East Legon, Accra", price: "GH₵150–800", overflow: true, verified: true, listedOn: "2026-06-02", photos: ["https://picsum.photos/seed/agoro1/400/300"], blurb: "Custom celebration cakes, ribbon icing, fondant work.", status: "approved" },
  { id: 2, name: "Osu Chop House Catering", type: "caterer", area: "Osu, Accra", price: "GH₵40/head+", overflow: false, verified: true, listedOn: "2026-06-04", photos: ["https://picsum.photos/seed/agoro2/400/300"], blurb: "Full-service event catering — jollof, grilled tilapia, chin chin platters.", status: "approved" },
  { id: 3, name: "Kente Cake Box Co.", type: "supplier", area: "Dansoman, Accra", price: "GH₵5–25/box", overflow: false, verified: true, listedOn: "2026-06-10", photos: ["https://picsum.photos/seed/agoro3/400/300"], blurb: "Cake boxes, ribbon, food coloring gel, cake boards.", status: "approved" },
  { id: 4, name: "Nana's Naked Cakes", type: "baker", area: "Tema", price: "GH₵200–600", overflow: true, verified: false, listedOn: "2026-07-01", photos: ["https://picsum.photos/seed/agoro4/400/300"], blurb: "Semi-naked cakes, cupcakes, small-batch orders welcome.", status: "approved" },
  { id: 5, name: "Golden Grain Flour Supply", type: "supplier", area: "Kumasi", price: "Wholesale", overflow: false, verified: true, listedOn: "2026-06-20", photos: [], blurb: "Bulk flour, sugar, cocoa — deliveries across Ashanti region.", status: "approved" },
  { id: 6, name: "Efua's Small Chops", type: "caterer", area: "Dansoman, Accra", price: "GH₵25/head+", overflow: true, verified: false, listedOn: "2026-07-08", photos: ["https://picsum.photos/seed/agoro6/400/300"], blurb: "Spring rolls, samosas, meat pies — takes overflow orders from other vendors.", status: "approved" },
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
  { id: 1, title: "6-Tier Cake Stand (adjustable height)", description: "Barely used, adjustable turntable stand, great for wedding displays.", price: "GH₵350", location: "East Legon, Accra", category: "Decorating Tools", seller: "Ama", postedOn: "2026-07-14", photos: ["https://picsum.photos/seed/tool1/400/300"], status: "approved" },
  { id: 2, title: "KitchenAid Stand Mixer, 5L", description: "Used for 2 years, still strong motor, comes with whisk and dough hook.", price: "GH₵2,200", location: "Tema", category: "Mixers", postedOn: "2026-07-10", seller: "Nana", photos: ["https://picsum.photos/seed/tool2/400/300"], status: "approved" },
  { id: 3, title: "Set of 12 Silicone Cake Pans", description: "Assorted round and square sizes, non-stick, minor wear.", price: "GH₵180", location: "Dansoman, Accra", category: "Pans & Molds", postedOn: "2026-07-08", seller: "Efua", photos: [], status: "approved" },
  { id: 4, title: "Gas Deck Oven (double)", description: "Selling as I'm upgrading — reliable, even bake, buyer arranges pickup.", price: "GH₵4,500", location: "Kumasi", category: "Ovens & Ranges", postedOn: "2026-07-01", seller: "Golden Grain Bakery", photos: ["https://picsum.photos/seed/tool4/400/300"], status: "approved" },
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

export default function StallDirectory() {
  const [tab, setTab] = useState("directory");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState(supabase ? [] : SEED_LISTINGS);
  const [showAdd, setShowAdd] = useState(false);
  const [reported, setReported] = useState({});
  const [loading, setLoading] = useState(!!supabase);
  const [photoPreview, setPhotoPreview] = useState([]);

  const [forumFilter, setForumFilter] = useState("All");
  const [threads, setThreads] = useState(supabase ? [] : SEED_THREADS);
  const [openThread, setOpenThread] = useState(null);
  const [showNewThread, setShowNewThread] = useState(false);

  const [toolFilter, setToolFilter] = useState("All");
  const [toolQuery, setToolQuery] = useState("");
  const [tools, setTools] = useState(supabase ? [] : SEED_TOOLS);
  const [showAddTool, setShowAddTool] = useState(false);
  const [reportedTools, setReportedTools] = useState({});
  const [toolPhotoPreview, setToolPhotoPreview] = useState([]);

  const [prices, setPrices] = useState(supabase ? [] : SEED_PRICES);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [priceIndex, setPriceIndex] = useState(0);
  const [priceSubmitted, setPriceSubmitted] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!supabase) return; // no env vars set yet — running on seed data only
    (async () => {
      const { data: listingRows } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      const { data: threadRows } = await supabase.from("threads").select("*").order("created_at", { ascending: false });
      const { data: replyRows } = await supabase.from("replies").select("*").order("created_at", { ascending: true });
      const { data: toolRows } = await supabase.from("tools").select("*").order("created_at", { ascending: false });
      const { data: priceRows } = await supabase.from("prices").select("*").order("created_at", { ascending: false });

      setListings(
        (listingRows || []).map((l) => ({
          id: l.id, name: l.name, type: l.type, area: l.area, price: l.price,
          overflow: l.overflow, verified: l.verified, listedOn: l.created_at?.slice(0, 10), blurb: l.blurb,
          photos: l.photos || [], status: l.status,
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
          id: t.id, title: t.title, description: t.description, price: t.price, location: t.location,
          category: t.category, seller: t.seller, postedOn: t.created_at?.slice(0, 10), photos: t.photos || [], status: t.status,
        }))
      );
      setPrices(
        (priceRows || []).map((p) => ({
          id: p.id, item: p.item, price: p.price, store: p.store, reporter: p.reporter,
          postedOn: p.created_at?.slice(0, 10), status: p.status,
        }))
      );
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (prices.length < 2) return;
    const timer = setInterval(() => {
      setPriceIndex((i) => (i + 1) % prices.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [prices.length]);

  const filtered = listings.filter(
    (l) =>
      (filter === "All" || l.type === filter) &&
      (l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.area.toLowerCase().includes(query.toLowerCase()) ||
        l.blurb.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredThreads = threads.filter((t) => forumFilter === "All" || t.category === forumFilter);

  const filteredTools = tools.filter(
    (t) =>
      (toolFilter === "All" || t.category === toolFilter) &&
      (t.title.toLowerCase().includes(toolQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(toolQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(toolQuery.toLowerCase()))
  );

  async function addListing(e) {
    e.preventDefault();
    const f = e.target;
    const files = Array.from(f.photos.files).slice(0, 4);
    let photos = [];

    if (supabase && files.length) {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const path = `${Date.now()}-${file.name}`;
          const { error } = await supabase.storage.from("listing-photos").upload(path, file);
          if (error) return null;
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
      overflow: f.overflow.checked,
      verified: true,
      blurb: f.blurb.value,
      photos,
      status: "pending",
    };
    if (supabase) {
      await supabase.from("listings").insert(draft); // no .select() — pending rows aren't readable under RLS until approved
    }
    setListings([{ ...draft, id: Date.now(), listedOn: new Date().toISOString().slice(0, 10) }, ...listings]);
    setShowAdd(false);
    setPhotoPreview([]);
    f.reset();
  }

  async function addThread(e) {
    e.preventDefault();
    const f = e.target;
    const draft = { category: f.category.value, title: f.title.value, status: "pending" };
    if (supabase) {
      await supabase.from("threads").insert(draft); // no .select() — pending rows aren't readable under RLS until approved
    }
    setThreads([{ ...draft, id: Date.now(), postedOn: new Date().toISOString().slice(0, 10), replies: [] }, ...threads]);
    setShowNewThread(false);
    f.reset();
  }

  async function reportListing(id) {
    setReported({ ...reported, [id]: true });
    if (supabase) await supabase.from("reports").insert({ listing_id: id });
  }

  async function addTool(e) {
    e.preventDefault();
    const f = e.target;
    const files = Array.from(f.photos.files).slice(0, 4);
    let photos = [];

    if (supabase && files.length) {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const path = `tools/${Date.now()}-${file.name}`;
          const { error } = await supabase.storage.from("listing-photos").upload(path, file);
          if (error) return null;
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
      photos,
      status: "pending",
    };
    if (supabase) {
      await supabase.from("tools").insert(draft); // no .select() — pending rows aren't readable under RLS until approved
    }
    setTools([{ ...draft, id: Date.now(), postedOn: new Date().toISOString().slice(0, 10) }, ...tools]);
    setShowAddTool(false);
    setToolPhotoPreview([]);
    f.reset();
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
      status: "pending",
    };
    if (supabase) {
      await supabase.from("prices").insert(draft); // pending — won't show in the ticker until approved
    }
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

  return (
    <div className="stall-root" style={{ minHeight: "100%" }}>
      <style>{TOKENS}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" />

      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between max-w-4xl mx-auto flex-wrap gap-2">
          <img src="/agoro-logo.png" alt="Agoro" style={{ height: 168, width: "auto" }} />
          <div className="flex items-center gap-3">
            <span className="mono text-xs" style={{ color: "var(--cream-dim)" }}>400 members · 120 active</span>
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
          Find bakers, caterers and suppliers near you. Ask the market anything.
        </p>
      </div>

      <div className="zigzag" />

      {/* Trending price ticker */}
      <div className="max-w-4xl mx-auto px-6 py-2 flex items-center gap-3 flex-wrap" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
          <TrendingUp size={14} style={{ color: "var(--leaf-dark)", flexShrink: 0 }} />
          {prices.length > 0 ? (
            <span className="mono text-xs truncate" style={{ color: "var(--cream-dim)" }}>
              Trending price: <span style={{ color: "var(--cream)", fontWeight: 600 }}>{prices[priceIndex % prices.length].item}</span>
              {" — "}
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>{prices[priceIndex % prices.length].price}</span>
              {prices[priceIndex % prices.length].store && ` · ${prices[priceIndex % prices.length].store}`}
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
          <p className="text-xs mono mb-3" style={{ color: "var(--leaf-dark)" }}>Thanks! Submitted for review — it'll show in the ticker once approved.</p>
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
              onClick={() => setShowAdd(!showAdd)}
              className="btn-primary rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-1"
            >
              <Plus size={16} /> List your stall
            </button>
          </div>

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
              <textarea name="blurb" required placeholder="Short description" className="rounded px-3 py-2 text-sm sm:col-span-2" rows={2} />
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
                <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm">Add listing</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((l) => (
              <div key={l.id} className="card rounded-lg overflow-hidden relative">
                <div className="pin-corner" style={{ zIndex: 2 }} />
                {l.photos && l.photos.length > 0 ? (
                  <div className="relative">
                    <img src={l.photos[0]} alt={l.name} className="w-full h-36 object-cover" />
                    {l.photos.length > 1 && (
                      <span className="mono text-[10px] px-1.5 py-0.5 rounded absolute bottom-2 right-2" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
                        +{l.photos.length - 1} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-36 flex items-center justify-center" style={{ background: "var(--line)", opacity: 0.35 }}>
                    <Wheat size={28} style={{ color: "var(--cream-dim)" }} />
                  </div>
                )}
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
                <p className="text-sm mt-2" style={{ color: "var(--cream-dim)" }}>{l.blurb}</p>
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
                <button className="mt-3 w-full flex items-center justify-center gap-1 rounded-lg py-2 text-sm" style={{ background: "#25D366", color: "#FFFFFF", fontWeight: 600 }}>
                  <MessageCircle size={14} /> Contact on WhatsApp
                </button>
                <p className="nudge mt-2 rounded px-2 py-1.5 text-[11px] flex items-start gap-1.5">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                  Never send full payment before you've confirmed order details directly with the seller.
                </p>
                </div>
              </div>
            ))}
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
                Please don't post phone numbers or contact details here — replies will help connect you directly. Posts are reviewed before they go live.
              </p>
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
              <textarea name="description" required placeholder="Condition, age, why you're selling..." className="rounded px-3 py-2 text-sm sm:col-span-2" rows={2} />
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
                <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm">List item</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTools.map((t) => (
              <div key={t.id} className="card rounded-lg overflow-hidden relative">
                {t.photos && t.photos.length > 0 ? (
                  <div className="relative">
                    <img src={t.photos[0]} alt={t.title} className="w-full h-36 object-cover" />
                    {t.photos.length > 1 && (
                      <span className="mono text-[10px] px-1.5 py-0.5 rounded absolute bottom-2 right-2" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
                        +{t.photos.length - 1} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-36 flex items-center justify-center" style={{ background: "var(--line)", opacity: 0.35 }}>
                    <Wrench size={28} style={{ color: "var(--cream-dim)" }} />
                  </div>
                )}
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
                  <p className="text-sm mt-2" style={{ color: "var(--cream-dim)" }}>{t.description}</p>
                  <div className="mt-3">
                    <span className="mono text-base" style={{ color: "var(--gold)", fontWeight: 700 }}>{t.price}</span>
                  </div>
                  {reportedTools[t.id] && (
                    <p className="mt-2 text-xs flex items-center gap-1" style={{ color: "var(--clay)" }}>
                      <Flag size={11} /> Reported — thanks, we'll take a look.
                    </p>
                  )}
                  <button className="mt-3 w-full flex items-center justify-center gap-1 rounded-lg py-2 text-sm" style={{ background: "#25D366", color: "#FFFFFF", fontWeight: 600 }}>
                    <MessageCircle size={14} /> Contact on WhatsApp
                  </button>
                </div>
              </div>
            ))}
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
    </div>
  );
}
