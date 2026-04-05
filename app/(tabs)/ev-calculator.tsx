import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pokemon } from '../../types';
import { formatPokemonName } from '../../utils/pokemonUtils';
import EVCounter from '../../components/EVCounter';
import PokemonForm from '../../components/PokemonForm';

const EVCalculatorTab: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);

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
            }
          },
        },
      ]
    );
  };

  const selectedPokemonData = pokemons.find(p => p.id === selectedPokemon);

  const handlePokemonSelect = (pokemonId: string) => {
    setSelectedPokemon(pokemonId);
  };

  const handleBackToList = () => {
    setSelectedPokemon(null);
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

  if (selectedPokemonData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToList}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>EV Calculator</Text>
          <View style={styles.placeholder} />
        </View>
        <ScrollView style={styles.calculatorContainer} showsVerticalScrollIndicator={false}>
          <EVCounter
            pokemon={selectedPokemonData}
            onUpdate={updatePokemon}
            onDelete={deletePokemon}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EV Calculator</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 100,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  placeholder: {
    width: 100,
  },
  calculatorContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
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
    padding: 12,
    marginBottom: 10,
  },
  selectedCard: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  evSummary: {
    fontSize: 12,
    color: '#666',
  },
});

export default EVCalculatorTab;
