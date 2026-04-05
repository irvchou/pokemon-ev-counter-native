import axios from 'axios';
import { PokemonDetails, PokemonListItem, PokemonResponse } from '../types';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export { PokemonDetails };

export const pokemonAPI = {
  async getAllPokemon(): Promise<PokemonListItem[]> {
    try {
      const response = await axios.get<PokemonResponse>(`${POKEAPI_BASE_URL}/pokemon?limit=1000`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching Pokemon list:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please check your internet connection.');
        } else if (error.response?.status === 404) {
          throw new Error('Pokemon service not found. Please try again later.');
        } else if ((error.response?.status ?? 0) >= 500) {
          throw new Error('Pokemon service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error('Failed to fetch Pokemon list. Please check your internet connection.');
        }
      } else {
        throw new Error('An unexpected error occurred while fetching Pokemon list.');
      }
    }
  },

  async getPokemonDetails(name: string): Promise<PokemonDetails> {
    try {
      const response = await axios.get<PokemonDetails>(`${POKEAPI_BASE_URL}/pokemon/${name}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Pokemon details:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please check your internet connection.');
        } else if (error.response?.status === 404) {
          throw new Error(`Pokemon "${name}" not found.`);
        } else if ((error.response?.status ?? 0) >= 500) {
          throw new Error('Pokemon service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`Failed to fetch details for "${name}". Please check your internet connection.`);
        }
      } else {
        throw new Error('An unexpected error occurred while fetching Pokemon details.');
      }
    }
  }
};
