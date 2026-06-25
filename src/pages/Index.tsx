import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const API_URL = 'https://functions.poehali.dev/168ccdf1-ea45-4c6f-a234-4e0638117526';

interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string;
  rating: number;
  duration: string;
  poster: string;
  actors: string[];
  description: string;
  trailerId: string;
}

const Index = () => {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Все');
  const [minRating, setMinRating] = useState(0);
  const [selected, setSelected] = useState<Movie | null>(null);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [featured, setFeatured] = useState<Movie | null>(null);
  const [genres, setGenres] = useState<string[]>(['Все']);

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (genre !== 'Все') params.set('genre', genre);
      if (minRating > 0) params.set('min_rating', String(minRating));

      fetch(`${API_URL}?${params.toString()}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((data) => {
          setMovies(data.movies || []);
          if (data.featured) setFeatured(data.featured);
          if (data.genres) setGenres(data.genres);
        })
        .catch(() => {});
    }, 300);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [search, genre, minRating]);

  const filtered = movies;
  const GENRES = genres;

  return (
    <div className="min-h-screen bg-background grain">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Icon name="Clapperboard" className="text-primary" size={26} />
            <span className="font-display font-700 text-2xl tracking-widest">CINE<span className="text-primary">ORBIT</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-display text-sm tracking-wider text-muted-foreground">
            <a href="#catalog" className="hover:text-primary transition-colors">КАТАЛОГ</a>
            <a href="#catalog" className="hover:text-primary transition-colors">ЖАНРЫ</a>
            <a href="#catalog" className="hover:text-primary transition-colors">НОВИНКИ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="font-display tracking-wider text-muted-foreground hover:text-primary">
                <Icon name="Settings" size={16} className="mr-2" />АДМИН
              </Button>
            </Link>
            <Button variant="outline" className="font-display tracking-wider border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground">
              <Icon name="User" size={16} className="mr-2" />ВОЙТИ
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      {featured && (
      <section className="relative h-[88vh] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={featured.poster} alt={featured.title} className="w-full h-full object-cover animate-ken-burns" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent" />
        </div>

        <div className="container relative h-full flex flex-col justify-end pb-20">
          <div className="max-w-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4 font-display tracking-widest text-sm">
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded-sm">ФИЛЬМ НЕДЕЛИ</span>
              <span className="flex items-center gap-1 text-primary"><Icon name="Star" size={16} className="fill-primary" />{featured.rating}</span>
              <span className="text-muted-foreground">{featured.year} · {featured.duration}</span>
            </div>
            <h1 className="font-display font-700 text-6xl md:text-7xl leading-none mb-4 text-shadow-cinema uppercase">{featured.title}</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl">{featured.description}</p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => setSelected(featured)} className="font-display tracking-wider text-base h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                <Icon name="Play" size={20} className="mr-2 fill-current" />СМОТРЕТЬ ТРЕЙЛЕР
              </Button>
              <Button size="lg" variant="outline" onClick={() => setSelected(featured)} className="font-display tracking-wider text-base h-12 px-8 border-foreground/30 hover:bg-foreground/10">
                <Icon name="Info" size={20} className="mr-2" />ПОДРОБНЕЕ
              </Button>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Search & Filters */}
      <section id="catalog" className="container py-12">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-10">
          <div className="flex-1">
            <h2 className="font-display font-700 text-4xl uppercase tracking-wide mb-1">Каталог</h2>
            <p className="text-muted-foreground">Найди фильм по названию, жанру или актёру</p>
          </div>
          <div className="relative w-full lg:w-96">
            <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск фильмов..."
              className="pl-11 h-12 bg-card border-border text-base"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-10">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`font-display tracking-wider text-sm px-5 py-2 rounded-full border transition-all ${
                genre === g
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {g.toUpperCase()}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto bg-card border border-border rounded-full px-4 py-1.5">
            <Icon name="Star" size={16} className="text-primary fill-primary" />
            <span className="text-sm text-muted-foreground font-display tracking-wider">ОТ {minRating.toFixed(1)}</span>
            <input
              type="range" min={0} max={9} step={0.5}
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-28 accent-primary"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Icon name="FilmSlate" fallback="Film" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-display tracking-wider text-lg">НИЧЕГО НЕ НАЙДЕНО</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group text-left animate-scale-in opacity-0"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 border border-border">
                  <img src={m.poster} alt={m.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-display">
                    <Icon name="Star" size={12} className="text-primary fill-primary" />{m.rating}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center">
                      <Icon name="Play" size={24} className="text-primary-foreground fill-current ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="font-display font-600 text-lg leading-tight tracking-wide group-hover:text-primary transition-colors uppercase">{m.title}</h3>
                <p className="text-muted-foreground text-sm">{m.genre} · {m.year}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Icon name="Clapperboard" className="text-primary" size={20} />
            <span className="font-display tracking-widest">CINEORBIT © 2024</span>
          </div>
          <p>Поиск фильмов · Трейлеры · Просмотр онлайн</p>
        </div>
      </footer>

      {/* Movie Dialog with trailer */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl bg-card border-border p-0 overflow-hidden">
          {selected && (
            <div>
              <DialogTitle className="sr-only">{selected.title}</DialogTitle>
              <div className="aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${selected.trailerId}`}
                  title={selected.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3 font-display tracking-wider text-sm">
                  <span className="flex items-center gap-1 text-primary"><Icon name="Star" size={16} className="fill-primary" />{selected.rating}</span>
                  <span className="text-muted-foreground">{selected.year} · {selected.duration} · {selected.genre}</span>
                </div>
                <h2 className="font-display font-700 text-3xl uppercase tracking-wide mb-3">{selected.title}</h2>
                <p className="text-muted-foreground mb-4">{selected.description}</p>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-sm text-muted-foreground font-display tracking-wider">В РОЛЯХ:</span>
                  {selected.actors.map((a) => (
                    <span key={a} className="text-sm px-3 py-1 bg-secondary rounded-full">{a}</span>
                  ))}
                </div>
                <Button size="lg" className="font-display tracking-wider bg-primary text-primary-foreground hover:bg-primary/90">
                  <Icon name="Play" size={20} className="mr-2 fill-current" />СМОТРЕТЬ ФИЛЬМ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;