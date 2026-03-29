import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Pokemon } from '../types';
import PokemonForm from './PokemonForm';
import EVCounter from './EVCounter';

const HomeScreen: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);
  const [showEVCounter, setShowEVCounter] = useState(false);

  const addPokemon = (pokemonData: { name: string }) => {
    const newPokemon: Pokemon = {
      id: Date.now().toString(),
      name: pokemonData.name,
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
    setPokemons([...pokemons, newPokemon]);
  };

  const updatePokemon = (updatedPokemon: Pokemon) => {
    setPokemons(pokemons.map(p => p.id === updatedPokemon.id ? updatedPokemon : p));
  };

  const deletePokemon = (id: string) => {
    Alert.alert(
      'Delete Pokemon',
      'Are you sure you want to delete this Pokemon?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPokemons(pokemons.filter(p => p.id !== id));
            if (selectedPokemon === id) {
              setSelectedPokemon(null);
              setShowEVCounter(false);
            }
          },
        },
      ]
    );
  };

  const selectedPokemonData = pokemons.find(p => p.id === selectedPokemon);

  const handlePokemonSelect = (pokemonId: string) => {
    setSelectedPokemon(pokemonId);
    setShowEVCounter(true);
  };

  const handleBackToHome = () => {
    setShowEVCounter(false);
    setSelectedPokemon(null);
  };

  const formatPokemonName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
  };

  const renderPokemonItem = ({ item }: { item: Pokemon }) => (
    <TouchableOpacity
      style={[
        styles.pokemonCard,
        selectedPokemon === item.id && styles.selectedCard
      ]}
      onPress={() => handlePokemonSelect(item.id)}
    >
      <Text style={styles.pokemonName}>{formatPokemonName(item.name)}</Text>
      <Text style={styles.evSummary}>Total EVs: {item.totalEVs}/510</Text>
    </TouchableOpacity>
  );

  if (showEVCounter && selectedPokemonData) {
    return (
      <View style={styles.container}>
        <View style={styles.evCounterHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToHome}>
            <Text style={styles.backButtonText}>← Back to Homepage</Text>
          </TouchableOpacity>
        </View>
        <EVCounter
          pokemon={selectedPokemonData}
          onUpdate={updatePokemon}
          onDelete={deletePokemon}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pokemon EV Counter</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add Pokemon</Text>
        </TouchableOpacity>
      </View>

      {pokemons.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Pokemon Yet!</Text>
          <Text style={styles.emptyText}>
            Start by adding your first Pokemon to track EVs.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pokemons}
          renderItem={renderPokemonItem}
          keyExtractor={(item) => item.id}
          style={styles.pokemonList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <PokemonForm
        visible={showForm}
        onSubmit={addPokemon}
        onClose={() => setShowForm(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  evCounterHeader: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  pokemonList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  pokemonCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  selectedCard: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  evSummary: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
