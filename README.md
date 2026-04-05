# Pokemon EV & IV Tracker

A comprehensive mobile app for tracking and calculating Effort Values (EVs) and Individual Values (IVs) for Pokemon, built with React Native and Expo.

## Features

### 🎯 EV Tracker
- **EV Management**: Add, remove, and track EVs for all six stats (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed)
- **Visual Progress Bars**: See your EV distribution at a glance with color-coded progress bars
- **Total EV Tracking**: Monitor total EVs with a 510 limit enforcement
- **Per-Stat Limits**: Enforces the 252 EV limit per individual stat
- **Nature Modifications**: View base stats adjusted by your Pokemon's nature with visual indicators

### 🔢 IV Calculator
- **Reverse IV Calculation**: Input current stats to calculate possible IV ranges
- **Level-Based Calculations**: Accurate IV calculations for any level (1-100)
- **Nature-Aware**: Accounts for nature modifiers in IV calculations
- **Color-Coded IV Ranges**: Visual feedback with color coding for IV quality:
  - **Excellent** (30+): Green
  - **Good** (25-29): Light Green  
  - **Average** (20-24): Yellow
  - **Below Average** (15-19): Orange
  - **Poor** (0-14): Red
- **Total IV Percentage**: Shows overall IV percentage with min-max ranges

### 🌿 Nature System
- **25 Natures Supported**: All official Pokemon natures with proper stat modifiers
- **Neutral Natures**: Hardy, Docile, Serious, Bashful, and Quirky are properly neutral
- **Visual Indicators**: See which stats are boosted (+10%) or reduced (-10%) by nature
- **Consistent Application**: Nature effects are applied consistently across both EV and IV calculators

### 📱 User Interface
- **Pokemon Selection**: Search and select from the complete Pokemon database
- **Pokemon Images**: Displays official Pokemon sprites
- **Base Stats Display**: Shows base stats with nature adjustments
- **Multiple Pokemon Support**: Track EVs and IVs for multiple Pokemon simultaneously
- **Responsive Design**: Optimized for mobile devices with intuitive touch controls

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (optional, for local development)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/irvchou/pokemon-ev-tracker-iv-calculator.git
   cd pokemon-ev-tracker-iv-calculator
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - **iOS**: Press `i` in the terminal or open in Xcode
   - **Android**: Press `a` in the terminal or open in Android Studio
   - **Web**: Press `w` in the terminal to open in browser
   - **Expo Go**: Scan the QR code with Expo Go app

## Usage Guide

### Adding a Pokemon
1. Tap the "Add Pokemon" button
2. Search for your Pokemon by name
3. Select from the search results
4. The Pokemon will be added with neutral nature and zero EVs

### Using the EV Tracker
1. Select a Pokemon from your list
2. Use the `+` and `-` buttons to adjust EVs for each stat
3. Monitor the total EV counter (max 510)
4. View nature-adjusted base stats in the stat cards
5. Change nature using the nature selector dropdown
6. Use "Reset All EVs" to start over

### Using the IV Calculator
1. Select a Pokemon that has EVs assigned
2. Enter the Pokemon's current level
3. Input the Pokemon's current stats (from in-game)
4. View calculated IV ranges with color coding
5. See total IV percentage and quality assessment

### Understanding Natures
- **Boosted Stats**: Show with +10% modifier (green text)
- **Reduced Stats**: Show with -10% modifier (red text)
- **Neutral Natures**: Hardy, Docile, Serious, Bashful, Quirky have no modifiers
- **Base Stats**: Display nature-adjusted values in both EV and IV calculators

## Technical Details

### Data Sources
- **Pokemon Data**: Uses PokeAPI for accurate Pokemon information
- **Base Stats**: Official base stats from Pokemon games
- **Nature Effects**: Standard 10% modifiers for non-neutral natures

### Calculation Formulas

#### EV Stat Calculation
```
Final Stat = floor(Base Stat × Nature Modifier)
```

#### IV Calculation
```
HP: floor(((2 × Base + IV + floor(EV/4)) × Level/100) + Level + 10)
Other Stats: floor(((2 × Base + IV + floor(EV/4)) × Level/100 + 5) × Nature Modifier)
```

### Limits and Constraints
- **Total EV Limit**: 510 EVs maximum per Pokemon
- **Per-Stat EV Limit**: 252 EVs maximum per individual stat
- **IV Range**: 0-31 for each stat
- **Level Range**: 1-100 for IV calculations
- **Total IV Maximum**: 186 (31 × 6 stats)

## Project Structure

```
├── app/
│   └── (tabs)/
│       ├── _layout.tsx    # Tab navigation layout
│       └── index.tsx      # Main app screen
├── components/
│   ├── EVCounter.tsx      # EV tracking interface
│   ├── IVCalculator.tsx   # IV calculation interface
│   ├── HomeScreen.tsx     # Main app container
│   └── PokemonForm.tsx    # Pokemon selection form
├── services/
│   └── pokemonAPI.ts      # API integration
├── utils/
│   └── pokemonUtils.ts    # Helper functions
└── types.ts               # TypeScript definitions
```

## Development

### Scripts
- `npm start` - Start development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

### Technologies Used
- **React Native** - Mobile app framework
- **Expo** - Development platform and tooling
- **TypeScript** - Type safety and better development experience
- **Expo Router** - File-based routing
- **React Native Safe Area Context** - Safe area handling
- **Axios** - HTTP client for API calls

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [PokeAPI](https://pokeapi.co/) for providing comprehensive Pokemon data
- [Expo](https://expo.dev/) for the excellent development platform
- The Pokemon community for EV and IV calculation formulas and guidance
