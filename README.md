# 🎮 FNaF Characters API

API REST com os **335 personagens** do universo Five Nights at Freddy's, construída com Node.js + Express.

## Instalação

```bash
npm install
node index.js
# Rodando em http://localhost:3000
```

---

## Endpoints

### `GET /`
Informações gerais da API (total de personagens, tipos disponíveis, etc.)

---

### `GET /characters`
Lista todos os personagens. Suporta filtros via query string:

| Parâmetro | Exemplo | Descrição |
|-----------|---------|-----------|
| `type`     | `?type=Classic`  | Filtrar por tipo |
| `animal`   | `?animal=Bear`   | Filtrar por animal |
| `color`    | `?color=Blue`    | Filtrar por cor |
| `eyeColor` | `?eyeColor=Red`  | Filtrar por cor dos olhos |
| `year`     | `?year=1987`     | Filtrar por ano |
| `limit`    | `?limit=10`      | Quantidade de resultados |
| `offset`   | `?offset=20`     | Paginação |

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
GET /characters/1       → Freddy Fazbear
GET /characters/5       → Foxy
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

## Estrutura do personagem

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

## Tipos disponíveis (25)

Classic, Withered, Toy, Shadow, Springlock, Phantom, Endo, Glamrock, Ruined, S.T.A.F.F. Bot, Prototype, Mascot Suit, Puppet Crew, e mais.

---

## Estatísticas

- **335** personagens no total
- **25** tipos únicos
- **56** animais únicos
