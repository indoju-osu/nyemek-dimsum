import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderMethod } from '../../types';
import { calculateCartTotal, isPromotionCurrentlyValid } from '../../utils/cart';
import { formatRupiah, getEffectivePrice } from '../../utils/catalog';
import { validateOrder } from '../../utils/validation';
import { buildWhatsAppUrl, formatWhatsAppMessage } from '../../utils/whatsapp';
import { FoodImage } from '../ui/FoodImage';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  initialPromoCode?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  onClose,
  initialPromoCode = '',
}) => {
  const {
    cart,
    products,
    promotions,
    settings,
    setCartItemQty,
    removeCartItem,
    clearCart,
    createLocalDraftOrder,
    showToast,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [method, setMethod] = useState<OrderMethod>('Delivery');
  const [notes, setNotes] = useState('');
  const [promoInput, setPromoInput] = useState(initialPromoCode);
  const [appliedPromoCode, setAppliedPromoCode] = useState(initialPromoCode);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedOrder, setSubmittedOrder] = useState<{
    order: Order;
    waUrl: string;
    messageText: string;
  } | null>(null);

  React.useEffect(() => {
    if (initialPromoCode) {
      setPromoInput(initialPromoCode);
      setAppliedPromoCode(initialPromoCode);
    }
  }, [initialPromoCode]);

  const activePromos = useMemo(
    () => promotions.filter((p) => isPromotionCurrentlyValid(p)),
    [promotions]
  );

  const selectedPromo = useMemo(() => {
    if (!appliedPromoCode.trim()) return null;
    return (
      promotions.find(
        (p) => p.code.toUpperCase() === appliedPromoCode.trim().toUpperCase()
      ) ?? null
    );
  }, [promotions, appliedPromoCode]);

  const totals = useMemo(
    () => calculateCartTotal(cart, selectedPromo),
    [cart, selectedPromo]
  );

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setAppliedPromoCode('');
      return;
    }
    const found = promotions.find((p) => p.code.toUpperCase() === code);
    if (!found) {
      showToast('Kode promo tidak ditemukan.', 'error');
      return;
    }
    setAppliedPromoCode(found.code);
    showToast(`Kode promo ${found.code} diterapkan.`, 'success');
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Verify stock against latest product catalog
    for (const item of cart) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod || !prod.isActive || prod.stock < item.quantity) {
        showToast(
          `Stok ${item.name} tidak mencukupi (tersedia ${prod?.stock ?? 0}).`,
          'error'
        );
        return;
      }
    }

    const validation = validateOrder({
      customerName,
      customerPhone,
      customerAddress: method === 'Pickup' ? 'Ambil di outlet' : customerAddress,
      method,
      items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
      total: totals.total,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      showToast('Periksa kembali form pemesanan Anda.', 'error');
      return;
    }

    const orderItems = cart.map((item) => {
      const unitPrice = getEffectivePrice({
        price: item.price,
        discountPrice: item.discountPrice,
      });
      return {
        productId: item.productId,
        name: item.name,
        unitPrice,
        quantity: item.quantity,
        lineTotal: unitPrice * item.quantity,
      };
    });

    const newOrder = createLocalDraftOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress:
        method === 'Pickup' ? 'Ambil langsung di outlet' : customerAddress.trim(),
      method,
      notes: notes.trim(),
      items: orderItems,
      subtotal: totals.subtotal,
      discountAmount: totals.discount,
      promoCode: totals.discount > 0 && selectedPromo ? selectedPromo.code : null,
      total: totals.total,
      paymentStatus: 'Menunggu pembayaran',
      orderStatus: 'Menunggu konfirmasi',
      isLocalDraft: true,
    });

    const payload = {
      orderId: newOrder.id,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      customerAddress: newOrder.customerAddress,
      method: newOrder.method,
      notes: newOrder.notes,
      items: orderItems.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      subtotal: newOrder.subtotal,
      discount: newOrder.discountAmount,
      promoCode: newOrder.promoCode,
      total: newOrder.total,
    };

    try {
      const waUrl = buildWhatsAppUrl(settings.whatsappNumber, payload);
      const messageText = formatWhatsAppMessage(payload);
      setSubmittedOrder({ order: newOrder, waUrl, messageText });
      clearCart();
      showToast('Draft pesanan dibuat! Lanjutkan kirim via WhatsApp.', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Gagal membuat tautan WhatsApp.',
        'error'
      );
    }
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Format pesan WhatsApp disalin.', 'success');
    } catch {
      showToast('Tidak dapat menyalin otomatis.', 'error');
    }
  };

  const resetCheckoutView = () => {
    setSubmittedOrder(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang Belanja dan Checkout"
    >
      <div className="w-full max-w-lg bg-[#161616] border-l border-white/10 h-full flex flex-col text-[#FFF4E8]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-[#111111]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#D71920]" aria-hidden="true" />
            <h2 className="font-display text-2xl uppercase tracking-wide">
              Keranjang Belanja
            </h2>
            <span className="font-mono text-xs text-[#FFC247] tabular-nums">
              ({totals.itemCount} item)
            </span>
          </div>
          <button
            type="button"
            onClick={resetCheckoutView}
            className="text-[#A7A7A7] hover:text-[#FFF4E8] p-1.5 rounded-md hover:bg-white/10"
            aria-label="Tutup keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {submittedOrder ? (
            <div className="bg-[#1C1C1C] border border-[#25D366]/40 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display text-2xl uppercase text-[#FFF4E8]">
                    Draft Pesanan Siap Dikirim
                  </h3>
                  <p className="text-xs font-mono text-[#FFC247] mt-1 tabular-nums">
                    ID: {submittedOrder.order.id}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#A7A7A7] leading-relaxed bg-[#111111] border border-white/10 rounded-md p-3">
                Catatan: Pesanan disimpan sebagai <strong className="text-[#FFF4E8]">draft lokal</strong>{' '}
                yang menunggu konfirmasi admin. Pembayaran belum diverifikasi otomatis hingga Anda
                mengirim pesan WhatsApp dan dikonfirmasi oleh outlet.
              </p>

              <div className="text-sm space-y-1.5 border-t border-white/10 pt-3">
                <div className="flex justify-between">
                  <span className="text-[#A7A7A7]">Pemesan</span>
                  <span>{submittedOrder.order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7A7A7]">Metode</span>
                  <span>{submittedOrder.order.method}</span>
                </div>
                <div className="flex justify-between font-mono font-bold text-[#FFC247] tabular-nums">
                  <span className="font-sans text-[#FFF4E8]">Total Estimasi</span>
                  <span>{formatRupiah(submittedOrder.order.total)}</span>
                </div>
              </div>

              <a
                href={submittedOrder.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FB858] text-[#111111] font-bold py-3.5 px-4 rounded-md transition-colors"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span>Kirim Pesanan via WhatsApp</span>
              </a>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyMessage(submittedOrder.messageText)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#A7A7A7] hover:text-[#FFF4E8]"
                >
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Salin Teks Pesanan</span>
                </button>
                <button
                  type="button"
                  onClick={resetCheckoutView}
                  className="text-xs font-semibold text-[#FFC247] hover:underline"
                >
                  Kembali Belanja
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 px-4">
              <ShoppingBag className="w-12 h-12 text-[#3A3A3A] mx-auto mb-4" aria-hidden="true" />
              <p className="font-display text-2xl uppercase text-[#FFF4E8]">
                Keranjang Masih Kosong
              </p>
              <p className="text-sm text-[#A7A7A7] mt-2">
                Pilih dimsum chili oil, mentai torch, atau paket hemat favoritmu dari katalog.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-5 py-2.5 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] rounded-md text-sm font-semibold transition-colors"
              >
                Jelajahi Menu
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const unitPrice = getEffectivePrice({
                    price: item.price,
                    discountPrice: item.discountPrice,
                  });
                  const catalogItem = products.find((p) => p.id === item.productId);
                  const maxStock = catalogItem?.stock ?? item.quantity;

                  return (
                    <div
                      key={item.productId}
                      className="flex gap-3 bg-[#1C1C1C] border border-white/10 rounded-lg p-3"
                    >
                      <div className="w-20 h-16 rounded overflow-hidden shrink-0 bg-[#111111]">
                        <FoodImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-[#FFF4E8] truncate">
                            {item.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.productId)}
                            className="text-[#A7A7A7] hover:text-[#D71920] p-0.5 shrink-0"
                            aria-label={`Hapus ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[#A7A7A7]">{item.portions}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-bold text-[#FFC247] tabular-nums">
                            {formatRupiah(unitPrice * item.quantity)}
                          </span>
                          <div className="inline-flex items-center border border-white/15 rounded bg-[#111111]">
                            <button
                              type="button"
                              onClick={() => setCartItemQty(item.productId, item.quantity - 1)}
                              className="p-1.5 text-[#FFF4E8] hover:bg-white/10"
                              aria-label={`Kurangi jumlah ${item.name}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-mono tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={item.quantity >= maxStock}
                              onClick={() => setCartItemQty(item.productId, item.quantity + 1)}
                              className="p-1.5 text-[#FFF4E8] hover:bg-white/10 disabled:opacity-40"
                              aria-label={`Tambah jumlah ${item.name}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Box */}
              <div className="bg-[#1C1C1C] border border-white/10 rounded-lg p-4 space-y-2.5">
                <label
                  htmlFor="cart-promo-input"
                  className="text-xs uppercase tracking-wider text-[#A7A7A7] flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-[#FFC247]" aria-hidden="true" />
                  <span>Kode Promo</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="cart-promo-input"
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Contoh: NYEMEK10"
                    className="flex-1 bg-[#111111] border border-white/10 focus:border-[#FFC247] focus:outline-none rounded px-3 py-2 text-xs font-mono uppercase text-[#FFF4E8]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-[#FFF4E8] rounded text-xs font-semibold whitespace-nowrap"
                  >
                    Terapkan
                  </button>
                </div>
                {totals.promoError && (
                  <p className="text-xs text-[#F15A24]">{totals.promoError}</p>
                )}
                {activePromos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activePromos.map((pr) => (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => {
                          setPromoInput(pr.code);
                          setAppliedPromoCode(pr.code);
                        }}
                        className="text-[11px] font-mono bg-[#111111] hover:border-[#FFC247] border border-white/10 text-[#FFC247] px-2 py-1 rounded transition-colors"
                      >
                        {pr.code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              <div className="bg-[#1C1C1C] border border-white/10 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#A7A7A7]">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-[#FFF4E8]">
                    {formatRupiah(totals.subtotal)}
                  </span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-[#25D366]">
                    <span>Diskon ({selectedPromo?.code})</span>
                    <span className="font-mono tabular-nums">
                      -{formatRupiah(totals.discount)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                  <span className="font-semibold text-[#FFF4E8]">Total Pembayaran</span>
                  <span className="font-mono text-xl font-bold text-[#FFC247] tabular-nums">
                    {formatRupiah(totals.total)}
                  </span>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckout} className="space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wide text-[#FFF4E8]">
                  Data Pemesan &amp; Pengiriman
                </h3>

                <div>
                  <label htmlFor="checkout-name" className="block text-xs text-[#A7A7A7] mb-1">
                    Nama Pemesan *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2.5 text-sm text-[#FFF4E8]"
                  />
                  {formErrors.customerName && (
                    <p className="text-xs text-[#D71920] mt-1">{formErrors.customerName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="block text-xs text-[#A7A7A7] mb-1">
                    Nomor Telepon / WhatsApp *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2.5 text-sm text-[#FFF4E8]"
                  />
                  {formErrors.customerPhone && (
                    <p className="text-xs text-[#D71920] mt-1">{formErrors.customerPhone}</p>
                  )}
                </div>

                <div>
                  <span className="block text-xs text-[#A7A7A7] mb-1.5">
                    Metode Pemesanan *
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Delivery', 'Pickup', 'Frozen Reseller'] as OrderMethod[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={`py-2 px-2 rounded-md text-xs font-semibold border transition-colors ${
                          method === m
                            ? 'bg-[#D71920] border-[#D71920] text-[#FFF4E8]'
                            : 'bg-[#1C1C1C] border-white/10 text-[#A7A7A7] hover:text-[#FFF4E8]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {method !== 'Pickup' && (
                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="block text-xs text-[#A7A7A7] mb-1"
                    >
                      Alamat Pengiriman *
                    </label>
                    <textarea
                      id="checkout-address"
                      rows={2}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Jalan, nomor rumah, patokan, atau kota tujuan"
                      className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
                    />
                    {formErrors.customerAddress && (
                      <p className="text-xs text-[#D71920] mt-1">
                        {formErrors.customerAddress}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="checkout-notes" className="block text-xs text-[#A7A7A7] mb-1">
                    Catatan Pesanan (Opsional)
                  </label>
                  <input
                    id="checkout-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Chili oil dipisah, ekstra wijen"
                    className="w-full bg-[#1C1C1C] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3 py-2.5 text-sm text-[#FFF4E8]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FB858] text-[#111111] font-bold py-3.5 px-4 rounded-md transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  <span>Checkout via WhatsApp</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
