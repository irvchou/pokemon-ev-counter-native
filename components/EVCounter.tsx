import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { pokemonAPI, PokemonDetails } from '../services/pokemonAPI';
import { Pokemon } from '../types';
import { formatPokemonName } from '../utils/pokemonUtils';

interface EVCounterProps {
  pokemon: Pokemon;
  onUpdate: (pokemon: Pokemon) => void;
  onDelete: (id: string) => void;
}

const EVCounter: React.FC<EVCounterProps> = ({ pokemon, onUpdate, onDelete }) => {
  const [pokemonDetails, setPokemonDetails] = useState<PokemonDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      try {
        setLoadingDetails(true);
        const details = await pokemonAPI.getPokemonDetails(pokemon.name);
        setPokemonDetails(details);
      } catch (error) {
        console.error('Error fetching Pokemon details:', error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchPokemonDetails();
  }, [pokemon.name]);

  const maxEVs = 252;
  const maxTotalEVs = 510;

  const statButtons = [
    { stat: 'hp' as keyof Pokemon['evs'], label: 'HP', color: '#ff6b6b' },
    { stat: 'attack' as keyof Pokemon['evs'], label: 'Attack', color: '#f06292' },
    { stat: 'defense' as keyof Pokemon['evs'], label: 'Defense', color: '#4fc3f7' },
    { stat: 'spAttack' as keyof Pokemon['evs'], label: 'Sp. Atk', color: '#ba68c8' },
    { stat: 'spDefense' as keyof Pokemon['evs'], label: 'Sp. Def', color: '#4db6ac' },
    { stat: 'speed' as keyof Pokemon['evs'], label: 'Speed', color: '#ffd54f' },
  ];

  const incrementEV = (stat: keyof Pokemon['evs']) => {
    if (pokemon.totalEVs >= maxTotalEVs) return;
    if (pokemon.evs[stat] >= maxEVs) return;

    const updatedPokemon = {
      ...pokemon,
      evs: {
        ...pokemon.evs,
        [stat]: pokemon.evs[stat] + 1,
      },
      totalEVs: pokemon.totalEVs + 1,
    };
    onUpdate(updatedPokemon);
  };

  const decrementEV = (stat: keyof Pokemon['evs']) => {
    if (pokemon.evs[stat] <= 0) return;

    const updatedPokemon = {
      ...pokemon,
      evs: {
        ...pokemon.evs,
        [stat]: pokemon.evs[stat] - 1,
      },
      totalEVs: pokemon.totalEVs - 1,
    };
    onUpdate(updatedPokemon);
  };

  const resetEVs = () => {
    const updatedPokemon = {
      ...pokemon,
      evs: {
        hp: 0,
        attack: 0,
        defense: 0,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      },
      totalEVs: 0,
    };
    onUpdate(updatedPokemon);
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.pokemonInfo}>
          {loadingDetails ? (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="small" color="#667eea" />
            </View>
          ) : pokemonDetails?.sprites?.front_default ? (
            <Image 
              source={{ uri: pokemonDetails.sprites.front_default }}
              style={styles.pokemonImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          <Text style={styles.pokemonName}>{formatPokemonName(pokemon.name)}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(pokemon.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.totalEVsText}>Total EVs: {pokemon.totalEVs} / {maxTotalEVs}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${(pokemon.totalEVs / maxTotalEVs) * 100}%` }
            ]}
          />
        </View>
      </View>

      <View style={styles.statsGrid}>
        {statButtons.map(({ stat, label, color }) => (
          <View key={stat} style={styles.statCard}>
            <Text style={[styles.statLabel, { color }]}>{label}</Text>
            <View style={styles.evControls}>
              <TouchableOpacity 
                style={[styles.evButton, styles.decrementButton]}
                onPress={() => decrementEV(stat)}
                disabled={pokemon.evs[stat] === 0}
              >
                <Text style={styles.evButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.evValue}>{pokemon.evs[stat]}</Text>
              <TouchableOpacity 
                style={[
                  styles.evButton, 
                  styles.incrementButton,
                  (pokemon.evs[stat] >= maxEVs || pokemon.totalEVs >= maxTotalEVs) && styles.disabledButton
                ]}
                onPress={() => incrementEV(stat)}
                disabled={pokemon.evs[stat] >= maxEVs || pokemon.totalEVs >= maxTotalEVs}
              >
                <Text style={styles.evButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.evBar}>
              <View 
                style={[
                  styles.evFill,
                  { 
                    width: `${(pokemon.evs[stat] / maxEVs) * 100}%`,
                    backgroundColor: color 
                  }
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetEVs}>
        <Text style={styles.resetButtonText}>Reset All EVs</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    margin: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  pokemonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pokemonImage: {
    width: 50,
    height: 50,
    marginRight: 12,
    resizeMode: 'contain',
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryContainer: {
    marginBottom: 20,
  },
  totalEVsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  evControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  evButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decrementButton: {
    backgroundColor: '#ff9800',
  },
  incrementButton: {
    backgroundColor: '#4caf50',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  evButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  evValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 25,
    textAlign: 'center',
  },
  evBar: {
    width: '100%',
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  evFill: {
    height: '100%',
  },
  resetButton: {
    backgroundColor: '#ff4757',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EVCounter;
