import React from 'react';
import { Clock, ExternalLink, MapPin, MessageCircle, PackageCheck, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { isSafeHttpUrl, normalizePhoneNumber } from '../../utils/validation';

export const StoreInfoSection: React.FC = () => {
  const { settings } = useStore();
  const safeMapsUrl = isSafeHttpUrl(settings.mapsUrl, false)
    ? settings.mapsUrl
    : 'https://maps.google.com';
  const waHref = `https://wa.me/${normalizePhoneNumber(settings.whatsappNumber)}`;

  return (
    <section
      id="lokasi"
      className="py-16 lg:py-20 bg-[#161616] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#F15A24] mb-2">
                Informasi Outlet &amp; Pemesanan
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#FFF4E8]">
                KUNJUNGI DAPUR <span className="text-[#D71920]">{settings.brandName}</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#A7A7A7] leading-relaxed">
                Pesan hangat untuk disantap langsung, ambil di outlet tanpa antre, atau ajukan
                kemitraan frozen reseller langsung lewat WhatsApp resmi toko.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5 bg-[#1C1C1C] border border-white/10 rounded-lg p-4">
                <MapPin className="w-5 h-5 text-[#D71920] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#A7A7A7]">Alamat Outlet</p>
                  <p className="text-sm font-medium text-[#FFF4E8] mt-0.5">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-[#1C1C1C] border border-white/10 rounded-lg p-4">
                <Clock className="w-5 h-5 text-[#FFC247] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#A7A7A7]">
                    Jam Operasional
                  </p>
                  <p className="text-sm font-medium text-[#FFF4E8] mt-0.5">{settings.openHours}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#1C1C1C] border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[#F15A24] text-xs font-semibold uppercase tracking-wider">
                    <Truck className="w-4 h-4" aria-hidden="true" />
                    <span>Delivery</span>
                  </div>
                  <p className="text-xs text-[#A7A7A7] mt-2 leading-relaxed">
                    {settings.deliveryInfo}
                  </p>
                </div>
                <div className="bg-[#1C1C1C] border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[#FFC247] text-xs font-semibold uppercase tracking-wider">
                    <PackageCheck className="w-4 h-4" aria-hidden="true" />
                    <span>Pickup Outlet</span>
                  </div>
                  <p className="text-xs text-[#A7A7A7] mt-2 leading-relaxed">
                    {settings.pickupInfo}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Outlet Map Card & Direct Actions */}
          <div className="lg:col-span-6 bg-[#1C1C1C] border border-white/10 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#FFC247] font-semibold">
                    Peta Lokasi Outlet
                  </p>
                  <h3 className="font-display text-2xl uppercase text-[#FFF4E8] mt-1">
                    Google Maps &amp; Kontak Langsung
                  </h3>
                </div>
                <MapPin className="w-6 h-6 text-[#D71920] shrink-0" aria-hidden="true" />
              </div>

              <div className="mt-6 rounded-lg bg-[#111111] border border-white/10 p-6">
                <p className="text-xs uppercase tracking-wider text-[#A7A7A7]">
                  Titik Pengambilan &amp; Pengiriman
                </p>
                <p className="text-base font-semibold text-[#FFF4E8] mt-2">{settings.address}</p>
                <p className="text-sm text-[#A7A7A7] mt-1">{settings.openHours}</p>
                <p className="font-mono text-sm text-[#25D366] mt-4 tabular-nums">
                  WhatsApp: +{normalizePhoneNumber(settings.whatsappNumber)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={safeMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-[#FFF4E8] px-5 py-3 rounded-md text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <MapPin className="w-4 h-4 text-[#D71920]" aria-hidden="true" />
                <span>Buka Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FB858] text-[#111111] px-5 py-3 rounded-md text-sm font-bold transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Chat WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
