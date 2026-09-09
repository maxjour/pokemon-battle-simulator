import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PokemonDocument = HydratedDocument<Pokemon>;

@Schema({ collection: 'pokemons' })
export class Pokemon {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [String], required: true })
  type: string[];

  @Prop({ type: [String], required: true })
  weaknesses: string[];

  @Prop({ required: true })
  img: string;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  hp: number;

  @Prop({ required: true })
  attackPower: number;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
