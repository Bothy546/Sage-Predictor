import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import axios from 'axios';
import { calculatePredictions } from './predictions';
import { LEAGUES } from './teamData';

const App = () => {
  const [screen, setScreen] = useState('HOME');
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [error, setError] = useState('');

  const fetchMatches = async () => {
    if (!apiKey) {
      setError('Please enter API key in Settings');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const dateFrom = today.toISOString().split('T')[0];
      const dateTo = nextWeek.toISOString().split('T')[0];

      const leagueCodes = Object.keys(LEAGUES);
      const allMatches = [];

      // Fetch matches from all leagues
      for (const code of leagueCodes) {
        try {
          const response = await axios.get(
            `https://api.football-data.org/v4/competitions/${code}/matches`,
            {
              headers: { 'X-Auth-Token': apiKey },
              params: { dateFrom, dateTo }
            }
          );

          if (response.data.matches) {
            const matchesWithPredictions = response.data.matches.map(match => {
              const predictions = calculatePredictions(
                match.homeTeam.name,
                match.awayTeam.name,
                true
              );

              return {
                id: match.id,
                homeTeam: match.homeTeam.name,
                awayTeam: match.awayTeam.name,
                league: LEAGUES[code] || code,
                time: new Date(match.utcDate).toLocaleString(),
                date: match.utcDate,
                predictions
              };
            });

            allMatches.push(...matchesWithPredictions);
          }
        } catch (err) {
          console.log(`Error fetching ${code}:`, err.message);
        }
      }

      // Filter matches with safety score >= 60
      const validMatches = allMatches.filter(m => m.predictions.safetyScore >= 60);
      
      // Sort by safety score
      validMatches.sort((a, b) => b.predictions.safetyScore - a.predictions.safetyScore);

      setMatches(validMatches);
      setLoading(false);
    } catch (err) {
      setError('Error fetching matches: ' + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey && screen === 'HOME') {
      fetchMatches();
    }
  }, [apiKey, screen]);

  const renderHomeScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>🧙 Sage Predictor</Text>
      <Text style={styles.tagline}>Wise Betting, Smart Profits</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.matchCard}
              onPress={() => {
                setSelectedMatch(item);
                setScreen('DETAIL');
              }}
            >
              <View style={styles.matchHeader}>
                <Text style={styles.league}>{item.league}</Text>
                <Text style={styles.confidence}>{item.predictions.confidenceEmoji} {item.predictions.safetyScore}%</Text>
              </View>
              
              <View style={styles.teams}>
                <Text style={styles.teamName}>{item.homeTeam}</Text>
                <Text style={styles.vs}>vs</Text>
                <Text style={styles.teamName}>{item.awayTeam}</Text>
              </View>

              <Text style={styles.time}>{item.time}</Text>

              <View style={styles.topBets}>
                <Text style={styles.topBetsTitle}>TOP BETS:</Text>
                {item.predictions.topBets.map((bet, index) => (
                  <Text key={index} style={styles.bet}>
                    ✓ {bet.market}: {bet.probability}%
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {apiKey ? 'No matches found for next 7 days' : 'Enter API key in Settings to view matches'}
            </Text>
          }
        />
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={fetchMatches}>
        <Text style={styles.refreshText}>🔄 Refresh Matches</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDetailScreen = () => {
    if (!selectedMatch) return null;

    const p = selectedMatch.predictions;

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Match Analysis</Text>
        
        <View style={styles.detailCard}>
          <Text style={styles.detailLeague}>{selectedMatch.league}</Text>
          <View style={styles.detailTeams}>
            <Text style={styles.detailTeamName}>{selectedMatch.homeTeam}</Text>
            <Text style={styles.detailVs}>vs</Text>
            <Text style={styles.detailTeamName}>{selectedMatch.awayTeam}</Text>
          </View>
          <Text style={styles.detailTime}>{selectedMatch.time}</Text>
          <Text style={styles.safetyScore}>
            Safety Score: {p.safetyScore}% {p.confidenceEmoji}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 FULL TIME RESULT</Text>
          <Text style={styles.marketItem}>Home Win: {p.fullTime.homeWin}%</Text>
          <Text style={styles.marketItem}>Draw: {p.fullTime.draw}%</Text>
          <Text style={styles.marketItem}>Away Win: {p.fullTime.awayWin}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 DOUBLE CHANCE</Text>
          <Text style={styles.marketItem}>1X (Home/Draw): {p.doubleChance.dc1X}%</Text>
          <Text style={styles.marketItem}>12 (Home/Away): {p.doubleChance.dc12}%</Text>
          <Text style={styles.marketItem}>X2 (Draw/Away): {p.doubleChance.dcX2}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚽ OVER/UNDER GOALS</Text>
          <Text style={styles.marketItem}>Over 0.5: {p.overUnder.over05}%</Text>
          <Text style={styles.marketItem}>Over 1.5: {p.overUnder.over15}%</Text>
          <Text style={styles.marketItem}>Over 2.5: {p.overUnder.over25}%</Text>
          <Text style={styles.marketItem}>Over 3.5: {p.overUnder.over35}%</Text>
          <Text style={styles.marketItem}>Over 4.5: {p.overUnder.over45}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 BTTS (Both Teams To Score)</Text>
          <Text style={styles.marketItem}>Yes: {p.btts.yes}%</Text>
          <Text style={styles.marketItem}>No: {p.btts.no}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ FIRST HALF RESULT</Text>
          <Text style={styles.marketItem}>FH Home: {p.firstHalf.home}%</Text>
          <Text style={styles.marketItem}>FH Draw: {p.firstHalf.draw}%</Text>
          <Text style={styles.marketItem}>FH Away: {p.firstHalf.away}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎲 CORRECT SCORE (Top 5)</Text>
          {p.correctScores.map((cs, index) => (
            <Text key={index} style={styles.marketItem}>
              {cs.score}: {cs.probability}%
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 TEAM TOTAL GOALS</Text>
          <Text style={styles.marketItem}>Home Over 1.5: {p.teamGoals.homeOver15}%</Text>
          <Text style={styles.marketItem}>Away Over 1.5: {p.teamGoals.awayOver15}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 EXPECTED GOALS (xG)</Text>
          <Text style={styles.marketItem}>Home xG: {p.expectedGoals.home}</Text>
          <Text style={styles.marketItem}>Away xG: {p.expectedGoals.away}</Text>
        </View>
      </ScrollView>
    );
  };

  const renderSettingsScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>
      
      <View style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>Football-Data.org API Key:</Text>
        <TextInput
          style={styles.input}
          value={tempApiKey}
          onChangeText={setTempApiKey}
          placeholder="Enter your API key"
          placeholderTextColor="#999"
        />
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            setApiKey(tempApiKey);
            setError('');
            alert('API Key saved! Go to HOME to view matches.');
          }}
        >
          <Text style={styles.saveButtonText}>💾 Save API Key</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Get your FREE API key from:{'\n'}
          https://www.football-data.org/
        </Text>

        <Text style={styles.warningText}>
          ⚠️ Note: API key is stored in memory only.{'\n'}
          You'll need to re-enter it if you close the app.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.app}>
      {/* Navigation Buttons */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navButton, screen === 'HOME' && styles.navButtonActive]}
          onPress={() => setScreen('HOME')}
        >
          <Text style={[styles.navText, screen === 'HOME' && styles.navTextActive]}>
            HOME
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, screen === 'DETAIL' && styles.navButtonActive]}
          onPress={() => setScreen('DETAIL')}
        >
          <Text style={[styles.navText, screen === 'DETAIL' && styles.navTextActive]}>
            DETAILS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, screen === 'SETTINGS' && styles.navButtonActive]}
          onPress={() => setScreen('SETTINGS')}
        >
          <Text style={[styles.navText, screen === 'SETTINGS' && styles.navTextActive]}>
            SETTINGS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Content */}
      {screen === 'HOME' && renderHomeScreen()}
      {screen === 'DETAIL' && renderDetailScreen()}
      {screen === 'SETTINGS' && renderSettingsScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  nav: {
    flexDirection: 'row',
    backgroundColor: '#2d2d2d',
    paddingVertical: 10,
    paddingTop: 40,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  navButtonActive: {
    borderBottomColor: '#4CAF50',
  },
  navText: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navTextActive: {
    color: '#4CAF50',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 12,
  },
  loader: {
    marginTop: 50,
  },
  matchCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  league: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  confidence: {
    color: '#FFC107',
    fontSize: 12,
    fontWeight: 'bold',
  },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  teamName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  vs: {
    color: '#888',
    fontSize: 12,
    marginHorizontal: 8,
  },
  time: {
    color: '#888',
    fontSize: 11,
    marginBottom: 10,
  },
  topBets: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 5,
  },
  topBetsTitle: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bet: {
    color: '#fff',
    fontSize: 11,
    marginBottom: 3,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 14,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  refreshText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailCard: {
    backgroundColor: '#2d2d2d',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  detailLeague: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailTeams: {
    alignItems: 'center',
    marginBottom: 10,
  },
  detailTeamName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  detailVs: {
    color: '#888',
    fontSize: 14,
    marginVertical: 5,
  },
  detailTime: {
    color: '#888',
    fontSize: 12,
    marginBottom: 10,
  },
  safetyScore: {
    color: '#FFC107',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#2d2d2d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  marketItem: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 5,
    paddingLeft: 10,
  },
  settingsCard: {
    backgroundColor: '#2d2d2d',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  settingsLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 18,
  },
  warningText: {
    color: '#FFC107',
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});


export default App;
