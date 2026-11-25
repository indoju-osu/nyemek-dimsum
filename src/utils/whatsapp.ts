import { OrderMethod } from '../types';
import { formatRupiah } from './catalog';
import { normalizePhoneNumber, sanitizePlainText, validatePhoneNumber } from './validation';

export interface WhatsAppOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface WhatsAppOrderPayload {
  orderId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  method: OrderMethod;
  notes?: string;
  items: WhatsAppOrderItem[];
  subtotal: number;
  discount?: number;
  promoCode?: string | null;
  total: number;
}

export function formatWhatsAppMessage(payload: WhatsAppOrderPayload): string {
  const safeName = sanitizePlainText(payload.customerName, 100);
  const safePhone = sanitizePlainText(payload.customerPhone, 30);
  const safeAddress =
    payload.method === 'Pickup'
      ? sanitizePlainText(payload.customerAddress || 'Ambil langsung di outlet', 250)
      : sanitizePlainText(payload.customerAddress, 250);
  const safeNotes = sanitizePlainText(payload.notes || '-', 250) || '-';

  const itemLines = payload.items.map(
    (item) =>
      `- ${sanitizePlainText(item.name, 100)} | ${item.quantity}x | ${formatRupiah(
        item.unitPrice * item.quantity
      )}`
  );

  const lines = [
    'HALO NYEMEK! 🌶️',
    '',
    'Saya ingin memesan:',
    '',
    ...(payload.orderId ? [`ID Draft: ${payload.orderId}`] : []),
    `Nama: ${safeName}`,
    `Nomor: ${safePhone}`,
    `Alamat: ${safeAddress}`,
    '',
    'DETAIL PESANAN:',
    ...itemLines,
    '',
    `Subtotal: ${formatRupiah(payload.subtotal)}`,
  ];

  if (payload.discount && payload.discount > 0) {
    lines.push(
      `Diskon${payload.promoCode ? ` (${payload.promoCode})` : ''}: -${formatRupiah(
        payload.discount
      )}`
    );
  }

  lines.push(`Total: ${formatRupiah(payload.total)}`);
  lines.push(`Metode: ${payload.method}`);
  lines.push(`Catatan: ${safeNotes}`);
  lines.push('');
  lines.push('Mohon konfirmasi pesanan saya.');

  return lines.join('\n');
}

export function buildWhatsAppUrl(
  storeWhatsAppNumber: string,
  payload: WhatsAppOrderPayload
): string {
  if (!validatePhoneNumber(storeWhatsAppNumber)) {
    throw new Error('Nomor WhatsApp toko tidak valid.');
  }
  if (!payload.items || payload.items.length === 0) {
    throw new Error('Keranjang pesanan tidak boleh kosong.');
  }
  if (!payload.customerName || !payload.customerName.trim()) {
    throw new Error('Nama pemesan wajib diisi.');
  }

  const normalizedPhone = normalizePhoneNumber(storeWhatsAppNumber);
  const message = formatWhatsAppMessage(payload);
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
