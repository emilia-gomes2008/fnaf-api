import { CHARS } from "./database.js";
import { BOOKS } from "./books_database.js";
import { QUOTES } from "./quotes.js"; //[cite: 1, 2]

// ─── Data setup ───────────────────────────────────────────────────────────────

const characters = CHARS.map((char, index) => ({ id: index + 1, ...char })); //[cite: 1]
const books = BOOKS.map((book, index) => ({ id: index + 1, ...book })); //[cite: 1]
const quotes = QUOTES.map((quote, index) => ({ id: index + 1, ...quote })); //[cite: 1, 2]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
} //[cite: 1]

function matchesQuery(char, query) {
  const q = query.toLowerCase();
  return (
    char.name.toLowerCase().includes(q) ||
    char.animal.toLowerCase().includes(q) ||
    char.type.toLowerCase().includes(q) ||
    char.color.some((c) => c.toLowerCase().includes(q)) ||
    char.eyeColor.some((c) => c.toLowerCase().includes(q))
  );
} //[cite: 1]

function matchesBookQuery(book, query) {
  const q = query.toLowerCase();
  return (
    book.title.toLowerCase().includes(q) ||
    book.series.toLowerCase().includes(q) ||
    String(book.year).includes(q)
  );
} //[cite: 1]

// New helper for quotes search
function matchesQuoteQuery(quote, query) {
  const q = query.toLowerCase();
  return (
    quote.quote.toLowerCase().includes(q) ||
    quote.said.toLowerCase().includes(q)
  );
}

// ─── Response helpers ─────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
} //[cite: 1]

function notFound(msg = "Rota não encontrada. Acede a GET / para ver os endpoints disponíveis.") {
  return json({ error: msg }, 404);
} //[cite: 1]

// ─── Router ───────────────────────────────────────────────────────────────────

function matchPath(pattern, pathname) {
  if (!pattern.includes(":")) {
    return pattern === pathname ? {} : null;
  }
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
} //[cite: 1]

// ─── Handlers ─────────────────────────────────────────────────────────────────

function handleRoot() {
  const types = [...new Set(characters.map((c) => c.type))].sort();
  const animals = [...new Set(characters.map((c) => c.animal))].sort();
  const series = [...new Set(books.map((b) => b.series))].sort();

  return json({
    name: "FNaF API",
    version: "2.1.0",
    total_characters: characters.length,
    total_books: books.length,
    total_quotes: quotes.length, // Updated total[cite: 1, 2]
    character_endpoints: {
      "GET /characters": "Lista todos os personagens (com filtros opcionais)",
      "GET /characters/random": "Retorna um personagem aleatório",
      "GET /characters/:id": "Busca personagem por ID numérico",
      "GET /characters/name/:name": "Busca personagem pelo nome (slug)",
      "GET /types": "Lista todos os tipos disponíveis",
      "GET /animals": "Lista todos os animais disponíveis",
      "GET /search?q=": "Busca textual em nome, tipo, animal e cor",
    },
    book_endpoints: {
      "GET /books": "Lista todos os livros (com filtros opcionais)",
      "GET /books/random": "Retorna um livro aleatório",
      "GET /books/:id": "Busca livro por ID numérico",
      "GET /books/search?q=": "Busca textual em título, série e ano",
    },
    quote_endpoints: {
      "GET /quotes": "Lista todas as frases (filtro opcional: ?said=)",
      "GET /quotes/random": "Retorna uma frase aleatória",
      "GET /quotes/:id": "Busca frase por ID numérico",
      "GET /quotes/search?q=": "Busca textual no conteúdo da frase ou autor",
    }, // Added quote endpoints[cite: 2]
    image_endpoints: {
      "GET /images/:category/:type/:filename": "Retorna uma imagem (ex: /images/chars/classic/freddy.png)",
    },
    available_types: types,
    available_animals: animals,
    available_series: series,
  });
} //[cite: 1]

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
} //[cite: 1]

function handleCharactersRandom() {
  return json(characters[Math.floor(Math.random() * characters.length)]);
} //[cite: 1]

function handleCharacterByName({ name }) {
  const slug = name.toLowerCase();
  const char = characters.find((c) => slugify(c.name) === slug);
  if (!char) return json({ error: `Personagem "${name}" não encontrado` }, 404);
  return json(char);
} //[cite: 1]

function handleCharacterById({ id }) {
  const numId = parseInt(id);
  if (isNaN(numId)) return json({ error: "ID deve ser um número" }, 400);
  const char = characters.find((c) => c.id === numId);
  if (!char) return json({ error: `Personagem com ID ${numId} não encontrado` }, 404);
  return json(char);
} //[cite: 1]

function handleTypes() {
  const types = [...new Set(characters.map((c) => c.type))].sort();
  return json({
    total: types.length,
    types: types.map((t) => ({ name: t, slug: slugify(t), count: characters.filter((c) => c.type === t).length })),
  });
} //[cite: 1]

function handleTypeBySlug({ type }) {
  const slug = type.toLowerCase();
  const result = characters.filter((c) => slugify(c.type) === slug || c.type.toLowerCase() === slug);
  if (result.length === 0) return json({ error: `Tipo "${type}" não encontrado` }, 404);
  return json({ type: result[0].type, total: result.length, characters: result });
} //[cite: 1]

function handleAnimals() {
  const animals = [...new Set(characters.map((c) => c.animal))].sort();
  return json({
    total: animals.length,
    animals: animals.map((a) => ({ name: a, slug: slugify(a), count: characters.filter((c) => c.animal === a).length })),
  });
} //[cite: 1]

function handleAnimalBySlug({ animal }) {
  const slug = animal.toLowerCase();
  const result = characters.filter((c) => slugify(c.animal) === slug || c.animal.toLowerCase() === slug);
  if (result.length === 0) return json({ error: `Animal "${animal}" não encontrado` }, 404);
  return json({ animal: result[0].animal, total: result.length, characters: result });
} //[cite: 1]

function handleSearch(searchParams) {
  const q = searchParams.get("q");
  if (!q || q.trim() === "") return json({ error: "Parâmetro ?q= é obrigatório" }, 400);
  const result = characters.filter((c) => matchesQuery(c, q.trim()));
  return json({ query: q, total: result.length, characters: result });
} //[cite: 1]

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
} //[cite: 1]

function handleBooksRandom() {
  return json(books[Math.floor(Math.random() * books.length)]);
} //[cite: 1]

function handleBookSearch(searchParams) {
  const q = searchParams.get("q");
  if (!q || q.trim() === "") return json({ error: "Parâmetro ?q= é obrigatório" }, 400);
  const result = books.filter((b) => matchesBookQuery(b, q.trim()));
  return json({ query: q, total: result.length, books: result });
} //[cite: 1]

function handleBookById({ id }) {
  const numId = parseInt(id);
  if (isNaN(numId)) return json({ error: "ID deve ser um número" }, 400);
  const book = books.find((b) => b.id === numId);
  if (!book) return json({ error: `Livro com ID ${numId} não encontrado` }, 404);
  return json(book);
} //[cite: 1]

// ── Quotes ────────────────────────────────────────────────────────────────────

function handleQuotes(searchParams) {
  let result = [...quotes];
  const said = searchParams.get("said");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  if (said) result = result.filter((q) => q.said.toLowerCase().includes(said.toLowerCase()));

  const total = result.length;
  const off = parseInt(offset) || 0;
  const lim = parseInt(limit) || total;
  result = result.slice(off, off + lim);
  return json({ total, count: result.length, offset: off, limit: lim, quotes: result });
}

function handleQuotesRandom() {
  return json(quotes[Math.floor(Math.random() * quotes.length)]);
}

function handleQuoteById({ id }) {
  const numId = parseInt(id);
  if (isNaN(numId)) return json({ error: "ID deve ser um número" }, 400);
  const quote = quotes.find((q) => q.id === numId);
  if (!quote) return json({ error: `Frase com ID ${numId} não encontrada` }, 404);
  return json(quote);
}

function handleQuoteSearch(searchParams) {
  const q = searchParams.get("q");
  if (!q || q.trim() === "") return json({ error: "Parâmetro ?q= é obrigatório" }, 400);
  const result = quotes.filter((quote) => matchesQuoteQuery(quote, q.trim()));
  return json({ query: q, total: result.length, quotes: result });
}

// ─── Main fetch handler ───────────────────────────────────────────────────────

export default {
  fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/$/, "") || "/";
    const sp = url.searchParams;

    // Root and Static redirects
    if (pathname === "/") return handleRoot();
    if (pathname === "/docs") return Response.redirect("https://fnaf-api.pages.dev/", 301);

    // Characters
    if (pathname === "/characters") return handleCharacters(sp);
    if (pathname === "/characters/random") return handleCharactersRandom();
    if (pathname === "/search") return handleSearch(sp);
    if (pathname === "/types") return handleTypes();
    if (pathname === "/animals") return handleAnimals();

    // Books
    if (pathname === "/books") return handleBooks(sp);
    if (pathname === "/books/random") return handleBooksRandom();
    if (pathname === "/books/search") return handleBookSearch(sp);

    // Quotes[cite: 2]
    if (pathname === "/quotes") return handleQuotes(sp);
    if (pathname === "/quotes/random") return handleQuotesRandom();
    if (pathname === "/quotes/search") return handleQuoteSearch(sp);

    // Images redirect[cite: 1]
    if (pathname.startsWith("/images/")) {
      const githubBase = "https://raw.githubusercontent.com/emilia-gomes2008/fnaf-api/main";
      return Response.redirect(`${githubBase}${pathname}`, 302);
    }

    // Parametric Routes
    const quoteId = matchPath("/quotes/:id", pathname);
    if (quoteId) return handleQuoteById(quoteId);

    const bookId = matchPath("/books/:id", pathname);
    if (bookId) return handleBookById(bookId);

    const charName = matchPath("/characters/name/:name", pathname);
    if (charName) return handleCharacterByName(charName);
    
    const charId = matchPath("/characters/:id", pathname);
    if (charId) return handleCharacterById(charId);

    const typeSlug = matchPath("/types/:type", pathname);
    if (typeSlug) return handleTypeBySlug(typeSlug);

    const animalSlug = matchPath("/animals/:animal", pathname);
    if (animalSlug) return handleAnimalBySlug(animalSlug);

    return notFound();
  },
};