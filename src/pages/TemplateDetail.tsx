import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ExternalLink, Check, Sparkles, ShoppingCart,
  X, MessageCircle, AlertCircle,
} from "lucide-react";
import SEO from "@/components/SEO";
import {
  findTemplateBySlug, addons, addonsByCategory, formatGHS,
  ORDER_WHATSAPP, type Addon, type AddonCategory,
} from "@/data/templatesData";

const TemplateDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const tpl = slug ? findTemplateBySlug(slug) : undefined;

  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set());
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", email: "", brief: "" });
  const [orderConfirmation, setOrderConfirmation] = useState<{ orderId: string; total: number } | null>(null);

  const selectedAddons = useMemo<Addon[]>(
    () => addons.filter((a) => selectedAddonIds.has(a.id)),
    [selectedAddonIds]
  );

  const addonsTotal = useMemo(
    () => selectedAddons.reduce((sum, a) => sum + a.price, 0),
    [selectedAddons]
  );

  const grandTotal = (tpl?.basePrice ?? 0) + addonsTotal;

  // ── 404 ─────────────────────────────────────────────────────────────
  if (!tpl) {
    return (
      <Layout>
        <section className="pt-32 pb-20 min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Template not found</h1>
            <p className="text-gray-600 mb-8">This template doesn&apos;t exist yet — check the templates page.</p>
            <Button asChild>
              <Link to="/templates"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Templates</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const tierColor =
    tpl.tier === "Starter"  ? "emerald" :
    tpl.tier === "Classic"  ? "sky"     :
    tpl.tier === "Prestige" ? "amber"   : "purple";

  // ── Handlers ────────────────────────────────────────────────────────
  const toggleAddon = (id: string) => {
    setSelectedAddonIds((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.phone) return;

    // Generate a simple client-side order ID
    const orderId = `VLE-${Date.now().toString(36).toUpperCase()}`;
    setOrderConfirmation({ orderId, total: grandTotal });

    // Build the WhatsApp message that the admin will receive
    const addonLines = selectedAddons.map((a) => `  • ${a.name} — ${formatGHS(a.price)}`).join("\n");
    const msg = [
      `🕊️ *NEW ORDER — ${orderId}*`,
      ``,
      `*Template:* ${tpl.name} (${tpl.tier})`,
      `*Base price:* ${formatGHS(tpl.basePrice)}`,
      ``,
      `*Addons (${selectedAddons.length}):*`,
      selectedAddons.length === 0 ? "  (none)" : addonLines,
      ``,
      `*Total: ${formatGHS(grandTotal)}*`,
      ``,
      `━━━━━━━━━━━━━━━━━━`,
      `*Customer:*`,
      `Name: ${orderForm.name}`,
      `Phone: ${orderForm.phone}`,
      orderForm.email ? `Email: ${orderForm.email}` : "",
      ``,
      `*Brief about the deceased / event:*`,
      orderForm.brief || "(none provided)",
      ``,
      `━━━━━━━━━━━━━━━━━━`,
      `_Sent from vibelinkevent.com/templates_`,
    ].filter(Boolean).join("\n");

    // Open WhatsApp to the admin number with the message prefilled
    const waUrl = `https://wa.me/${ORDER_WHATSAPP.replace(/[^\d]/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const closeAndReset = () => {
    setShowOrderModal(false);
    setOrderConfirmation(null);
    setOrderForm({ name: "", phone: "", email: "", brief: "" });
  };

  // ── Render ──────────────────────────────────────────────────────────
  const grouped = addonsByCategory();

  return (
    <Layout>
      <SEO
        title={`${tpl.name} — ${formatGHS(tpl.basePrice)} | VibeLink Templates`}
        description={`${tpl.tagline}. ${tpl.tier} tier · from ${formatGHS(tpl.basePrice)}. Customise and order.`}
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="pt-24 lg:pt-32 pb-12 text-white relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${tpl.palette[0]} 0%, ${tpl.palette[1] || tpl.palette[0]} 100%)`,
        }}
      >
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to all templates
          </Link>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${tierColor}-100/95 text-${tierColor}-800 text-xs font-semibold mb-4`}>
                <Sparkles className="h-3 w-3" />
                {tpl.tier} Vibe · from {formatGHS(tpl.basePrice)}
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold mb-3 leading-tight">{tpl.name}</h1>
              <p className="text-lg text-white/85 mb-6 leading-relaxed">{tpl.tagline}</p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={tpl.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" /> Open live preview
                </a>
                <span className="text-sm text-white/70">in a new tab</span>
              </div>
            </div>

            {/* Live thumbnail tile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20"
              style={{
                background: `linear-gradient(135deg, ${tpl.palette[1] || tpl.palette[0]}, ${tpl.palette[3] || tpl.palette[2] || tpl.palette[0]})`,
                aspectRatio: "16/10",
                backgroundImage: `linear-gradient(180deg, transparent 40%, rgba(0,0,0,.65)), url(${tpl.thumbnail})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── MAIN: CONFIGURATOR + STORY ───────────────────────────── */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* LEFT: details */}
            <div className="lg:col-span-2 space-y-8">

              {/* Concept */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">The concept</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{tpl.conceptStory}</p>
                <div className="text-sm text-gray-500">
                  <strong className="text-gray-700">Best for:</strong> {tpl.bestFor}
                </div>
              </div>

              {/* Built-in features */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-1">What this template includes</h2>
                <p className="text-sm text-gray-500 mb-4">Unique to {tpl.name}:</p>
                <ul className="grid sm:grid-cols-2 gap-y-2 gap-x-4 mb-6">
                  {tpl.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className={`h-4 w-4 text-${tierColor}-600 mt-0.5 flex-shrink-0`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Plus everything from the {tpl.tier} Vibe package:
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-y-1.5 gap-x-4 text-sm text-gray-600">
                    {tpl.baseFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span><span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ADDONS */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="text-xl font-bold text-gray-900">Optional addons</h2>
                  <span className="text-sm text-gray-500">{addons.length} available</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Toggle anything you want on top of the {tpl.tier} package. Total updates instantly.
                </p>

                {(Object.keys(grouped) as AddonCategory[]).map((cat) => (
                  <div key={cat} className="mb-6 last:mb-0">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
                      {cat}
                    </h3>
                    <div className="space-y-2">
                      {grouped[cat].map((a) => {
                        const selected = selectedAddonIds.has(a.id);
                        return (
                          <label
                            key={a.id}
                            className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                              selected
                                ? "bg-purple-50 border-purple-300 ring-1 ring-purple-200"
                                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleAddon(a.id)}
                              className="mt-1 h-4 w-4 rounded text-[#6B46C1] focus:ring-[#6B46C1]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-medium text-gray-900 text-sm">{a.name}</span>
                                {a.premium && (
                                  <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">PREMIUM</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{a.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-bold text-gray-900">+{formatGHS(a.price)}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: sticky order summary */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <ShoppingCart className="h-5 w-5 text-[#6B46C1]" />
                  <h3 className="text-lg font-bold text-gray-900">Your order</h3>
                </div>

                {/* Base */}
                <div className="flex justify-between items-baseline mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{tpl.name}</div>
                    <div className="text-xs text-gray-500">{tpl.tier} Vibe — base package</div>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{formatGHS(tpl.basePrice)}</div>
                </div>

                {/* Selected addons */}
                {selectedAddons.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    {selectedAddons.map((a) => (
                      <div key={a.id} className="flex justify-between items-start gap-2">
                        <div className="text-xs text-gray-600 flex-1">+ {a.name}</div>
                        <div className="text-xs font-semibold text-gray-700 flex-shrink-0">
                          {formatGHS(a.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedAddons.length === 0 && (
                  <p className="text-xs text-gray-400 italic mt-3 mb-1">No addons selected.</p>
                )}

                {/* Total */}
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-gray-700">Total</span>
                    <span className="text-2xl font-extrabold text-[#6B46C1]">{formatGHS(grandTotal)}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Includes {formatGHS(addonsTotal)} in {selectedAddons.length} addon{selectedAddons.length === 1 ? "" : "s"}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => setShowOrderModal(true)}
                  className="w-full mt-5 bg-[#6B46C1] hover:bg-[#553C9A] text-white font-semibold py-6 text-base"
                >
                  Proceed to Order
                </Button>

                <p className="text-[11px] text-gray-500 text-center mt-3 leading-relaxed">
                  No payment taken on this site. You&apos;ll be sent to WhatsApp with your order details
                  + MoMo payment instructions.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── ORDER MODAL ──────────────────────────────────────────── */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <button
              onClick={closeAndReset}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>

            {!orderConfirmation ? (
              <>
                <div className="p-6 lg:p-7 border-b border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Your details</h3>
                  <p className="text-sm text-gray-600">
                    Total: <strong className="text-[#6B46C1]">{formatGHS(grandTotal)}</strong> &middot; {tpl.name}
                  </p>
                </div>
                <form onSubmit={handleOrderSubmit} className="p-6 lg:p-7 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Full name *</label>
                    <input
                      type="text"
                      required
                      value={orderForm.name}
                      onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
                      placeholder="e.g. Kwame Boakye"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Phone (with WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={orderForm.phone}
                      onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
                      placeholder="+233 24 XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Email <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                    <input
                      type="email"
                      value={orderForm.email}
                      onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                      Brief about the deceased / event <span className="text-gray-400 normal-case font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={orderForm.brief}
                      onChange={(e) => setOrderForm({ ...orderForm, brief: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent resize-none"
                      placeholder="Name, dates, any specifics. You can also send these on WhatsApp later."
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-900">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>
                      On submit, your order details will open in WhatsApp ready to send to VibeLink.
                      <strong> Hit send.</strong> We&apos;ll reply with MoMo payment details and start your build.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#6B46C1] hover:bg-[#553C9A] text-white font-semibold py-6 text-base"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Open WhatsApp with Order
                  </Button>
                </form>
              </>
            ) : (
              <div className="p-7 lg:p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Order opened in WhatsApp</h3>
                <p className="text-gray-600 mb-1">Your order reference:</p>
                <p className="text-xl font-mono font-bold text-[#6B46C1] mb-6 select-all">{orderConfirmation.orderId}</p>

                <div className="bg-gray-50 rounded-xl p-5 text-left mb-5">
                  <h4 className="font-bold text-gray-900 mb-2 text-sm">Next steps:</h4>
                  <ol className="text-sm text-gray-700 space-y-1.5 list-decimal pl-5">
                    <li>Hit <strong>Send</strong> in WhatsApp to fire off the order.</li>
                    <li>We&apos;ll reply with our MoMo number + payment instructions.</li>
                    <li>Pay <strong>{formatGHS(orderConfirmation.total)}</strong> using reference <strong>{orderConfirmation.orderId}</strong>.</li>
                    <li>Send proof of payment. We start your build within 24 hours.</li>
                  </ol>
                </div>

                <Button onClick={closeAndReset} className="bg-[#6B46C1] hover:bg-[#553C9A]">
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TemplateDetail;
