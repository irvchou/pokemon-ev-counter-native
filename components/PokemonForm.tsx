import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { pokemonAPI } from '../services/pokemonAPI';
import { Pokemon, PokemonDetails, PokemonListItem } from '../types';
import { formatPokemonName } from '../utils/pokemonUtils';

const { width } = Dimensions.get('window');

interface PokemonFormProps {
  visible: boolean;
  onSubmit: (pokemon: Omit<Pokemon, 'id' | 'evs' | 'totalEVs'>) => void;
  onClose: () => void;
}

const PokemonForm: React.FC<PokemonFormProps> = ({ visible, onSubmit, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonListItem[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonListItem | null>(null);
  const [selectedPokemonDetails, setSelectedPokemonDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    const fetchPokemonList = async () => {
      try {
        setLoading(true);
        const list = await pokemonAPI.getAllPokemon();
        if (!cancelled) {
          setPokemonList(list);
          setFilteredPokemon(list);
        }
      } catch (error) {
        if (!cancelled) {
          Alert.alert('Error', 'Failed to load Pokemon list');
          console.error(error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (visible) {
      fetchPokemonList();
    }
    
    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    const filtered = pokemonList.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPokemon(filtered);
  }, [searchTerm, pokemonList]);

  const fetchPokemonDetails = async (pokemon: PokemonListItem) => {
    try {
      setLoadingDetails(true);
      const details = await pokemonAPI.getPokemonDetails(pokemon.name);
      setSelectedPokemonDetails(details);
    } catch (error) {
      console.error('Error fetching Pokemon details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePokemonSelect = (pokemon: PokemonListItem) => {
    setSelectedPokemon(pokemon);
    setSearchTerm(pokemon.name);
    fetchPokemonDetails(pokemon);
  };

  const handleSubmit = () => {
    if (selectedPokemon) {
      onSubmit({ name: selectedPokemon.name });
      setSelectedPokemon(null);
      setSelectedPokemonDetails(null);
      setSearchTerm('');
      onClose();
    }
  };


  const getStatColor = (stat: number): string => {
    if (stat >= 120) return '#4caf50';
    if (stat >= 90) return '#8bc34a';
    if (stat >= 60) return '#ffc107';
    if (stat >= 30) return '#ff9800';
    return '#f44336';
  };

  const renderPokemonItem = ({ item }: { item: PokemonListItem }) => (
    <TouchableOpacity
      style={[
        styles.pokemonOption,
        selectedPokemon?.name === item.name && styles.selectedPokemon
      ]}
      onPress={() => handlePokemonSelect(item)}
    >
      <View style={styles.pokemonOptionContent}>
        <Text style={[
          styles.pokemonOptionText,
          selectedPokemon?.name === item.name && styles.selectedPokemonText
        ]}>
          {formatPokemonName(item.name)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderStatBar = (label: string, value: number, maxValue: number = 255) => (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statBar}>
        <View 
          style={[
            styles.statBarFill,
            { 
              width: `${(value / maxValue) * 100}%`,
              backgroundColor: getStatColor(value)
            }
          ]}
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Select Pokemon</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Search Pokemon:</Text>
          <TextInput
            style={styles.input}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Start typing to search..."
            placeholderTextColor="#999"
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading Pokemon list...</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <FlatList
              data={filteredPokemon.slice(0, 50)}
              renderItem={renderPokemonItem}
              keyExtractor={(item) => item.name}
              style={styles.pokemonList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.noResults}>No Pokemon found</Text>
              }
              ListFooterComponent={
                filteredPokemon.length > 50 ? (
                  <Text style={styles.moreResults}>Showing first 50 results</Text>
                ) : null
              }
            />

            {selectedPokemonDetails && (
              <View style={styles.pokemonDetails}>
                {loadingDetails ? (
                  <View style={styles.detailsLoading}>
                    <ActivityIndicator size="small" color="#667eea" />
                    <Text style={styles.detailsLoadingText}>Loading details...</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.pokemonHeader}>
                      <Image 
                        source={{ uri: selectedPokemonDetails.sprites.front_default }}
                        style={styles.pokemonImage}
                      />
                      <View style={styles.pokemonInfo}>
                        <Text style={styles.pokemonName}>
                          {formatPokemonName(selectedPokemonDetails.name)}
                        </Text>
                        <Text style={styles.pokemonNumber}>
                          #{selectedPokemonDetails.id.toString().padStart(3, '0')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statsContainer}>
                      <Text style={styles.statsTitle}>Base Stats</Text>
                      {selectedPokemonDetails.stats && selectedPokemonDetails.stats.map((stat: any) => {
                        const statName = stat.stat.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                        return renderStatBar(statName, stat.base_stat);
                      })}
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !selectedPokemon && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={!selectedPokemon}
          >
            <Text style={styles.submitButtonText}>Add Pokemon</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  pokemonList: {
    flex: 1,
    marginRight: 10,
  },
  pokemonOption: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedPokemon: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  pokemonOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pokemonOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedPokemonText: {
    fontWeight: '600',
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  moreResults: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  pokemonDetails: {
    width: (width - 60) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginLeft: 10,
  },
  detailsLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailsLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  pokemonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pokemonImage: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  pokemonInfo: {
    flex: 1,
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  pokemonNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    marginTop: 10,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  statRow: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    width: 60,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    width: 30,
    textAlign: 'right',
  },
  statBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginLeft: 10,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PokemonForm;
