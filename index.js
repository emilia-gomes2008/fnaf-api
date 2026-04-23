const express = require("express");
const { CHARS } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Add an id to each character
const characters = CHARS.map((char, index) => ({ id: index + 1, ...char }));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
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

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /
 * Info sobre a API
 */
app.get("/", (req, res) => {
  const types = [...new Set(characters.map((c) => c.type))].sort();
  const animals = [...new Set(characters.map((c) => c.animal))].sort();

  res.json({
    name: "FNaF Characters API",
    version: "1.0.0",
    total_characters: characters.length,
    endpoints: {
      "GET /characters": "Lista todos os personagens (com filtros opcionais)",
      "GET /characters/:id": "Busca personagem por ID numérico",
      "GET /characters/name/:name": "Busca personagem pelo nome (slug)",
      "GET /characters/random": "Retorna um personagem aleatório",
      "GET /types": "Lista todos os tipos disponíveis",
      "GET /types/:type": "Lista personagens de um tipo específico",
      "GET /animals": "Lista todos os animais disponíveis",
      "GET /animals/:animal": "Lista personagens de um animal específico",
      "GET /search?q=": "Busca textual em nome, tipo, animal e cor",
    },
    filters_on_GET_characters: {
      type: "Filtrar por tipo (ex: ?type=Classic)",
      animal: "Filtrar por animal (ex: ?animal=Bear)",
      color: "Filtrar por cor (ex: ?color=Blue)",
      eyeColor: "Filtrar por cor dos olhos (ex: ?eyeColor=Red)",
      year: "Filtrar por ano (ex: ?year=1987)",
      limit: "Limitar resultados (ex: ?limit=10)",
      offset: "Paginação (ex: ?offset=20)",
    },
    available_types: types,
    available_animals: animals,
  });
});

/**
 * GET /characters
 * Lista todos os personagens com filtros opcionais
 */
app.get("/characters", (req, res) => {
  let result = [...characters];

  const { type, animal, color, eyeColor, year, limit, offset } = req.query;

  if (type) result = result.filter((c) => c.type.toLowerCase() === type.toLowerCase());
  if (animal) result = result.filter((c) => c.animal.toLowerCase() === animal.toLowerCase());
  if (color) result = result.filter((c) => c.color.some((col) => col.toLowerCase() === color.toLowerCase()));
  if (eyeColor) result = result.filter((c) => c.eyeColor.some((ec) => ec.toLowerCase() === eyeColor.toLowerCase()));
  if (year) result = result.filter((c) => String(c.year) === String(year));

  const total = result.length;
  const off = parseInt(offset) || 0;
  const lim = parseInt(limit) || total;
  result = result.slice(off, off + lim);

  res.json({
    total,
    count: result.length,
    offset: off,
    limit: lim,
    characters: result,
  });
});

/**
 * GET /characters/random
 * Retorna um personagem aleatório
 */
app.get("/characters/random", (req, res) => {
  const char = characters[Math.floor(Math.random() * characters.length)];
  res.json(char);
});

/**
 * GET /characters/:id
 * Busca por ID numérico
 */
app.get("/characters/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID deve ser um número" });

  const char = characters.find((c) => c.id === id);
  if (!char) return res.status(404).json({ error: `Personagem com ID ${id} não encontrado` });

  res.json(char);
});

/**
 * GET /characters/name/:name
 * Busca por nome (slug, ex: freddy-fazbear)
 */
app.get("/characters/name/:name", (req, res) => {
  const slug = req.params.name.toLowerCase();
  const char = characters.find((c) => slugify(c.name) === slug);
  if (!char) return res.status(404).json({ error: `Personagem "${req.params.name}" não encontrado` });
  res.json(char);
});

/**
 * GET /types
 * Lista todos os tipos únicos
 */
app.get("/types", (req, res) => {
  const types = [...new Set(characters.map((c) => c.type))].sort();
  res.json({
    total: types.length,
    types: types.map((t) => ({
      name: t,
      slug: slugify(t),
      count: characters.filter((c) => c.type === t).length,
    })),
  });
});

/**
 * GET /types/:type
 * Lista personagens de um tipo específico
 */
app.get("/types/:type", (req, res) => {
  const type = req.params.type.toLowerCase();
  const result = characters.filter((c) => slugify(c.type) === type || c.type.toLowerCase() === type);
  if (result.length === 0) return res.status(404).json({ error: `Tipo "${req.params.type}" não encontrado` });
  res.json({ type: result[0].type, total: result.length, characters: result });
});

/**
 * GET /animals
 * Lista todos os animais únicos
 */
app.get("/animals", (req, res) => {
  const animals = [...new Set(characters.map((c) => c.animal))].sort();
  res.json({
    total: animals.length,
    animals: animals.map((a) => ({
      name: a,
      slug: slugify(a),
      count: characters.filter((c) => c.animal === a).length,
    })),
  });
});

/**
 * GET /animals/:animal
 * Lista personagens de um animal específico
 */
app.get("/animals/:animal", (req, res) => {
  const animal = req.params.animal.toLowerCase();
  const result = characters.filter((c) => slugify(c.animal) === animal || c.animal.toLowerCase() === animal);
  if (result.length === 0) return res.status(404).json({ error: `Animal "${req.params.animal}" não encontrado` });
  res.json({ animal: result[0].animal, total: result.length, characters: result });
});

/**
 * GET /search?q=
 * Busca textual
 */
app.get("/search", (req, res) => {
  const q = req.query.q;
  if (!q || q.trim() === "") return res.status(400).json({ error: "Parâmetro ?q= é obrigatório" });

  const result = characters.filter((c) => matchesQuery(c, q.trim()));
  res.json({ query: q, total: result.length, characters: result });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada. Acesse GET / para ver os endpoints disponíveis." });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🎮 FNaF API rodando em http://localhost:${PORT}`);
  console.log(`📦 ${characters.length} personagens carregados`);
});

module.exports = app;
