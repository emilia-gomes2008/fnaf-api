# FNaF API

A REST API with **353 characters**, **48 books**, and **66 quotes** from the Five Nights at Freddy's universe, hosted on **Cloudflare Workers**.

**Base URL:** `https://fnaf-api.gsarvente.workers.dev`

**Interactive Docs:** `https://fnaf-api.pages.dev/`

---

## Endpoints

### `GET /`
Returns general API info — total counts, available types, animals, series, and all endpoint listings.

---

## Characters

### `GET /characters`
Returns all characters. Supports optional query filters:

| Parameter  | Example           | Description                     |
|------------|-------------------|---------------------------------|
| `type`     | `?type=Classic`   | Filter by animatronic type      |
| `animal`   | `?animal=Bear`    | Filter by animal                |
| `color`    | `?color=Blue`     | Filter by body color            |
| `eyeColor` | `?eyeColor=Red`   | Filter by eye color             |
| `year`     | `?year=1987`      | Filter by debut year            |
| `limit`    | `?limit=10`       | Number of results to return     |
| `offset`   | `?offset=20`      | Pagination offset               |

**Example:**
```
GET /characters?type=Toy&animal=Bear&limit=5
```

---

### `GET /characters/random`
Returns a single random character.

---

### `GET /characters/:id`
Fetches a character by numeric ID (1 to 353).
```
GET /characters/1    → Freddy Fazbear
GET /characters/5    → Foxy
```

---

### `GET /characters/name/:name`
Fetches a character by name slug (lowercase, spaces replaced with `-`).
```
GET /characters/name/freddy-fazbear
GET /characters/name/springtrap
GET /characters/name/toy-bonnie
```

---

### `GET /types`
Returns all 25 types with their character counts.

---

### `GET /types/:type`
Returns all characters belonging to a specific type.
```
GET /types/Classic
GET /types/Withered
GET /types/Shadow
GET /types/Springlock
```

---

### `GET /animals`
Returns all 56 animals with their character counts.

---

### `GET /animals/:animal`
Returns all characters of a specific animal type.
```
GET /animals/Bear
GET /animals/Fox
GET /animals/Rabbit
```

---

### `GET /search?q=`
Full-text search across name, type, animal, and color.
```
GET /search?q=springtrap
GET /search?q=yellow
GET /search?q=shadow
```

---

## Books

### `GET /books`
Returns all books. Supports optional query filters:

| Parameter | Example            | Description                 |
|-----------|--------------------|-----------------------------|
| `series`  | `?series=Trilogy`  | Filter by series            |
| `year`    | `?year=2019`       | Filter by release year      |
| `limit`   | `?limit=5`         | Number of results to return |
| `offset`  | `?offset=10`       | Pagination offset           |

---

### `GET /books/random`
Returns a single random book.

---

### `GET /books/:id`
Fetches a book by numeric ID.

---

### `GET /books/title/:title`
Fetches a book by title slug.
```
GET /books/title/the-silver-eyes
```

---

### `GET /books/series`
Returns all available series with book counts.

---

### `GET /books/series/:series`
Returns all books belonging to a specific series.
```
GET /books/series/trilogy
GET /books/series/fazbear-frights
```

---

### `GET /books/search?q=`
Full-text search across title, series, and year.
```
GET /books/search?q=silver
GET /books/search?q=2019
```

---

## Quotes

### `GET /quotes`
Returns all quotes. Supports optional query filters:

| Parameter | Example              | Description                 |
|-----------|----------------------|-----------------------------|
| `said`    | `?said=Freddy`       | Filter by character name    |
| `limit`   | `?limit=10`          | Number of results to return |
| `offset`  | `?offset=20`         | Pagination offset           |

---

### `GET /quotes/random`
Returns a single random quote.

---

### `GET /quotes/:id`
Fetches a quote by numeric ID.

---

### `GET /quotes/search?q=`
Full-text search across quote text and character name.
```
GET /quotes/search?q=nightmare
GET /quotes/search?q=freddy
```

---

## Images

### `GET /images/:path`
Returns a character image by redirecting to the GitHub raw asset URL.
```
GET /images/chars/classic/freddy.png
GET /images/chars/toy/bonnie.png
```

The `img` field on each character object already contains the correct path to use with this endpoint.

---

## Data Structures

### Character
```json
{
  "id": 1,
  "name": "Freddy Fazbear",
  "animal": "Bear",
  "type": "Classic",
  "color": ["Brown"],
  "eyeColor": ["Blue"],
  "year": 1993,
  "img": "images/chars/classic/freddy.png"
}
```

### Book
```json
{
  "id": 1,
  "title": "The Silver Eyes",
  "series": "Trilogy",
  "year": 2015
}
```

### Quote
```json
{
  "id": 2,
  "quote": "I'M SORRY BUT THERE WAS NEVER ENOUGH ROOM FOR BOTH OF US",
  "said": "Funtime Foxy"
}
```

---

## Stats

| Resource   | Count |
|------------|-------|
| Characters | 353   |
| Types      | 25    |
| Animals    | 56    |
| Books      | 48    |
| Quotes     | 66    |

---

## Available Types (25)
Classic, Withered, Toy, Shadow, Springlock, Phantom, Endo, Glamrock, Ruined, S.T.A.F.F. Bot, Prototype, Mascot Suit, Puppet Crew, and more.

---

## Development

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Running locally
```bash
npm install
npm run dev
```

### Deploying
```bash
npm run deploy
```

Built on [Cloudflare Workers](https://workers.cloudflare.com/).
