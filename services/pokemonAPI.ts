import axios from 'axios';
import { PokemonListItem, PokemonResponse, PokemonDetails } from '../types';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export const pokemonAPI = {
  async getAllPokemon(): Promise<PokemonListItem[]> {
    try {
      const response = await axios.get<PokemonResponse>(`${POKEAPI_BASE_URL}/pokemon?limit=1000`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching Pokemon list:', error);
      throw new Error('Failed to fetch Pokemon list');
    }
  },

  async getPokemonDetails(name: string): Promise<PokemonDetails> {
    try {
      const response = await axios.get<PokemonDetails>(`${POKEAPI_BASE_URL}/pokemon/${name}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Pokemon details:', error);
      throw new Error('Failed to fetch Pokemon details');
    }
  }
};
