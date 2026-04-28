const express = require("express");
const { CHARS } = require("./database");
const { BOOKS } = require("./books_database");

const app = express();
const PORT = process.env.PORT || 3000;

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

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

app.use('/images', express.static('images'));

// ─── Root ─────────────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  const types   = [...new Set(characters.map((c) => c.type))].sort();
  const animals = [...new Set(characters.map((c) => c.animal))].sort();
  const series  = [...new Set(books.map((b) => b.series))].sort();

  res.json({
    name: "FNaF API",
    version: "2.0.0",
    total_characters: characters.length,
    total_books: books.length,
    character_endpoints: {
      "GET /characters":            "Lista todos os personagens (com filtros opcionais)",
      "GET /characters/random":     "Retorna um personagem aleatório",
      "GET /characters/:id":        "Busca personagem por ID numérico",
      "GET /characters/name/:name": "Busca personagem pelo nome (slug)",
      "GET /types":                 "Lista todos os tipos disponíveis",
      "GET /types/:type":           "Lista personagens de um tipo específico",
      "GET /animals":               "Lista todos os animais disponíveis",
      "GET /animals/:animal":       "Lista personagens de um animal específico",
      "GET /search?q=":            "Busca textual em nome, tipo, animal e cor",
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
      "GET /books":                "Lista todos os livros (com filtros opcionais)",
      "GET /books/random":         "Retorna um livro aleatório",
      "GET /books/:id":            "Busca livro por ID numérico",
      "GET /books/title/:title":   "Busca livro pelo título (slug)",
      "GET /books/series":         "Lista todas as séries disponíveis",
      "GET /books/series/:series": "Lista livros de uma série específica",
      "GET /books/search?q=":     "Busca textual em título, série e ano",
    },
    book_filters: {
      series: "Filtrar por série (ex: ?series=Trilogy)",
      year: "Filtrar por ano (ex: ?year=2019)",
      limit: "Limitar resultados (ex: ?limit=5)",
      offset: "Paginação (ex: ?offset=10)",
    },
    available_types: types,
    available_animals: animals,
    available_series: series,
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTER ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get("/characters", (req, res) => {
  let result = [...characters];
  const { type, animal, color, eyeColor, year, limit, offset } = req.query;
  if (type)     result = result.filter((c) => c.type.toLowerCase() === type.toLowerCase());
  if (animal)   result = result.filter((c) => c.animal.toLowerCase() === animal.toLowerCase());
  if (color)    result = result.filter((c) => c.color.some((col) => col.toLowerCase() === color.toLowerCase()));
  if (eyeColor) result = result.filter((c) => c.eyeColor.some((ec) => ec.toLowerCase() === eyeColor.toLowerCase()));
  if (year)     result = result.filter((c) => String(c.year) === String(year));
  const total = result.length;
  const off = parseInt(offset) || 0;
  const lim = parseInt(limit) || total;
  result = result.slice(off, off + lim);
  res.json({ total, count: result.length, offset: off, limit: lim, characters: result });
});

app.get("/characters/random", (req, res) => {
  res.json(characters[Math.floor(Math.random() * characters.length)]);
});

// Tem de vir ANTES de /characters/:id
app.get("/characters/name/:name", (req, res) => {
  const slug = req.params.name.toLowerCase();
  const char = characters.find((c) => slugify(c.name) === slug);
  if (!char) return res.status(404).json({ error: `Personagem "${req.params.name}" não encontrado` });
  res.json(char);
});

app.get("/characters/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID deve ser um número" });
  const char = characters.find((c) => c.id === id);
  if (!char) return res.status(404).json({ error: `Personagem com ID ${id} não encontrado` });
  res.json(char);
});

app.get("/types", (req, res) => {
  const types = [...new Set(characters.map((c) => c.type))].sort();
  res.json({
    total: types.length,
    types: types.map((t) => ({ name: t, slug: slugify(t), count: characters.filter((c) => c.type === t).length })),
  });
});

app.get("/types/:type", (req, res) => {
  const type = req.params.type.toLowerCase();
  const result = characters.filter((c) => slugify(c.type) === type || c.type.toLowerCase() === type);
  if (result.length === 0) return res.status(404).json({ error: `Tipo "${req.params.type}" não encontrado` });
  res.json({ type: result[0].type, total: result.length, characters: result });
});

app.get("/animals", (req, res) => {
  const animals = [...new Set(characters.map((c) => c.animal))].sort();
  res.json({
    total: animals.length,
    animals: animals.map((a) => ({ name: a, slug: slugify(a), count: characters.filter((c) => c.animal === a).length })),
  });
});

app.get("/animals/:animal", (req, res) => {
  const animal = req.params.animal.toLowerCase();
  const result = characters.filter((c) => slugify(c.animal) === animal || c.animal.toLowerCase() === animal);
  if (result.length === 0) return res.status(404).json({ error: `Animal "${req.params.animal}" não encontrado` });
  res.json({ animal: result[0].animal, total: result.length, characters: result });
});

app.get("/search", (req, res) => {
  const q = req.query.q;
  if (!q || q.trim() === "") return res.status(400).json({ error: "Parâmetro ?q= é obrigatório" });
  const result = characters.filter((c) => matchesQuery(c, q.trim()));
  res.json({ query: q, total: result.length, characters: result });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BOOK ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get("/books", (req, res) => {
  let result = [...books];
  const { series, year, limit, offset } = req.query;
  if (series) result = result.filter((b) => b.series.toLowerCase() === series.toLowerCase());
  if (year)   result = result.filter((b) => String(b.year) === String(year));
  const total = result.length;
  const off = parseInt(offset) || 0;
  const lim = parseInt(limit) || total;
  result = result.slice(off, off + lim);
  res.json({ total, count: result.length, offset: off, limit: lim, books: result });
});

app.get("/books/random", (req, res) => {
  res.json(books[Math.floor(Math.random() * books.length)]);
});

// Tem de vir ANTES de /books/:id e /books/series/:series
app.get("/books/series", (req, res) => {
  const series = [...new Set(books.map((b) => b.series))].sort();
  res.json({
    total: series.length,
    series: series.map((s) => ({ name: s, slug: slugify(s), count: books.filter((b) => b.series === s).length })),
  });
});

app.get("/books/series/:series", (req, res) => {
  const series = req.params.series.toLowerCase();
  const result = books.filter((b) => slugify(b.series) === series || b.series.toLowerCase() === series);
  if (result.length === 0) return res.status(404).json({ error: `Série "${req.params.series}" não encontrada` });
  res.json({ series: result[0].series, total: result.length, books: result });
});

app.get("/books/title/:title", (req, res) => {
  const slug = req.params.title.toLowerCase();
  const book = books.find((b) => slugify(b.title) === slug);
  if (!book) return res.status(404).json({ error: `Livro "${req.params.title}" não encontrado` });
  res.json(book);
});

app.get("/books/search", (req, res) => {
  const q = req.query.q;
  if (!q || q.trim() === "") return res.status(400).json({ error: "Parâmetro ?q= é obrigatório" });
  const result = books.filter((b) => matchesBookQuery(b, q.trim()));
  res.json({ query: q, total: result.length, books: result });
});

app.get("/books/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID deve ser um número" });
  const book = books.find((b) => b.id === id);
  if (!book) return res.status(404).json({ error: `Livro com ID ${id} não encontrado` });
  res.json(book);
});

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada. Acede a GET / para ver os endpoints disponíveis." });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🎮 FNaF API rodando em http://localhost:${PORT}`);
  console.log(`👾 ${characters.length} personagens carregados`);
  console.log(`📚 ${books.length} livros carregados`);
});

module.exports = app;
