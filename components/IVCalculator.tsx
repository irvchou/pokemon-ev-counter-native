import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Pokemon, PokemonDetails } from '../types';
import { IV_THRESHOLDS, getIVColor, validatePokemonLevel } from '../utils/pokemonUtils';

interface IVCalculatorProps {
  pokemon: Pokemon;
  pokemonDetails: PokemonDetails | null;
}

interface CurrentStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

interface IVRange {
  min: number;
  max: number;
}

const IVCalculator: React.FC<IVCalculatorProps> = ({ pokemon, pokemonDetails }) => {
  const [level, setLevel] = useState('50');
  const [currentStats, setCurrentStats] = useState<CurrentStats>({
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0,
  });
  const [nature, setNature] = useState('neutral');
  const [calculatedIVs, setCalculatedIVs] = useState<Record<string, IVRange>>({});
  const [showNatureModal, setShowNatureModal] = useState(false);

  const natures = useMemo(() => [
    { value: 'neutral', label: 'Neutral', boost: null, reduce: null },
    { value: 'hardy', label: 'Hardy (+Atk, -Atk)', boost: 'attack', reduce: 'attack' },
    { value: 'lonely', label: 'Lonely (+Atk, -Def)', boost: 'attack', reduce: 'defense' },
    { value: 'brave', label: 'Brave (+Atk, -Spd)', boost: 'attack', reduce: 'speed' },
    { value: 'adamant', label: 'Adamant (+Atk, -SpAtk)', boost: 'attack', reduce: 'spAttack' },
    { value: 'naughty', label: 'Naughty (+Atk, -SpDef)', boost: 'attack', reduce: 'spDefense' },
    { value: 'bold', label: 'Bold (+Def, -Atk)', boost: 'defense', reduce: 'attack' },
    { value: 'docile', label: 'Docile (+Def, -Def)', boost: 'defense', reduce: 'defense' },
    { value: 'relaxed', label: 'Relaxed (+Def, -Spd)', boost: 'defense', reduce: 'speed' },
    { value: 'impish', label: 'Impish (+Def, -SpAtk)', boost: 'defense', reduce: 'spAttack' },
    { value: 'lax', label: 'Lax (+Def, -SpDef)', boost: 'defense', reduce: 'spDefense' },
    { value: 'timid', label: 'Timid (+Spd, -Atk)', boost: 'speed', reduce: 'attack' },
    { value: 'hasty', label: 'Hasty (+Spd, -Def)', boost: 'speed', reduce: 'defense' },
    { value: 'serious', label: 'Serious (+Spd, -Spd)', boost: 'speed', reduce: 'speed' },
    { value: 'jolly', label: 'Jolly (+Spd, -SpAtk)', boost: 'speed', reduce: 'spAttack' },
    { value: 'naive', label: 'Naive (+Spd, -SpDef)', boost: 'speed', reduce: 'spDefense' },
    { value: 'modest', label: 'Modest (+SpAtk, -Atk)', boost: 'spAttack', reduce: 'attack' },
    { value: 'mild', label: 'Mild (+SpAtk, -Def)', boost: 'spAttack', reduce: 'defense' },
    { value: 'quiet', label: 'Quiet (+SpAtk, -Spd)', boost: 'spAttack', reduce: 'speed' },
    { value: 'bashful', label: 'Bashful (+SpAtk, -SpAtk)', boost: 'spAttack', reduce: 'spAttack' },
    { value: 'rash', label: 'Rash (+SpAtk, -SpDef)', boost: 'spAttack', reduce: 'spDefense' },
    { value: 'calm', label: 'Calm (+SpDef, -Atk)', boost: 'spDefense', reduce: 'attack' },
    { value: 'gentle', label: 'Gentle (+SpDef, -Def)', boost: 'spDefense', reduce: 'defense' },
    { value: 'sassy', label: 'Sassy (+SpDef, -Spd)', boost: 'spDefense', reduce: 'speed' },
    { value: 'careful', label: 'Careful (+SpDef, -SpAtk)', boost: 'spDefense', reduce: 'spAttack' },
    { value: 'quirky', label: 'Quirky (+SpDef, -SpDef)', boost: 'spDefense', reduce: 'spDefense' },
  ], []);

  const statNames = useMemo(() => [
    { key: 'hp' as keyof CurrentStats, label: 'HP', color: '#ff6b6b' },
    { key: 'attack' as keyof CurrentStats, label: 'Attack', color: '#f06292' },
    { key: 'defense' as keyof CurrentStats, label: 'Defense', color: '#4fc3f7' },
    { key: 'spAttack' as keyof CurrentStats, label: 'Sp. Atk', color: '#ba68c8' },
    { key: 'spDefense' as keyof CurrentStats, label: 'Sp. Def', color: '#4db6ac' },
    { key: 'speed' as keyof CurrentStats, label: 'Speed', color: '#ffd54f' },
  ], []);

  const getBaseStat = useCallback((stat: keyof CurrentStats): number => {
    if (!pokemonDetails?.stats) return 0;
    const statMap: Record<keyof CurrentStats, string> = {
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

  const getNatureMultiplier = useCallback((stat: keyof CurrentStats): number => {
    const selectedNature = natures.find(n => n.value === nature);
    if (!selectedNature) return 1.0;
    
    if (selectedNature.boost === stat) return 1.1;
    if (selectedNature.reduce === stat) return 0.9;
    return 1.0;
  }, [nature, natures]);

  const calculateIVRange = useCallback((baseStat: number, currentStat: number, ev: number, stat: keyof CurrentStats): IVRange => {
    const levelNum = parseInt(level) || 50;
    const isHP = stat === 'hp';
    const natureMultiplier = getNatureMultiplier(stat);
    
    const possibleIVs: number[] = [];
    
    for (let iv = 0; iv <= 31; iv++) {
      let calculatedStat: number;
      
      if (isHP) {
        calculatedStat = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * levelNum / 100) + levelNum + 10);
      } else {
        calculatedStat = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * levelNum / 100 + 5) * natureMultiplier);
      }
      
      if (calculatedStat === currentStat) {
        possibleIVs.push(iv);
      }
    }
    
    if (possibleIVs.length === 0) {
      // If no exact match, find closest IVs
      let minDiff = Infinity;
      let closestIVs: number[] = [];
      
      for (let iv = 0; iv <= 31; iv++) {
        let calculatedStat: number;
        
        if (isHP) {
          calculatedStat = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * levelNum / 100) + levelNum + 10);
        } else {
          calculatedStat = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * levelNum / 100 + 5) * natureMultiplier);
        }
        
        const diff = Math.abs(calculatedStat - currentStat);
        if (diff < minDiff) {
          minDiff = diff;
          closestIVs = [iv];
        } else if (diff === minDiff) {
          closestIVs.push(iv);
        }
      }
      
      return {
        min: Math.min(...closestIVs),
        max: Math.max(...closestIVs),
      };
    }
    
    return {
      min: Math.min(...possibleIVs),
      max: Math.max(...possibleIVs),
    };
  }, [level, getNatureMultiplier]);

  const calculateAllIVRanges = useCallback(() => {
    if (!pokemonDetails) return;
    
    const ranges: Record<string, IVRange> = {};
    
    statNames.forEach(({ key }) => {
      const baseStat = getBaseStat(key);
      const currentStat = currentStats[key];
      const ev = pokemon.evs[key];
      
      ranges[key] = calculateIVRange(baseStat, currentStat, ev, key);
    });
    
    setCalculatedIVs(ranges);
  }, [pokemonDetails, pokemon.evs, currentStats, statNames, getBaseStat, calculateIVRange]);

  useEffect(() => {
    calculateAllIVRanges();
  }, [level, currentStats, nature, pokemonDetails, calculateAllIVRanges]);

  const handleLevelChange = (value: string) => {
    const clampedValue = validatePokemonLevel(value);
    setLevel(clampedValue.toString());
  };

  const handleStatChange = (stat: keyof CurrentStats, value: string) => {
    const numValue = parseInt(value) || 0;
    setCurrentStats(prev => ({
      ...prev,
      [stat]: numValue
    }));
  };


  const getTotalIVRange = (): string => {
    const ranges = Object.values(calculatedIVs);
    if (ranges.length === 0) return `0-${IV_THRESHOLDS.MAX_TOTAL_IVS}`;
    
    const min = ranges.reduce((sum, range) => sum + range.min, 0);
    const max = ranges.reduce((sum, range) => sum + range.max, 0);
    
    return `${min}-${max}`;
  };

  const getIVPercentage = (): string => {
    const ranges = Object.values(calculatedIVs);
    if (ranges.length === 0) return '0%';
    
    const min = ranges.reduce((sum, range) => sum + range.min, 0);
    const max = ranges.reduce((sum, range) => sum + range.max, 0);
    
    const minPercent = (min / IV_THRESHOLDS.MAX_TOTAL_IVS) * 100;
    const maxPercent = (max / IV_THRESHOLDS.MAX_TOTAL_IVS) * 100;
    
    return `${minPercent.toFixed(1)}-${maxPercent.toFixed(1)}%`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IV Calculator</Text>
      
      <View style={styles.inputSection}>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Level:</Text>
          <TextInput
            style={styles.input}
            value={level}
            onChangeText={handleLevelChange}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Nature:</Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowNatureModal(true)}
          >
            <Text style={styles.dropdownText}>
              {natures.find(n => n.value === nature)?.label || 'Select Nature'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            Total IVs: {getTotalIVRange()} ({getIVPercentage()})
          </Text>
        </View>
      </View>

      <ScrollView style={styles.statsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Current Stats</Text>
        {statNames.map(({ key, label, color }) => {
          const baseStat = getBaseStat(key);
          const ivRange = calculatedIVs[key];
          
          return (
            <View key={key} style={styles.statRow}>
              <View style={styles.statHeader}>
                <Text style={[styles.statLabel, { color }]}>{label}</Text>
                <TextInput
                  style={styles.statInput}
                  value={currentStats[key].toString()}
                  onChangeText={(value) => handleStatChange(key, value)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              
              <View style={styles.statDetails}>
                <View style={styles.statInputRow}>
                  <Text style={styles.inputLabelSmall}>Base:</Text>
                  <Text style={styles.baseStatValue}>{baseStat}</Text>
                </View>
                
                <View style={styles.statInputRow}>
                  <Text style={styles.inputLabelSmall}>EV:</Text>
                  <Text style={styles.evValue}>{pokemon.evs[key]}</Text>
                </View>
                
                <View style={styles.statInputRow}>
                  <Text style={styles.inputLabelSmall}>IV:</Text>
                  {ivRange ? (
                    <Text style={[
                      styles.ivRangeText,
                      { color: getIVColor(ivRange) }
                    ]}>
                      {ivRange.min === ivRange.max ? ivRange.min : `${ivRange.min}-${ivRange.max}`}
                    </Text>
                  ) : (
                    <Text style={styles.ivRangeText}>-</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      
      <Modal
        visible={showNatureModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNatureModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Nature</Text>
              <TouchableOpacity onPress={() => setShowNatureModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.natureList}>
              {natures.map((item: any) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.natureOption,
                    nature === item.value && styles.selectedNatureOption
                  ]}
                  onPress={() => {
                    setNature(item.value);
                    setShowNatureModal(false);
                  }}
                >
                  <Text style={[
                    styles.natureOptionText,
                    nature === item.value && styles.selectedNatureOptionText
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  inputSection: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    width: 40,
  },
  inputLabelSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    width: 30,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 6,
    fontSize: 12,
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  summaryRow: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  statsContainer: {
    flex: 1,
  },
  statRow: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 4,
    fontSize: 12,
    width: 60,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  statDetails: {
    gap: 3,
  },
  statInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  baseStatValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  ivRangeText: {
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  evValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    height: 40,
    justifyContent: 'center',
  },
  picker: {
    height: 40,
    width: '100%',
  },
  pickerItem: {
    fontSize: 12,
    color: '#333',
  },
  dropdownButton: {
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
    height: 40,
  },
  dropdownText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 5,
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
    maxHeight: '80%',
    minHeight: 300,
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
    maxHeight: 400,
  },
  natureOption: {
    padding: 15,
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

export default IVCalculator;
