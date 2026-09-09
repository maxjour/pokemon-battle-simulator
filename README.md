# Pokemon Battle Simulator

Simulates a 3v3 battle between two randomly-drawn teams of Pokemon and
returns a detailed round-by-round log plus the winner. Built for a
take-home assignment (~5h budget) — custom battle logic, doesn't reflect
the real games.

## Stack

Node.js, TypeScript, NestJS, MongoDB (Mongoose), Docker. Vitest for tests.

## Running it

**Docker (recommended):**

```bash
docker compose up --build -d
docker compose exec app node dist/pokemon/seed.js
```

Try `curl -X POST http://localhost:3000/battles` *before* seeding to see
the "database not seeded" error response, then again after seeding to see
a real battle.

**Local dev:**

```bash
npm install
docker compose up -d mongo   # just the DB
npm run seed
npm run start:dev
```

Swagger docs at `http://localhost:3000/api` once running.

## API

```
POST /battles
```

No request body — draws 3 random Pokemon per side and simulates the
whole battle in one call.

```jsonc
{
  "teamA": [ /* Pokemon docs */ ],
  "teamB": [ /* Pokemon docs */ ],
  "log": [ /* attack / kill / round-limit entries, see below */ ],
  "winner": "A" | "B",
  "finalTeamA": [{ "name": "...", "remainingHp": 0 }],
  "finalTeamB": [{ "name": "...", "remainingHp": 0 }]
}
```

## Battle mechanics

- Teams: 3 random Pokemon per side.

- Damage: attack power times a multiplier — 2x if the attacker's type is
  one of the defender's weaknesses, 0.5x if it's one of the defender's
  own types, 1x otherwise.

- HP and attack power are derived at seed time from weight and height
  using sqrt scaling (hp = round(sqrt(weight) * 50), attackPower =
  round(sqrt(height) * 30)), not the raw dataset values — linear scaling
  let the heaviest/tallest Pokemon dominate almost every fight regardless
  of type matchup; sqrt compresses that gap while still rewarding size.

- Each matchup runs up to 15 alternating-turn rounds, and every kill or
  round-limit log entry records exactly which round it ended on — so you
  can tell a fast 2-round knockout from one that went the full distance.
  A kill ends the matchup immediately; if neither kills by round 15,
  whoever has the higher % of their own starting HP wins (not raw HP, so
  base stats don't bias the tie).

- The matchup winner carries their current (damaged) HP into the next
  matchup — no reset between opponents. Battle ends when one team has
  all 3 Pokemon defeated.
  
- The dataset's multipliers field is intentionally unused — it's often null i found so it would be a bad combat stat, and not so good for effectiveness.

## Error handling

- Empty or under-seeded DB (fewer than 6 Pokemon to draw two teams)
  returns a 400 Bad Request from PokemonService.
- Mongo unreachable at startup: the app logs the failure and exits
  cleanly instead of crashing unpredictably (src/main.ts).
- A global exception filter (src/common/all-exceptions.filter.ts) gives
  every error response the same shape: statusCode, message, path,
  timestamp.

## Testing

npm run test — battle.combat.spec.ts covers effectiveness, attack damage,
and the HP floor at zero; battle.mappers.spec.ts covers the Fighter
conversions. Controller and module specs are still DI wiring checks only.


## Time constraints / what I'd do with more time

- Tests: the combat math is covered. But the BattleService run and runMatchup isnt.
This would have been covered with more time. 

- Turn order: runMatchup always lets Team A's active fighter attack
  first (and, since the round cap is odd, land one more hit than Team
  B) in every matchup. Not wrong, just an unintentional bias worth
  fixing by carrying turn order across matchups instead of resetting it.
- Considered, not built: flavor text in the log "X used a Grass
  attack!", and optional POST /battles params (maxRounds, explicit
  teamA/teamB, custom team names) — both genuinely separate from the
  core requirement, skipped to keep the core simulation solid within
  the time budget. 
- GitHub Actions: first time using it — previously worked with Jenkins and Atlassian tooling. The default workflow included an e2e job, but this project has no e2e tests, so that step was removed. Pipeline currently runs unit tests only.
