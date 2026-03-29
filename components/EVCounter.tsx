import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Pokemon } from '../types';

interface EVCounterProps {
  pokemon: Pokemon;
  onUpdate: (pokemon: Pokemon) => void;
  onDelete: (id: string) => void;
}

const { width } = Dimensions.get('window');

const EVCounter: React.FC<EVCounterProps> = ({ pokemon, onUpdate, onDelete }) => {
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

  const formatPokemonName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pokemonName}>{formatPokemonName(pokemon.name)}</Text>
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
    padding: 20,
    margin: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pokemonName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    marginBottom: 25,
  },
  totalEVsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
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
    marginBottom: 25,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  evControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  evButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  evValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  evBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  evFill: {
    height: '100%',
  },
  resetButton: {
    backgroundColor: '#ff4757',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EVCounter;
