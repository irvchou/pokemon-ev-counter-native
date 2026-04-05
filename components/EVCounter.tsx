import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  const [showNatureModal, setShowNatureModal] = useState(false);

  const natures = useMemo(() => [
    { value: 'neutral', label: 'Neutral', boost: null, reduce: null },
    { value: 'hardy', label: 'Hardy', boost: null, reduce: null },
    { value: 'lonely', label: 'Lonely (+Atk, -Def)', boost: 'attack', reduce: 'defense' },
    { value: 'brave', label: 'Brave (+Atk, -Spd)', boost: 'attack', reduce: 'speed' },
    { value: 'adamant', label: 'Adamant (+Atk, -SpAtk)', boost: 'attack', reduce: 'spAttack' },
    { value: 'naughty', label: 'Naughty (+Atk, -SpDef)', boost: 'attack', reduce: 'spDefense' },
    { value: 'bold', label: 'Bold (+Def, -Atk)', boost: 'defense', reduce: 'attack' },
    { value: 'docile', label: 'Docile', boost: null, reduce: null },
    { value: 'relaxed', label: 'Relaxed (+Def, -Spd)', boost: 'defense', reduce: 'speed' },
    { value: 'impish', label: 'Impish (+Def, -SpAtk)', boost: 'defense', reduce: 'spAttack' },
    { value: 'lax', label: 'Lax (+Def, -SpDef)', boost: 'defense', reduce: 'spDefense' },
    { value: 'timid', label: 'Timid (+Spd, -Atk)', boost: 'speed', reduce: 'attack' },
    { value: 'hasty', label: 'Hasty (+Spd, -Def)', boost: 'speed', reduce: 'defense' },
    { value: 'serious', label: 'Serious', boost: null, reduce: null },
    { value: 'jolly', label: 'Jolly (+Spd, -SpAtk)', boost: 'speed', reduce: 'spAttack' },
    { value: 'naive', label: 'Naive (+Spd, -SpDef)', boost: 'speed', reduce: 'spDefense' },
    { value: 'modest', label: 'Modest (+SpAtk, -Atk)', boost: 'spAttack', reduce: 'attack' },
    { value: 'mild', label: 'Mild (+SpAtk, -Def)', boost: 'spAttack', reduce: 'defense' },
    { value: 'quiet', label: 'Quiet (+SpAtk, -Spd)', boost: 'spAttack', reduce: 'speed' },
    { value: 'bashful', label: 'Bashful', boost: null, reduce: null },
    { value: 'rash', label: 'Rash (+SpAtk, -SpDef)', boost: 'spAttack', reduce: 'spDefense' },
    { value: 'calm', label: 'Calm (+SpDef, -Atk)', boost: 'spDefense', reduce: 'attack' },
    { value: 'gentle', label: 'Gentle (+SpDef, -Def)', boost: 'spDefense', reduce: 'defense' },
    { value: 'sassy', label: 'Sassy (+SpDef, -Spd)', boost: 'spDefense', reduce: 'speed' },
    { value: 'careful', label: 'Careful (+SpDef, -SpAtk)', boost: 'spDefense', reduce: 'spAttack' },
    { value: 'quirky', label: 'Quirky', boost: null, reduce: null },
  ], []);

  const getBaseStat = useCallback((stat: keyof Pokemon['evs']): number => {
    if (!pokemonDetails?.stats) return 0;
    const statMap: Record<keyof Pokemon['evs'], string> = {
      hp: 'hp',
      attack: 'attack',
      defense: 'defense',
      spAttack: 'special-attack',
      spDefense: 'special-defense',
      speed: 'speed',
    };
    const found = pokemonDetails.stats.find(s => s.stat.name === statMap[stat]);
    return found?.base_stat || 0;
  }, [pokemonDetails]);

  const getNatureMultiplier = useCallback((stat: keyof Pokemon['evs']): number => {
    const selectedNature = natures.find(n => n.value === (pokemon.nature || 'neutral'));
    if (!selectedNature) return 1.0;
    
    if (selectedNature.boost === stat) return 1.1;
    if (selectedNature.reduce === stat) return 0.9;
    return 1.0;
  }, [pokemon.nature, natures]);

  const getAdjustedBaseStat = useCallback((stat: keyof Pokemon['evs']): number => {
    const baseStat = getBaseStat(stat);
    const natureMultiplier = getNatureMultiplier(stat);
    const adjustedStat = Math.floor(baseStat * natureMultiplier);
    return adjustedStat;
  }, [getBaseStat, getNatureMultiplier]);

  const updatePokemonNature = useCallback((newNature: string) => {
    const updatedPokemon = {
      ...pokemon,
      nature: newNature,
    };
    onUpdate(updatedPokemon);
  }, [pokemon, onUpdate]);

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      try {
        setLoadingDetails(true);
        const details = await pokemonAPI.getPokemonDetails(pokemon.name);
        setPokemonDetails(details);
      } catch (error) {
        // Error fetching Pokemon details
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

      <View style={styles.natureContainer}>
        <Text style={styles.natureLabel}>Nature:</Text>
        <TouchableOpacity 
          style={styles.natureButton}
          onPress={() => {
            setShowNatureModal(true);
          }}
        >
          <Text style={styles.natureButtonText}>
            {natures.find(n => n.value === (pokemon.nature || 'neutral'))?.label || 'Select Nature'}
          </Text>
          <Text style={styles.natureButtonArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {statButtons.map(({ stat, label, color }) => (
          <View key={stat} style={styles.statCard}>
            <Text style={[styles.statLabel, { color }]}>{label}</Text>
            <Text style={styles.baseStatText}>
              Base: {getAdjustedBaseStat(stat)} 
              {getNatureMultiplier(stat) !== 1.0 && (
                <Text style={styles.natureModifier}>
                  ({getNatureMultiplier(stat) > 1.0 ? '+' : ''}{Math.round((getNatureMultiplier(stat) - 1) * 100)}%)
                </Text>
              )}
            </Text>
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
      
      <Modal
        visible={showNatureModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNatureModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Nature</Text>
              <TouchableOpacity onPress={() => {
            setShowNatureModal(false);
          }}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.natureList}>
              {natures.map((item: any) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.natureOption,
                    (pokemon.nature || 'neutral') === item.value && styles.selectedNatureOption
                  ]}
                  onPress={() => {
                    updatePokemonNature(item.value);
                    setShowNatureModal(false);
                  }}
                >
                  <Text style={[
                    styles.natureOptionText,
                    (pokemon.nature || 'neutral') === item.value && styles.selectedNatureOptionText
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  natureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  natureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 50,
  },
  natureButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 8,
    height: 36,
  },
  natureButtonText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  natureButtonArrow: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 5,
  },
  baseStatText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  natureModifier: {
    fontSize: 9,
    color: '#667eea',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 18,
    color: '#667eea',
    fontWeight: '600',
  },
  natureList: {
    flex: 1,
    maxHeight: 350,
  },
  natureOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedNatureOption: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  natureOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedNatureOptionText: {
    color: '#667eea',
    fontWeight: '600',
  },
});

export default EVCounter;
