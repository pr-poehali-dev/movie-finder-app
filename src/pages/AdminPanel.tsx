import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const API_URL = 'https://functions.poehali.dev/b566833e-3ef0-4027-b1db-c80c6628503c';

interface Movie {
  id?: number;
  title: string;
  year: number;
  genre: string;
  rating: number;
  duration: string;
  poster: string;
  actors: string[];
  description: string;
  trailerId: string;
  featured: boolean;
}

const EMPTY: Movie = {
  title: '', year: 2024, genre: '', rating: 8.0,
  duration: '', poster: '', actors: [], description: '',
  trailerId: '', featured: false,
};

const GENRES = ['Фантастика', 'Драма', 'Триллер', 'Комедия', 'Боевик', 'Анимация', 'Документальный'];

export default function AdminPanel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Movie>(EMPTY);
  const [actorsInput, setActorsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    fetch(API_URL)
      .then((r) => r.json())
      .then((d) => setMovies(d.movies || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(EMPTY);
    setActorsInput('');
    setDialogOpen(true);
  };

  const openEdit = (m: Movie) => {
    setForm({ ...m });
    setActorsInput((m.actors || []).join(', '));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, actors: actorsInput.split(',').map((a) => a.trim()).filter(Boolean) };
    const isEdit = !!form.id;
    const url = isEdit ? `${API_URL}/${form.id}` : API_URL;
    await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот фильм?')) return;
    setDeleting(id);
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    setDeleting(null);
    load();
  };

  const set = (k: keyof Movie, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const filtered = movies.filter((m) =>
    !search || m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-40 backdrop-blur-md bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ArrowLeft" size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <Icon name="Clapperboard" className="text-primary" size={22} />
              <span className="font-display text-xl tracking-widest">CINE<span className="text-primary">ORBIT</span></span>
              <span className="text-muted-foreground font-display text-sm tracking-wider ml-2">/ АДМИН</span>
            </div>
          </div>
          <Button onClick={openAdd} className="font-display tracking-wider bg-primary text-primary-foreground hover:bg-primary/90">
            <Icon name="Plus" size={16} className="mr-2" />ДОБАВИТЬ ФИЛЬМ
          </Button>
        </div>
      </header>

      <main className="container py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Всего фильмов', value: movies.length, icon: 'Film' },
            { label: 'Фильм недели', value: movies.filter((m) => m.featured).length, icon: 'Star' },
            { label: 'Средний рейтинг', value: movies.length ? (movies.reduce((s, m) => s + m.rating, 0) / movies.length).toFixed(1) : '—', icon: 'TrendingUp' },
            { label: 'Жанров', value: new Set(movies.map((m) => m.genre)).size, icon: 'Tag' },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">{s.label}</span>
                <Icon name={s.icon} fallback="Film" size={18} className="text-primary" />
              </div>
              <div className="font-display text-3xl font-600">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию..." className="pl-9" />
          </div>
          <span className="text-sm text-muted-foreground">{filtered.length} фильм(ов)</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="Loader" size={36} className="mx-auto mb-4 animate-spin opacity-50" />
            <p className="font-display tracking-wider">ЗАГРУЗКА...</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-muted-foreground text-sm font-display tracking-wider font-normal">ПОСТЕР</th>
                  <th className="text-left px-5 py-3 text-muted-foreground text-sm font-display tracking-wider font-normal">НАЗВАНИЕ</th>
                  <th className="text-left px-5 py-3 text-muted-foreground text-sm font-display tracking-wider font-normal hidden md:table-cell">ЖАНР</th>
                  <th className="text-left px-5 py-3 text-muted-foreground text-sm font-display tracking-wider font-normal hidden md:table-cell">РЕЙТИНГ</th>
                  <th className="text-left px-5 py-3 text-muted-foreground text-sm font-display tracking-wider font-normal hidden lg:table-cell">ГОД</th>
                  <th className="text-right px-5 py-3 text-muted-foreground text-sm font-display tracking-wider font-normal">ДЕЙСТВИЯ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.id} className={`border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}>
                    <td className="px-5 py-3">
                      <div className="w-10 h-14 rounded overflow-hidden bg-muted">
                        {m.poster && <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-500 tracking-wide">{m.title}</span>
                        {m.featured && <Icon name="Star" size={14} className="text-primary fill-primary" />}
                      </div>
                      <div className="text-muted-foreground text-xs mt-0.5">{(m.actors || []).slice(0, 2).join(', ')}</div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-sm px-3 py-1 bg-secondary rounded-full">{m.genre}</span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-primary font-display">
                        <Icon name="Star" size={13} className="fill-primary" />{m.rating}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-muted-foreground">{m.year}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(m)} className="h-8 px-3">
                          <Icon name="Pencil" size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(m.id!)} disabled={deleting === m.id} className="h-8 px-3 text-destructive hover:text-destructive">
                          {deleting === m.id ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Trash2" size={14} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-16 text-muted-foreground">Фильмы не найдены</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogTitle className="font-display text-2xl tracking-wide uppercase">
            {form.id ? 'Редактировать фильм' : 'Добавить фильм'}
          </DialogTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground font-display tracking-wider mb-1 block">НАЗВАНИЕ *</label>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Название фильма" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground font-display tracking-wider mb-1 block">ГОД</label>
              <Input type="number" value={form.year} onChange={(e) => set('year', Number(e.target.value))} placeholder="2024" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground font-display tracking-wider mb-1 block">РЕЙТИНГ (0–10)</label>
              <Input type="number" step="0.1" min="0" max="10" value={form.rating} onChange={(e) => set('rating', Number(e.target.value))} />
            </div>

            <div>
              <label className="text-sm text-muted-foreground font-display tracking-wider mb-1 block">ЖАНР</label>
              <select
                value={form.genre}
                onChange={(e) => set('genre', e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm text-foreground"
              >
                <option value="">Выбрать жанр...</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground font-display tracking-wider mb-1 block">ПРОДОЛЖИТЕЛЬНОСТЬ</label>
              <Input value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="2ч 15м" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground font-display tracking-wider mb-1 block">ПОСТЕР (URL)</label>
              <Input value={form.poster} onChange={(e) => set('poster', e.target.value)} placeholder="https://..." />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground font-display tracking-wider mb-1 block">ID ТРЕЙЛЕРА (YouTube)</label>
              <Input value={form.trailerId} onChange={(e) => set('trailerId', e.target.value)} placeholder="dQw4w9WgXcQ" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground font-display tracking-wider mb-1 block">АКТЁРЫ (через запятую)</label>
              <Input value={actorsInput} onChange={(e) => setActorsInput(e.target.value)} placeholder="Имя Фамилия, Имя Фамилия" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground font-display tracking-wider mb-1 block">ОПИСАНИЕ</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                placeholder="Краткое описание фильма..."
                className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm text-foreground resize-none"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <label htmlFor="featured" className="text-sm cursor-pointer">
                <span className="font-display tracking-wider">ФИЛЬМ НЕДЕЛИ</span>
                <span className="text-muted-foreground ml-2">(показывается на главном экране)</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {form.poster && (
            <div className="mt-4 p-3 bg-secondary/30 rounded-lg flex items-center gap-4">
              <img src={form.poster} alt="preview" className="w-12 h-16 object-cover rounded" />
              <div>
                <div className="font-display tracking-wide">{form.title || 'Название фильма'}</div>
                <div className="text-muted-foreground text-sm">{form.genre} · {form.year} · {form.rating}/10</div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} disabled={saving || !form.title} className="flex-1 font-display tracking-wider bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? <Icon name="Loader" size={16} className="mr-2 animate-spin" /> : <Icon name="Check" size={16} className="mr-2" />}
              {form.id ? 'СОХРАНИТЬ' : 'ДОБАВИТЬ'}
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-display tracking-wider">
              ОТМЕНА
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}