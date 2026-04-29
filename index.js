import { CHARS } from "./database.js";
import { BOOKS } from "./books_database.js";

// ─── Data setup ───────────────────────────────────────────────────────────────

const characters = CHARS.map((char, index) => ({ id: index + 1, ...char }));
const books = BOOKS.map((book, index) => ({ id: index + 1, ...book }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function matchesQuery(char, query) {
  const q = query.toLowerCase();
  return (
    char.name.toLowerCase().includes(q) ||
    char.animal.toLowerCase().includes(q) ||
    char.type.toLowerCase().includes(q) ||
    char.color.some((c) => c.toLowerCase().includes(q)) ||
    char.eyeColor.some((c) => c.toLowerCase().includes(q))
  );
}

function matchesBookQuery(book, query) {
  const q = query.toLowerCase();
  return (
    book.title.toLowerCase().includes(q) ||
    book.series.toLowerCase().includes(q) ||
    String(book.year).includes(q)
  );
}

// ─── Response helpers ─────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function notFound(msg = "Rota não encontrada. Acede a GET / para ver os endpoints disponíveis.") {
  return json({ error: msg }, 404);
}

// ─── Router ───────────────────────────────────────────────────────────────────

function route(pathname, method, handlers) {
  for (const [pattern, handler] of handlers) {
    const match = matchPath(pattern, pathname);
    if (match !== null) return handler(match);
  }
  return notFound();
}

function matchPath(pattern, pathname) {
  // Exact match
  if (!pattern.includes(":")) {
    return pattern === pathname ? {} : null;
  }
  // Parametric match
  const patternParts = pattern.split("/");
  const pathnameParts = pathname.split("/");
  if (patternParts.length !== pathnameParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathnameParts[i]);
    } else if (patternParts[i] !== pathnameParts[i]) {
      return null;
    }
  }
  return params;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

function handleRoot() {
  const types = [...new Set(characters.map((c) => c.type))].sort();
  const animals = [...new Set(characters.map((c) => c.animal))].sort();
  const series = [...new Set(books.map((b) => b.series))].sort();

  return json({
    name: "FNaF API",
    version: "2.0.0",
    total_characters: characters.length,
    total_books: books.length,
    character_endpoints: {
      "GET /characters": "Lista todos os personagens (com filtros opcionais)",
      "GET /characters/random": "Retorna um personagem aleatório",
      "GET /characters/:id": "Busca personagem por ID numérico",
      "GET /characters/name/:name": "Busca personagem pelo nome (slug)",
      "GET /types": "Lista todos os tipos disponíveis",
      "GET /types/:type": "Lista personagens de um tipo específico",
      "GET /animals": "Lista todos os animais disponíveis",
      "GET /animals/:animal": "Lista personagens de um animal específico",
      "GET /search?q=": "Busca textual em nome, tipo, animal e cor",
    },
    character_filters: {
      type: "Filtrar por tipo (ex: ?type=Classic)",
      animal: "Filtrar por animal (ex: ?animal=Bear)",
      color: "Filtrar por cor (ex: ?color=Blue)",
      eyeColor: "Filtrar por cor dos olhos (ex: ?eyeColor=Red)",
      year: "Filtrar por ano (ex: ?year=1987)",
      limit: "Limitar resultados (ex: ?limit=10)",
      offset: "Paginação (ex: ?offset=20)",
    },
    book_endpoints: {
      "GET /books": "Lista todos os livros (com filtros opcionais)",
      "GET /books/random": "Retorna um livro aleatório",
      "GET /books/:id": "Busca livro por ID numérico",
      "GET /books/title/:title": "Busca livro pelo título (slug)",
      "GET /books/series": "Lista todas as séries disponíveis",
      "GET /books/series/:series": "Lista livros de uma série específica",
      "GET /books/search?q=": "Busca textual em título, série e ano",
    },
    book_filters: {
      series: "Filtrar por série (ex: ?series=Trilogy)",
      year: "Filtrar por ano (ex: ?year=2019)",
      limit: "Limitar resultados (ex: ?limit=5)",
      offset: "Paginação (ex: ?offset=10)",
    },
    image_endpoints: {
      "GET /images/:category/:type/:filename": "Retorna uma imagem (ex: /images/chars/classic/freddy.png)",
    },
    available_types: types,
    available_animals: animals,
    available_series: series,
  });
}

// ── Characters ────────────────────────────────────────────────────────────────

function handleCharacters(searchParams) {
  let result = [...characters];
  const type = searchParams.get("type");
  const animal = searchParams.get("animal");
  const color = searchParams.get("color");
  const eyeColor = searchParams.get("eyeColor");
  const year = searchParams.get("year");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  if (type) result = result.filter((c) => c.type.toLowerCase() === type.toLowerCase());
  if (animal) result = result.filter((c) => c.animal.toLowerCase() === animal.toLowerCase());
  if (color) result = result.filter((c) => c.color.some((col) => col.toLowerCase() === color.toLowerCase()));
  if (eyeColor) result = result.filter((c) => c.eyeColor.some((ec) => ec.toLowerCase() === eyeColor.toLowerCase()));
  if (year) result = result.filter((c) => String(c.year) === String(year));

  const total = result.length;
  const off = parseInt(offset) || 0;
  const lim = parseInt(limit) || total;
  result = result.slice(off, off + lim);
  return json({ total, count: result.length, offset: off, limit: lim, characters: result });
}

function handleCharactersRandom() {
  return json(characters[Math.floor(Math.random() * characters.length)]);
}

function handleCharacterByName({ name }) {
  const slug = name.toLowerCase();
  const char = characters.find((c) => slugify(c.name) === slug);
  if (!char) return json({ error: `Personagem "${name}" não encontrado` }, 404);
  return json(char);
}

function handleCharacterById({ id }) {
  const numId = parseInt(id);
  if (isNaN(numId)) return json({ error: "ID deve ser um número" }, 400);
  const char = characters.find((c) => c.id === numId);
  if (!char) return json({ error: `Personagem com ID ${numId} não encontrado` }, 404);
  return json(char);
}

function handleTypes() {
  const types = [...new Set(characters.map((c) => c.type))].sort();
  return json({
    total: types.length,
    types: types.map((t) => ({ name: t, slug: slugify(t), count: characters.filter((c) => c.type === t).length })),
  });
}

function handleTypeBySlug({ type }) {
  const slug = type.toLowerCase();
  const result = characters.filter((c) => slugify(c.type) === slug || c.type.toLowerCase() === slug);
  if (result.length === 0) return json({ error: `Tipo "${type}" não encontrado` }, 404);
  return json({ type: result[0].type, total: result.length, characters: result });
}

function handleAnimals() {
  const animals = [...new Set(characters.map((c) => c.animal))].sort();
  return json({
    total: animals.length,
    animals: animals.map((a) => ({ name: a, slug: slugify(a), count: characters.filter((c) => c.animal === a).length })),
  });
}

function handleAnimalBySlug({ animal }) {
  const slug = animal.toLowerCase();
  const result = characters.filter((c) => slugify(c.animal) === slug || c.animal.toLowerCase() === slug);
  if (result.length === 0) return json({ error: `Animal "${animal}" não encontrado` }, 404);
  return json({ animal: result[0].animal, total: result.length, characters: result });
}

function handleSearch(searchParams) {
  const q = searchParams.get("q");
  if (!q || q.trim() === "") return json({ error: "Parâmetro ?q= é obrigatório" }, 400);
  const result = characters.filter((c) => matchesQuery(c, q.trim()));
  return json({ query: q, total: result.length, characters: result });
}

// ── Books ─────────────────────────────────────────────────────────────────────

function handleBooks(searchParams) {
  let result = [...books];
  const series = searchParams.get("series");
  const year = searchParams.get("year");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  if (series) result = result.filter((b) => b.series.toLowerCase() === series.toLowerCase());
  if (year) result = result.filter((b) => String(b.year) === String(year));

  const total = result.length;
  const off = parseInt(offset) || 0;
  const lim = parseInt(limit) || total;
  result = result.slice(off, off + lim);
  return json({ total, count: result.length, offset: off, limit: lim, books: result });
}

function handleBooksRandom() {
  return json(books[Math.floor(Math.random() * books.length)]);
}

function handleBookSeries() {
  const series = [...new Set(books.map((b) => b.series))].sort();
  return json({
    total: series.length,
    series: series.map((s) => ({ name: s, slug: slugify(s), count: books.filter((b) => b.series === s).length })),
  });
}

function handleBookSeriesBySlug({ series }) {
  const slug = series.toLowerCase();
  const result = books.filter((b) => slugify(b.series) === slug || b.series.toLowerCase() === slug);
  if (result.length === 0) return json({ error: `Série "${series}" não encontrada` }, 404);
  return json({ series: result[0].series, total: result.length, books: result });
}

function handleBookByTitle({ title }) {
  const slug = title.toLowerCase();
  const book = books.find((b) => slugify(b.title) === slug);
  if (!book) return json({ error: `Livro "${title}" não encontrado` }, 404);
  return json(book);
}

function handleBookSearch(searchParams) {
  const q = searchParams.get("q");
  if (!q || q.trim() === "") return json({ error: "Parâmetro ?q= é obrigatório" }, 400);
  const result = books.filter((b) => matchesBookQuery(b, q.trim()));
  return json({ query: q, total: result.length, books: result });
}

function handleBookById({ id }) {
  const numId = parseInt(id);
  if (isNaN(numId)) return json({ error: "ID deve ser um número" }, 400);
  const book = books.find((b) => b.id === numId);
  if (!book) return json({ error: `Livro com ID ${numId} não encontrado` }, 404);
  return json(book);
}

// ─── Main fetch handler ───────────────────────────────────────────────────────

export default {
  fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/$/, "") || "/";
    const sp = url.searchParams;

    // Characters — ordem importa (rotas fixas antes das parametrizadas)
    if (pathname === "/") {
      const accept = request.headers.get("Accept") || "";
      if (accept.includes("text/html")) {
        return Response.redirect("https://fnaf-api.pages.dev/", 301);
      }
      return handleRoot();
    }
    if (pathname === "/docs") return Response.redirect("https://fnaf-api.pages.dev/", 301);
    if (pathname === "/characters") return handleCharacters(sp);
    if (pathname === "/characters/random") return handleCharactersRandom();
    if (pathname === "/search") return handleSearch(sp);
    if (pathname === "/types") return handleTypes();
    if (pathname === "/animals") return handleAnimals();
    if (pathname === "/books") return handleBooks(sp);
    if (pathname === "/books/random") return handleBooksRandom();
    if (pathname === "/books/series") return handleBookSeries();
    if (pathname === "/books/search") return handleBookSearch(sp);

    // ── Imagens (redirect para GitHub raw) ───────────────────────────────────
    if (pathname.startsWith("/images/")) {
      const githubBase = "https://raw.githubusercontent.com/emilia-gomes2008/fnaf-api/main";
      return Response.redirect(`${githubBase}${pathname}`, 302);
    }

    // Books — parametrizadas
    const bookTitle = matchPath("/books/title/:title", pathname);
    if (bookTitle) return handleBookByTitle(bookTitle);
    const bookSeries = matchPath("/books/series/:series", pathname);
    if (bookSeries) return handleBookSeriesBySlug(bookSeries);
    const bookId = matchPath("/books/:id", pathname);
    if (bookId) return handleBookById(bookId);

    // Characters — parametrizadas
    const charName = matchPath("/characters/name/:name", pathname);
    if (charName) return handleCharacterByName(charName);
    const typeSlug = matchPath("/types/:type", pathname);
    if (typeSlug) return handleTypeBySlug(typeSlug);
    const animalSlug = matchPath("/animals/:animal", pathname);
    if (animalSlug) return handleAnimalBySlug(animalSlug);
    const charId = matchPath("/characters/:id", pathname);
    if (charId) return handleCharacterById(charId);

    return notFound();
  },
};