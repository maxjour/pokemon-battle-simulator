import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import { Pokemon, PokemonSchema } from "./schemas/pokemon.schema.js";

await mongoose.connect(process.env.MONGO_URI ?? "mongodb://localhost:27017/pokemon-battle-simulator");

const PokemonModel = mongoose.model(Pokemon.name, PokemonSchema);

interface RawPokemon {
  name: string;
  img: string;
  type: string[];
  height: string;
  weight: string;
  weaknesses: string[];
}


const raw = readFileSync(new URL("./data/pokedex.json", import.meta.url), "utf-8");
const { pokemon }: { pokemon: RawPokemon[] } = JSON.parse(raw);


const docs = pokemon.map((p) => {
  const height = parseFloat(p.height);
  const weight = parseFloat(p.weight);

  return {
    name: p.name,
    type: p.type,
    weaknesses: p.weaknesses,
    img: p.img,
    height,
    weight,
    // Hp based on weight, but it diffed so much i used sqrt to level the playing feild.
    hp: Math.round(Math.sqrt(weight) * 50),
    // Same method with the attackPower.
    attackPower: Math.round(Math.sqrt(height) * 30),
  };
});

await PokemonModel.deleteMany({});
await PokemonModel.insertMany(docs);

console.log("Seeded", docs.length, "Pokemon");
await mongoose.disconnect();
