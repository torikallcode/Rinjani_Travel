import { useCallback, useEffect, useState } from 'react';
import { FileText, HelpCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert, Badge, Button, Field, Input, Modal, PageHeader, Select, Textarea } from '../../components/ui/primitives';
import { DataTable, DateTimeCell } from './AdminShared';

const emptyPage = { slug: '', title: '', content: '', meta_title: '', meta_description: '', status: 'published' };
const emptyFaq = { question: '', answer: '', category: 'umum', sort_order: 0, published: true };

export default function AdminContentPage() {
  const { user } = useAuth();
  const canManage = ['admin_content', 'super_admin'].includes(user?.role);
  const [tab, setTab] = useState('pages');
  const [pages, setPages] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPage);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pageData, faqData] = await Promise.all([
        api.get('/admin/content'),
        api.get('/admin/faqs?all=true'),
      ]);
      setPages(pageData?.items || []);
      setFaqs(faqData?.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openPage = (page = null) => {
    setEditing(page);
    setForm(page ? { ...emptyPage, ...page } : emptyPage);
    setFormError('');
    setModal('page');
  };

  const openFaq = (faq = null) => {
    setEditing(faq);
    setForm(faq ? { ...emptyFaq, ...faq } : emptyFaq);
    setFormError('');
    setModal('faq');
  };

  const savePage = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editing) await api.put(`/admin/content/${editing.id}`, form);
      else await api.post('/admin/content', form);
      setMessage(editing ? 'Halaman diperbarui.' : 'Halaman dibuat.');
      setModal(null);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveFaq = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
      if (editing) await api.put(`/admin/faqs/${editing.id}`, payload);
      else await api.post('/admin/faqs', payload);
      setMessage(editing ? 'FAQ diperbarui.' : 'FAQ dibuat.');
      setModal(null);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removePage = async (page) => {
    if (!window.confirm(`Hapus halaman "${page.title}"?`)) return;
    setDeleting(page.id);
    try {
      await api.delete(`/admin/content/${page.id}`);
      setMessage('Halaman dihapus.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(0);
    }
  };

  const removeFaq = async (faq) => {
    if (!window.confirm('Hapus FAQ ini?')) return;
    setDeleting(faq.id);
    try {
      await api.delete(`/admin/faqs/${faq.id}`);
      setMessage('FAQ dihapus.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(0);
    }
  };

  const pageColumns = [
    { key: 'title', header: 'Halaman', render: (row) => <div><p className="text-sm font-semibold text-ink">{row.title}</p><p className="text-[11px] text-ink/45">/{row.slug}</p></div> },
    { key: 'meta', header: 'Meta description', render: (row) => <span className="line-clamp-2 max-w-sm text-xs text-ink/55">{row.meta_description || '-'}</span> },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'published' ? 'success' : 'warning'}>{row.status}</Badge> },
    { key: 'updated_at', header: 'Diperbarui', render: (row) => <DateTimeCell value={row.updated_at} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) =>
        canManage ? (
          <div className="flex justify-end gap-1.5">
            <button onClick={() => openPage(row)} className="rounded-lg border border-ink/15 p-2 text-ink/60 hover:text-biru-0"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => removePage(row)} disabled={deleting === row.id} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ) : null,
    },
  ];

  const faqColumns = [
    { key: 'question', header: 'Pertanyaan', render: (row) => <div><p className="text-sm font-semibold text-ink">{row.question}</p><p className="line-clamp-2 max-w-md text-xs text-ink/55">{row.answer}</p></div> },
    { key: 'category', header: 'Kategori', render: (row) => <Badge tone="neutral">{row.category}</Badge> },
    { key: 'sort_order', header: 'Urutan', render: (row) => <span className="text-xs text-ink/55">{row.sort_order}</span> },
    { key: 'published', header: 'Status', render: (row) => <Badge tone={row.published ? 'success' : 'neutral'}>{row.published ? 'Tampil' : 'Disembunyikan'}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) =>
        canManage ? (
          <div className="flex justify-end gap-1.5">
            <button onClick={() => openFaq(row)} className="rounded-lg border border-ink/15 p-2 text-ink/60 hover:text-biru-0"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => removeFaq(row)} disabled={deleting === row.id} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="CMS"
        title="Konten & FAQ"
        description="Kelola halaman statis publik dan pertanyaan umum yang tampil di situs."
        actions={
          canManage && (
            <Button onClick={() => (tab === 'pages' ? openPage() : openFaq())}>
              <Plus className="h-4 w-4" /> {tab === 'pages' ? 'Halaman baru' : 'FAQ baru'}
            </Button>
          )
        }
      />

      {message && <Alert tone="success" className="mt-4">{message}</Alert>}
      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}

      <div className="mt-5 flex gap-2">
        <button onClick={() => setTab('pages')} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'pages' ? 'bg-hitam-0 text-white' : 'border border-ink/10 bg-surface text-ink/60'}`}>
          <FileText className="h-4 w-4" /> Halaman
        </button>
        <button onClick={() => setTab('faqs')} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'faqs' ? 'bg-hitam-0 text-white' : 'border border-ink/10 bg-surface text-ink/60'}`}>
          <HelpCircle className="h-4 w-4" /> FAQ
        </button>
      </div>

      <div className="mt-4">
        {tab === 'pages' ? (
          <DataTable columns={pageColumns} rows={pages} loading={loading} empty="Belum ada halaman konten." />
        ) : (
          <DataTable columns={faqColumns} rows={faqs} loading={loading} empty="Belum ada FAQ." />
        )}
      </div>

      <Modal
        open={modal === 'page'}
        onClose={() => setModal(null)}
        title={editing ? 'Edit Halaman' : 'Halaman Baru'}
        wide
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Batal</Button><Button type="submit" form="page-form" loading={saving}>Simpan</Button></>}
      >
        {formError && <Alert tone="danger" className="mb-4">{formError}</Alert>}
        <form id="page-form" onSubmit={savePage} className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul" required className="sm:col-span-2"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></Field>
          <Field label="Slug" hint="Kosongkan untuk otomatis dari judul."><Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="tentang-kami" /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </Field>
          <Field label="Konten (HTML)" className="sm:col-span-2">
            <Textarea rows={12} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className="font-mono text-xs" />
          </Field>
          <Field label="Meta title"><Input value={form.meta_title} onChange={(event) => setForm({ ...form, meta_title: event.target.value })} /></Field>
          <Field label="Meta description"><Input value={form.meta_description} onChange={(event) => setForm({ ...form, meta_description: event.target.value })} /></Field>
        </form>
      </Modal>

      <Modal
        open={modal === 'faq'}
        onClose={() => setModal(null)}
        title={editing ? 'Edit FAQ' : 'FAQ Baru'}
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Batal</Button><Button type="submit" form="faq-form" loading={saving}>Simpan</Button></>}
      >
        {formError && <Alert tone="danger" className="mb-4">{formError}</Alert>}
        <form id="faq-form" onSubmit={saveFaq} className="grid gap-4 sm:grid-cols-2">
          <Field label="Pertanyaan" required className="sm:col-span-2"><Input value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} required /></Field>
          <Field label="Jawaban" required className="sm:col-span-2"><Textarea rows={4} value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} required /></Field>
          <Field label="Kategori"><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></Field>
          <Field label="Urutan"><Input type="number" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: event.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm text-ink/70 sm:col-span-2">
            <input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} className="h-4 w-4 rounded border-ink/30 text-biru-0" />
            Tampilkan di situs publik
          </label>
        </form>
      </Modal>
    </div>
  );
}
