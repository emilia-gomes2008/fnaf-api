# FNaF API

API REST com os **335 personagens** e **livros** do universo Five Nights at Freddy's, construída com **Cloudflare Workers**.

**Base URL:** `https://fnaf-api.gsarvente.workers.dev`

---

## Endpoints de Personagens

### `GET /`
Informações gerais da API (total de personagens, livros, tipos disponíveis, etc.)

---

### `GET /characters`
Lista todos os personagens. Suporta filtros via query string:

| Parâmetro  | Exemplo          | Descrição                  |
|------------|------------------|----------------------------|
| `type`     | `?type=Classic`  | Filtrar por tipo           |
| `animal`   | `?animal=Bear`   | Filtrar por animal         |
| `color`    | `?color=Blue`    | Filtrar por cor            |
| `eyeColor` | `?eyeColor=Red`  | Filtrar por cor dos olhos  |
| `year`     | `?year=1987`     | Filtrar por ano            |
| `limit`    | `?limit=10`      | Quantidade de resultados   |
| `offset`   | `?offset=20`     | Paginação                  |

**Exemplo:**
```
GET /characters?type=Toy&animal=Bear&limit=5
```

---

### `GET /characters/random`
Retorna um personagem aleatório.

---

### `GET /characters/:id`
Busca personagem pelo ID numérico (1 a 335).
```
GET /characters/1    → Freddy Fazbear
GET /characters/5    → Foxy
```

---

### `GET /characters/name/:name`
Busca pelo nome em formato slug (letras minúsculas, espaços viram `-`).
```
GET /characters/name/freddy-fazbear
GET /characters/name/springtrap
GET /characters/name/toy-bonnie
```

---

### `GET /types`
Lista todos os 25 tipos com contagem de personagens.

---

### `GET /types/:type`
Lista todos os personagens de um tipo específico.
```
GET /types/Classic
GET /types/Withered
GET /types/Shadow
GET /types/Springlock
```

---

### `GET /animals`
Lista todos os 56 animais com contagem de personagens.

---

### `GET /animals/:animal`
Lista todos os personagens de um animal específico.
```
GET /animals/Bear
GET /animals/Fox
GET /animals/Rabbit
```

---

### `GET /search?q=`
Busca textual em nome, tipo, animal e cor.
```
GET /search?q=springtrap
GET /search?q=yellow
GET /search?q=shadow
```

---

## Endpoints de Livros

### `GET /books`
Lista todos os livros. Suporta filtros via query string:

| Parâmetro | Exemplo           | Descrição                |
|-----------|-------------------|--------------------------|
| `series`  | `?series=Trilogy` | Filtrar por série        |
| `year`    | `?year=2019`      | Filtrar por ano          |
| `limit`   | `?limit=5`        | Quantidade de resultados |
| `offset`  | `?offset=10`      | Paginação                |

---

### `GET /books/random`
Retorna um livro aleatório.

---

### `GET /books/:id`
Busca livro pelo ID numérico.

---

### `GET /books/title/:title`
Busca pelo título em formato slug.
```
GET /books/title/the-silver-eyes
```

---

### `GET /books/series`
Lista todas as séries disponíveis com contagem de livros.

---

### `GET /books/series/:series`
Lista todos os livros de uma série específica.
```
GET /books/series/trilogy
GET /books/series/fazbear-frights
```

---

### `GET /books/search?q=`
Busca textual em título, série e ano.
```
GET /books/search?q=silver
GET /books/search?q=2019
```

---

## Endpoint de Imagens

### `GET /images/:path`
Retorna a imagem do personagem (redireciona para o GitHub).
```
GET /images/chars/classic/freddy.png
GET /images/chars/toy/bonnie.png
```

O campo `img` em cada personagem já contém o caminho correto para usar neste endpoint.

---

## Estrutura do Personagem

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

---

## Estrutura do Livro

```json
{
  "id": 1,
  "title": "The Silver Eyes",
  "series": "Trilogy",
  "year": 2015
}
```

---

## Tipos disponíveis (25)
Classic, Withered, Toy, Shadow, Springlock, Phantom, Endo, Glamrock, Ruined, S.T.A.F.F. Bot, Prototype, Mascot Suit, Puppet Crew, e mais.

---

## Estatísticas
- **335** personagens no total
- **25** tipos únicos
- **56** animais únicos
- **48** livros registados
