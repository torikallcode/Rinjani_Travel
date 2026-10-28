import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Info, Loader2, ShieldCheck, Tag, Users } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Card, Field, Input, Select, Spinner, Textarea } from '../components/ui/primitives';
import { formatCurrency, formatDate, packageImage } from '../lib/format';

const emptyTraveler = (organizer = false) => ({
  name: '',
  birth_date: '',
  gender: '',
  nationality: 'Indonesia',
  id_number: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  health_note: '',
  health_consent: false,
  is_organizer: organizer,
});

export default function CheckoutPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const idempotencyKey = useRef(crypto.randomUUID());

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [selectedAddons, setSelectedAddons] = useState({});
  const [travelers, setTravelers] = useState(Number(params.get('travelers') || 2));
  const [travelerForms, setTravelerForms] = useState(() =>
    Array.from({ length: Number(params.get('travelers') || 2) }, (_, index) => emptyTraveler(index === 0)),
  );
  const [organizer, setOrganizer] = useState({ name: '', phone: '', email: '', notes: '' });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const departureId = params.get('departure');

  useEffect(() => {
    let alive = true;
    api
      .get(`/packages/${slug}`, { auth: false })
      .then((data) => {
        if (!alive) return;
        setPkg(data);
        const first = data?.departures?.find((dep) => dep.status === 'open' && dep.seats_left > 0);
        if (!departureId && first) {
          navigate(`/checkout/${slug}?departure=${first.id}&travelers=${travelers}`, { replace: true });
        }
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // Initial load only; departureId/travelers are read before the URL redirect runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    setOrganizer((current) => ({
      ...current,
      name: current.name || user?.name || '',
      phone: current.phone || user?.phone || '',
      email: current.email || user?.email || '',
    }));
  }, [user]);

  const departure = useMemo(
    () => (pkg?.departures || []).find((dep) => String(dep.id) === String(departureId)),
    [pkg, departureId],
  );
  const maxTravelers = Math.min(departure?.seats_left || 10, 30);
  const addons = useMemo(() => (pkg?.addons || []).filter((addon) => addon.active), [pkg]);

  const addonPayload = useMemo(
    () =>
      Object.entries(selectedAddons)
        .filter(([, qty]) => Number(qty) > 0)
        .map(([id, qty]) => ({ id: Number(id), quantity: Number(qty) })),
    [selectedAddons],
  );

  useEffect(() => {
    if (!departureId) return;
    let alive = true;
    setQuoteLoading(true);
    setQuoteError('');
    const timer = setTimeout(() => {
      api
        .post('/bookings/quote', {
          departure_id: Number(departureId),
          travelers_count: travelers,
          addons: addonPayload,
          coupon_code: appliedCoupon,
        })
        .then((data) => alive && setQuote(data))
        .catch((err) => {
          if (!alive) return;
          setQuote(null);
          setQuoteError(err.message);
        })
        .finally(() => alive && setQuoteLoading(false));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [departureId, travelers, addonPayload, appliedCoupon]);

  const changeTravelerCount = (next) => {
    const count = Math.max(1, Math.min(maxTravelers, next));
    setTravelers(count);
    setTravelerForms((current) => {
      const copy = [...current];
      while (copy.length < count) copy.push(emptyTraveler(false));
      return copy.slice(0, count);
    });
  };

  const updateTraveler = (index, key, value) => {
    setTravelerForms((current) => current.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const toggleAddon = (addon) => {
    setSelectedAddons((current) => {
      const next = { ...current };
      if (next[addon.id]) {
        delete next[addon.id];
      } else {
        next[addon.id] = addon.pricing_type === 'per_person' ? travelers : 1;
      }
      return next;
    });
  };

  const setAddonQty = (addon, qty) => {
    const max = addon.pricing_type === 'per_person' ? travelers : 99;
    setSelectedAddons((current) => ({ ...current, [addon.id]: Math.max(1, Math.min(max, Number(qty) || 1)) }));
  };

  const applyCoupon = () => {
    setAppliedCoupon(coupon.trim().toUpperCase());
  };

  const validate = () => {
    const errors = {};
    if (!organizer.name.trim()) errors.organizer_name = 'Nama pemesan wajib diisi.';
    if (!organizer.phone.trim()) errors.organizer_phone = 'Nomor WhatsApp wajib diisi.';
    if (!consent) errors.consent = 'Anda harus menyetujui syarat dan kebijakan pembatalan.';
    travelerForms.forEach((traveler, index) => {
      if (!traveler.name.trim()) errors[`traveler_${index}`] = 'Nama peserta wajib diisi.';
      if (!traveler.health_consent) errors[`health_${index}`] = 'Persetujuan kesehatan wajib dicentang.';
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    try {
      const booking = await api.post(
        '/bookings',
        {
          departure_id: Number(departureId),
          travelers: travelerForms.map((traveler) => ({
            ...traveler,
            birth_date: traveler.birth_date || null,
          })),
          addons: addonPayload,
          coupon_code: appliedCoupon,
          organizer_name: organizer.name.trim(),
          organizer_phone: organizer.phone.trim(),
          organizer_email: organizer.email.trim(),
          notes: organizer.notes.trim(),
          consent,
        },
        { headers: { 'Idempotency-Key': idempotencyKey.current } },
      );
      navigate(`/account/bookings/${booking.booking_code}?created=1`);
    } catch (err) {
      setSubmitError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Menyiapkan checkout..." />;
  if (error || !pkg) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <Alert tone="danger" title="Tidak dapat memuat paket">{error || 'Paket tidak ditemukan.'}</Alert>
        <Button as="link" to="/packages" className="mt-4">Kembali ke katalog</Button>
      </div>
    );
  }
  if (!departure) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <Alert tone="warning" title="Jadwal tidak tersedia">
          Jadwal keberangkatan yang Anda pilih sudah tidak tersedia. Silakan pilih tanggal lain.
        </Alert>
        <Button as="link" to={`/packages/${slug}`} className="mt-4">Pilih tanggal lain</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to={`/packages/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-hitam-0/55 hover:text-biru-0">
        <ArrowLeft className="h-4 w-4" /> Kembali ke detail paket
      </Link>
      <h1 className="mt-4 font-tomorrow text-3xl font-bold text-hitam-0">Selesaikan pemesanan</h1>
      <p className="mt-1 text-sm text-hitam-0/55">Kuota akan ditahan sementara setelah pesanan dibuat. Selesaikan pembayaran sebelum batas waktu.</p>

      {submitError && <Alert tone="danger" title="Pemesanan gagal" className="mt-5">{submitError}</Alert>}
      {Object.keys(fieldErrors).length > 0 && (
        <Alert tone="warning" title="Periksa kembali data Anda" className="mt-5">
          Beberapa kolom wajib belum lengkap. Lihat penanda merah pada formulir.
        </Alert>
      )}

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <img src={packageImage(pkg)} alt={pkg.title} className="h-20 w-24 rounded-lg object-cover" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-biru-0">Paket dipilih</p>
                <h2 className="mt-1 font-tomorrow text-lg font-bold text-hitam-0">{pkg.title}</h2>
                <p className="mt-1 text-sm text-hitam-0/55">
                  {formatDate(departure.start_date)} · {travelers} peserta · {departure.seats_left} kursi tersedia
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-lg bg-[#f4f5f7] p-3">
              <span className="text-sm text-hitam-0/60">Jumlah peserta</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => changeTravelerCount(travelers - 1)} className="rounded-md border border-hitam-0/15 bg-white px-2.5 py-1 text-sm">−</button>
                <span className="w-8 text-center text-sm font-bold">{travelers}</span>
                <button type="button" onClick={() => changeTravelerCount(travelers + 1)} className="rounded-md border border-hitam-0/15 bg-white px-2.5 py-1 text-sm">+</button>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Data pemesan</h2>
            <p className="mt-1 text-xs text-hitam-0/50">Kami akan mengirim invoice dan voucher ke kontak ini.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nama lengkap" required error={fieldErrors.organizer_name}>
                <Input value={organizer.name} onChange={(event) => setOrganizer({ ...organizer, name: event.target.value })} placeholder="Nama sesuai identitas" />
              </Field>
              <Field label="Nomor WhatsApp" required error={fieldErrors.organizer_phone}>
                <Input value={organizer.phone} onChange={(event) => setOrganizer({ ...organizer, phone: event.target.value })} placeholder="62812xxxxxxx" />
              </Field>
              <Field label="Email" className="sm:col-span-2">
                <Input type="email" value={organizer.email} onChange={(event) => setOrganizer({ ...organizer, email: event.target.value })} placeholder="nama@email.com" />
              </Field>
              <Field label="Catatan untuk tim kami" className="sm:col-span-2">
                <Textarea value={organizer.notes} onChange={(event) => setOrganizer({ ...organizer, notes: event.target.value })} placeholder="Kebutuhan makanan, alergi, jemputan, atau pertanyaan lain." rows={3} />
              </Field>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Data peserta</h2>
                <p className="mt-1 text-xs text-hitam-0/50">Isi sesuai identitas. Data kesehatan hanya digunakan untuk keselamatan.</p>
              </div>
              <Users className="h-5 w-5 text-biru-0" />
            </div>
            <div className="mt-5 space-y-5">
              {travelerForms.map((traveler, index) => (
                <div key={index} className="rounded-xl border border-hitam-0/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-hitam-0">Peserta {index + 1} {index === 0 && <span className="ml-1 rounded bg-biru-0/10 px-1.5 py-0.5 text-[10px] font-semibold text-biru-0">Pemesan</span>}</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Nama lengkap" required error={fieldErrors[`traveler_${index}`]}>
                      <Input value={traveler.name} onChange={(event) => updateTraveler(index, 'name', event.target.value)} placeholder="Nama peserta" />
                    </Field>
                    <Field label="Tanggal lahir">
                      <Input type="date" value={traveler.birth_date} onChange={(event) => updateTraveler(index, 'birth_date', event.target.value)} />
                    </Field>
                    <Field label="Jenis kelamin">
                      <Select value={traveler.gender} onChange={(event) => updateTraveler(index, 'gender', event.target.value)}>
                        <option value="">Pilih</option>
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                        <option value="other">Lainnya</option>
                      </Select>
                    </Field>
                    <Field label="Kewarganegaraan">
                      <Input value={traveler.nationality} onChange={(event) => updateTraveler(index, 'nationality', event.target.value)} />
                    </Field>
                    <Field label="No. identitas / paspor">
                      <Input value={traveler.id_number} onChange={(event) => updateTraveler(index, 'id_number', event.target.value)} placeholder="Opsional" />
                    </Field>
                    <Field label="Kontak darurat (nama)">
                      <Input value={traveler.emergency_contact_name} onChange={(event) => updateTraveler(index, 'emergency_contact_name', event.target.value)} />
                    </Field>
                    <Field label="Kontak darurat (telepon)">
                      <Input value={traveler.emergency_contact_phone} onChange={(event) => updateTraveler(index, 'emergency_contact_phone', event.target.value)} />
                    </Field>
                    <Field label="Catatan kesehatan" className="sm:col-span-2">
                      <Input value={traveler.health_note} onChange={(event) => updateTraveler(index, 'health_note', event.target.value)} placeholder="Alergi, kondisi khusus, obat rutin (opsional)" />
                    </Field>
                  </div>
                  <label className="mt-3 flex items-start gap-2 text-xs text-hitam-0/65">
                    <input
                      type="checkbox"
                      checked={traveler.health_consent}
                      onChange={(event) => updateTraveler(index, 'health_consent', event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-hitam-0/30 text-biru-0 focus:ring-biru-0"
                    />
                    Saya menyetujui pengumpulan data kesehatan untuk keperluan keselamatan perjalanan.
                  </label>
                  {fieldErrors[`health_${index}`] && <p className="mt-1 text-xs text-red-600">{fieldErrors[`health_${index}`]}</p>}
                </div>
              ))}
            </div>
          </Card>

          {addons.length > 0 && (
            <Card className="p-5 sm:p-6">
              <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Layanan tambahan</h2>
              <p className="mt-1 text-xs text-hitam-0/50">Opsional. Harga akan dihitung ulang oleh server.</p>
              <div className="mt-4 space-y-3">
                {addons.map((addon) => {
                  const selected = Boolean(selectedAddons[addon.id]);
                  return (
                    <div key={addon.id} className={`rounded-lg border p-3 transition ${selected ? 'border-biru-0 bg-biru-0/5' : 'border-hitam-0/10'}`}>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input type="checkbox" checked={selected} onChange={() => toggleAddon(addon)} className="mt-1 h-4 w-4 rounded border-hitam-0/30 text-biru-0 focus:ring-biru-0" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-hitam-0">{addon.name}</p>
                              <p className="mt-0.5 text-xs text-hitam-0/55">{addon.description}</p>
                            </div>
                            <p className="whitespace-nowrap text-sm font-bold text-hitam-0">{formatCurrency(addon.price)}</p>
                          </div>
                          <p className="mt-1 text-[11px] text-hitam-0/45">{addon.pricing_type === 'per_person' ? 'per peserta' : 'per pesanan'}</p>
                        </div>
                      </label>
                      {selected && (
                        <div className="mt-2 flex items-center justify-end gap-2 text-xs text-hitam-0/60">
                          <span>Jumlah</span>
                          <input
                            type="number"
                            min="1"
                            max={addon.pricing_type === 'per_person' ? travelers : 99}
                            value={selectedAddons[addon.id]}
                            onChange={(event) => setAddonQty(addon, event.target.value)}
                            className="w-16 rounded border border-hitam-0/15 px-2 py-1 text-center"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card className="p-5 sm:p-6">
            <label className="flex items-start gap-3 text-sm text-hitam-0/70">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-hitam-0/30 text-biru-0 focus:ring-biru-0"
              />
              <span>
                Saya menyetujui <Link to="/terms" className="font-semibold text-biru-0 hover:underline">syarat & ketentuan</Link>, kebijakan pembatalan, dan pemrosesan data pribadi sesuai <Link to="/privacy" className="font-semibold text-biru-0 hover:underline">kebijakan privasi</Link>.
              </span>
            </label>
            {fieldErrors.consent && <p className="mt-1 text-xs text-red-600">{fieldErrors.consent}</p>}
          </Card>
        </div>

        <aside>
          <div className="sticky top-24 space-y-4">
            <Card className="p-5">
              <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Ringkasan biaya</h2>
              {quoteLoading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-hitam-0/50"><Loader2 className="h-4 w-4 animate-spin" /> Menghitung...</div>
              ) : quoteError ? (
                <Alert tone="danger" className="mt-3">{quoteError}</Alert>
              ) : quote ? (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-hitam-0/60">
                    <span>{formatCurrency(quote.price_per_person)} × {quote.travelers_count}</span>
                    <span>{formatCurrency(quote.subtotal)}</span>
                  </div>
                  {quote.addons?.map((addon) => (
                    <div key={addon.id} className="flex justify-between text-hitam-0/60">
                      <span>{addon.name} × {addon.quantity}</span>
                      <span>{formatCurrency(addon.total)}</span>
                    </div>
                  ))}
                  {quote.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Diskon {quote.coupon?.code && `(${quote.coupon.code})`}</span>
                      <span>−{formatCurrency(quote.discount)}</span>
                    </div>
                  )}
                  {quote.tax > 0 && (
                    <div className="flex justify-between text-hitam-0/60">
                      <span>Pajak</span>
                      <span>{formatCurrency(quote.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-hitam-0/10 pt-3 font-tomorrow text-lg font-bold text-hitam-0">
                    <span>Total</span>
                    <span>{formatCurrency(quote.total)}</span>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 border-t border-hitam-0/10 pt-4">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-hitam-0/70"><Tag className="h-3.5 w-3.5" /> Kode promo</label>
                <div className="flex gap-2">
                  <Input value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="RINJANI10" className="uppercase" />
                  <Button type="button" variant="outline" onClick={applyCoupon}>Pakai</Button>
                </div>
                {appliedCoupon && (
                  <button type="button" onClick={() => { setAppliedCoupon(''); setCoupon(''); }} className="mt-1.5 text-xs text-hitam-0/50 hover:text-red-600">
                    Hapus kode {appliedCoupon}
                  </button>
                )}
              </div>

              <Button type="submit" size="lg" className="mt-5 w-full" loading={submitting} disabled={!quote || quoteLoading}>
                Buat pesanan
              </Button>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-hitam-0/45">
                <ShieldCheck className="h-3.5 w-3.5" /> Harga dihitung ulang di server saat pesanan dibuat.
              </p>
            </Card>
            <div className="rounded-xl border border-hitam-0/10 bg-white p-4 text-xs text-hitam-0/55">
              <p className="flex items-center gap-1.5 font-semibold text-hitam-0"><Info className="h-3.5 w-3.5 text-biru-0" /> Setelah pesanan dibuat</p>
              <p className="mt-1.5">Anda akan diarahkan ke halaman pembayaran. Kuota ditahan {quote?.hold_minutes || 30} menit.</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
