import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Alert, Button, Card, Field, Input, PageHeader, Select, Spinner, Textarea } from '../../components/ui/primitives';

const emptyItinerary = () => ({ day_number: 1, title: '', description: '', meals: '', accommodation: '', sort_order: 0 });
const emptyAddon = () => ({ name: '', description: '', price: 0, pricing_type: 'per_person', active: true, sort_order: 0 });
const emptyFaq = () => ({ question: '', answer: '', sort_order: 0 });

const initialForm = {
  slug: '',
  title: '',
  category: 'trekking',
  description: '',
  description_long: '',
  image: '/img/mnt4.jpg',
  gallery: '',
  difficulty: 'moderate',
  duration: 3,
  days: 3,
  base_price: 1000000,
  currency: 'IDR',
  status: 'draft',
  departure_point: '',
  min_age: 10,
  max_age: 65,
  includes: '',
  excludes: '',
  equipment: '',
  requirements: '',
  cancellation_policy: '',
  seo_title: '',
  seo_description: '',
  featured: false,
  itineraries: [],
  addons: [],
  faqs: [],
};

const toLines = (value) => (value || '').split('\n').map((line) => line.trim()).filter(Boolean);

export default function AdminPackageFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isNew) {
      setForm(initialForm);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    api
      .get(`/admin/packages/${id}`)
      .then((pkg) => {
        if (!alive) return;
        setForm({
          ...initialForm,
          ...pkg,
          gallery: (pkg.gallery || []).join('\n'),
          includes: (pkg.includes || []).join('\n'),
          excludes: (pkg.excludes || []).join('\n'),
          equipment: (pkg.equipment || []).join('\n'),
          itineraries: (pkg.itineraries || []).map((item) => ({ ...item })),
          addons: (pkg.addons || []).map((item) => ({ ...item })),
          faqs: (pkg.faqs || []).map((item) => ({ ...item })),
        });
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const updateChild = (key, index, patch) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  };

  const addChild = (key, factory) => setForm((current) => ({ ...current, [key]: [...current[key], factory()] }));

  const removeChild = (key, index) =>
    setForm((current) => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index) }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!form.title.trim() || !form.description.trim() || Number(form.base_price) <= 0) {
      setError('Judul, deskripsi, dan harga dasar wajib diisi dengan benar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      duration: Number(form.duration),
      days: Number(form.days),
      base_price: Number(form.base_price),
      min_age: Number(form.min_age),
      max_age: Number(form.max_age),
      gallery: toLines(form.gallery),
      includes: toLines(form.includes),
      excludes: toLines(form.excludes),
      equipment: toLines(form.equipment),
      itineraries: form.itineraries
        .filter((item) => item.title.trim())
        .map((item, index) => ({
          day_number: Number(item.day_number) || index + 1,
          title: item.title,
          description: item.description,
          meals: item.meals,
          accommodation: item.accommodation,
          sort_order: Number(item.sort_order) || index,
        })),
      addons: form.addons
        .filter((item) => item.name.trim())
        .map((item, index) => ({
          name: item.name,
          description: item.description,
          price: Number(item.price) || 0,
          pricing_type: item.pricing_type,
          active: Boolean(item.active),
          sort_order: Number(item.sort_order) || index,
        })),
      faqs: form.faqs
        .filter((item) => item.question.trim())
        .map((item, index) => ({ question: item.question, answer: item.answer, sort_order: Number(item.sort_order) || index })),
    };
    try {
      if (isNew) {
        const created = await api.post('/admin/packages', payload);
        setMessage('Paket berhasil dibuat.');
        navigate(`/admin/packages/${created.id}/edit`, { replace: true });
      } else {
        await api.put(`/admin/packages/${id}`, payload);
        setMessage('Paket berhasil diperbarui.');
      }
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Memuat paket..." />;

  return (
    <div>
      <Link to="/admin/packages" className="inline-flex items-center gap-1.5 text-sm font-medium text-hitam-0/55 hover:text-biru-0">
        <ArrowLeft className="h-4 w-4" /> Semua paket
      </Link>
      <PageHeader
        className="mt-4"
        eyebrow="Katalog"
        title={isNew ? 'Paket Baru' : 'Edit Paket'}
        description="Semua perubahan langsung tampil di situs publik setelah disimpan sebagai published."
        actions={
          <>
            <Button as="link" to="/admin/packages" variant="outline">Batal</Button>
            <Button type="submit" form="package-form" loading={saving}><Save className="h-4 w-4" /> Simpan</Button>
          </>
        }
      />

      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}
      {message && <Alert tone="success" className="mt-4">{message}</Alert>}

      <form id="package-form" onSubmit={submit} className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Informasi dasar</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Judul paket" required className="sm:col-span-2">
                <Input value={form.title} onChange={(event) => update('title', event.target.value)} required />
              </Field>
              <Field label="Slug URL" hint="Kosongkan untuk dibuat otomatis dari judul.">
                <Input value={form.slug} onChange={(event) => update('slug', event.target.value)} placeholder="rinjani-summit-4d3n" />
              </Field>
              <Field label="Kategori" required>
                <Select value={form.category} onChange={(event) => update('category', event.target.value)}>
                  <option value="trekking">Trekking</option>
                  <option value="tour">Tour</option>
                </Select>
              </Field>
              <Field label="Deskripsi singkat" required className="sm:col-span-2">
                <Textarea rows={3} value={form.description} onChange={(event) => update('description', event.target.value)} required />
              </Field>
              <Field label="Deskripsi lengkap" className="sm:col-span-2">
                <Textarea rows={6} value={form.description_long} onChange={(event) => update('description_long', event.target.value)} />
              </Field>
              <Field label="Titik keberangkatan">
                <Input value={form.departure_point} onChange={(event) => update('departure_point', event.target.value)} />
              </Field>
              <Field label="Tingkat kesulitan">
                <Select value={form.difficulty} onChange={(event) => update('difficulty', event.target.value)}>
                  <option value="easy">Mudah</option>
                  <option value="moderate">Sedang</option>
                  <option value="challenging">Menantang</option>
                  <option value="hard">Sulit</option>
                </Select>
              </Field>
              <Field label="Durasi (hari)">
                <Input type="number" min="1" value={form.duration} onChange={(event) => update('duration', event.target.value)} />
              </Field>
              <Field label="Jumlah hari itinerary">
                <Input type="number" min="1" value={form.days} onChange={(event) => update('days', event.target.value)} />
              </Field>
              <Field label="Usia minimum">
                <Input type="number" min="0" value={form.min_age} onChange={(event) => update('min_age', event.target.value)} />
              </Field>
              <Field label="Usia maksimum">
                <Input type="number" min="0" value={form.max_age} onChange={(event) => update('max_age', event.target.value)} />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Media</h2>
            <div className="mt-4 grid gap-4">
              <Field label="Gambar utama (URL/path)" hint="Contoh: /img/mnt4.jpg">
                <Input value={form.image} onChange={(event) => update('image', event.target.value)} />
              </Field>
              <Field label="Galeri" hint="Satu URL per baris.">
                <Textarea rows={4} value={form.gallery} onChange={(event) => update('gallery', event.target.value)} />
              </Field>
              {form.image && <img src={form.image} alt="Pratinjau" className="h-40 w-full rounded-lg object-cover" />}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Fasilitas & persyaratan</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Termasuk" hint="Satu item per baris.">
                <Textarea rows={6} value={form.includes} onChange={(event) => update('includes', event.target.value)} />
              </Field>
              <Field label="Tidak termasuk" hint="Satu item per baris.">
                <Textarea rows={6} value={form.excludes} onChange={(event) => update('excludes', event.target.value)} />
              </Field>
              <Field label="Perlengkapan disarankan" hint="Satu item per baris.">
                <Textarea rows={5} value={form.equipment} onChange={(event) => update('equipment', event.target.value)} />
              </Field>
              <Field label="Persyaratan fisik">
                <Textarea rows={5} value={form.requirements} onChange={(event) => update('requirements', event.target.value)} />
              </Field>
              <Field label="Kebijakan pembatalan" className="sm:col-span-2">
                <Textarea rows={3} value={form.cancellation_policy} onChange={(event) => update('cancellation_policy', event.target.value)} />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Itinerary</h2>
                <p className="mt-1 text-xs text-hitam-0/50">Urutan hari dan aktivitas perjalanan.</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => addChild('itineraries', emptyItinerary)}>
                <Plus className="h-3.5 w-3.5" /> Tambah hari
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {form.itineraries.length === 0 && <p className="rounded-lg border border-dashed border-hitam-0/15 px-4 py-6 text-center text-xs text-hitam-0/45">Belum ada itinerary.</p>}
              {form.itineraries.map((item, index) => (
                <div key={index} className="rounded-lg border border-hitam-0/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-hitam-0">Hari {index + 1}</p>
                    <button type="button" onClick={() => removeChild('itineraries', index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-6">
                    <Field label="Hari ke" className="sm:col-span-1">
                      <Input type="number" min="1" value={item.day_number} onChange={(event) => updateChild('itineraries', index, { day_number: event.target.value })} />
                    </Field>
                    <Field label="Judul" className="sm:col-span-5">
                      <Input value={item.title} onChange={(event) => updateChild('itineraries', index, { title: event.target.value })} />
                    </Field>
                    <Field label="Deskripsi" className="sm:col-span-6">
                      <Textarea rows={2} value={item.description} onChange={(event) => updateChild('itineraries', index, { description: event.target.value })} />
                    </Field>
                    <Field label="Makan" className="sm:col-span-3">
                      <Input value={item.meals} onChange={(event) => updateChild('itineraries', index, { meals: event.target.value })} placeholder="Sarapan, makan siang" />
                    </Field>
                    <Field label="Akomodasi" className="sm:col-span-3">
                      <Input value={item.accommodation} onChange={(event) => updateChild('itineraries', index, { accommodation: event.target.value })} placeholder="Tenda" />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-tomorrow text-lg font-bold text-hitam-0">Add-on</h2>
                <p className="mt-1 text-xs text-hitam-0/50">Layanan tambahan opsional saat checkout.</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => addChild('addons', emptyAddon)}>
                <Plus className="h-3.5 w-3.5" /> Tambah add-on
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {form.addons.length === 0 && <p className="rounded-lg border border-dashed border-hitam-0/15 px-4 py-6 text-center text-xs text-hitam-0/45">Belum ada add-on.</p>}
              {form.addons.map((item, index) => (
                <div key={index} className="rounded-lg border border-hitam-0/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-hitam-0">Add-on {index + 1}</p>
                    <button type="button" onClick={() => removeChild('addons', index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Nama" required><Input value={item.name} onChange={(event) => updateChild('addons', index, { name: event.target.value })} /></Field>
                    <Field label="Harga (IDR)"><Input type="number" min="0" value={item.price} onChange={(event) => updateChild('addons', index, { price: event.target.value })} /></Field>
                    <Field label="Tipe harga">
                      <Select value={item.pricing_type} onChange={(event) => updateChild('addons', index, { pricing_type: event.target.value })}>
                        <option value="per_person">Per peserta</option>
                        <option value="per_booking">Per pesanan</option>
                      </Select>
                    </Field>
                    <Field label="Aktif">
                      <label className="flex h-10 items-center gap-2 text-sm text-hitam-0/70">
                        <input type="checkbox" checked={Boolean(item.active)} onChange={(event) => updateChild('addons', index, { active: event.target.checked })} className="h-4 w-4 rounded border-hitam-0/30 text-biru-0" />
                        Tampilkan di checkout
                      </label>
                    </Field>
                    <Field label="Deskripsi" className="sm:col-span-2"><Textarea rows={2} value={item.description} onChange={(event) => updateChild('addons', index, { description: event.target.value })} /></Field>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-tomorrow text-lg font-bold text-hitam-0">FAQ paket</h2>
                <p className="mt-1 text-xs text-hitam-0/50">Pertanyaan yang tampil di halaman detail.</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => addChild('faqs', emptyFaq)}>
                <Plus className="h-3.5 w-3.5" /> Tambah FAQ
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {form.faqs.length === 0 && <p className="rounded-lg border border-dashed border-hitam-0/15 px-4 py-6 text-center text-xs text-hitam-0/45">Belum ada FAQ.</p>}
              {form.faqs.map((item, index) => (
                <div key={index} className="rounded-lg border border-hitam-0/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-hitam-0">FAQ {index + 1}</p>
                    <button type="button" onClick={() => removeChild('faqs', index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="grid gap-3">
                    <Field label="Pertanyaan"><Input value={item.question} onChange={(event) => updateChild('faqs', index, { question: event.target.value })} /></Field>
                    <Field label="Jawaban"><Textarea rows={2} value={item.answer} onChange={(event) => updateChild('faqs', index, { answer: event.target.value })} /></Field>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-hitam-0">Publikasi</h2>
            <div className="mt-4 space-y-4">
              <Field label="Status">
                <Select value={form.status} onChange={(event) => update('status', event.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-hitam-0/70">
                <input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => update('featured', event.target.checked)} className="h-4 w-4 rounded border-hitam-0/30 text-biru-0" />
                Tampilkan sebagai paket unggulan
              </label>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-hitam-0">Harga</h2>
            <div className="mt-4 space-y-4">
              <Field label="Harga dasar per orang (IDR)" required>
                <Input type="number" min="1" value={form.base_price} onChange={(event) => update('base_price', event.target.value)} required />
              </Field>
              <Field label="Mata uang">
                <Input value={form.currency} onChange={(event) => update('currency', event.target.value)} />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-tomorrow text-base font-bold text-hitam-0">SEO</h2>
            <div className="mt-4 space-y-4">
              <Field label="SEO title"><Input value={form.seo_title} onChange={(event) => update('seo_title', event.target.value)} /></Field>
              <Field label="SEO description"><Textarea rows={3} value={form.seo_description} onChange={(event) => update('seo_description', event.target.value)} /></Field>
            </div>
          </Card>

          <Button type="submit" size="lg" className="w-full" loading={saving}><Save className="h-4 w-4" /> Simpan paket</Button>
        </aside>
      </form>
    </div>
  );
}
