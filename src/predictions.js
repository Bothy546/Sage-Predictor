import { getTeamStats } from './teamData';

export const calculatePredictions = (homeTeam, awayTeam, isHomeGame = true) => {
  const homeStats = getTeamStats(homeTeam);
  const awayStats = getTeamStats(awayTeam);

  // Calculate team strength
  const homeStrength = homeStats.attack + homeStats.defense + homeStats.form + (isHomeGame ? 15 : 0);
  const awayStrength = awayStats.attack + awayStats.defense + awayStats.form + (!isHomeGame ? 15 : 0);
  
  const difference = homeStrength - awayStrength;

  // Full Time Result probabilities
  let homeWin, draw, awayWin;
  
  if (difference > 50) {
    homeWin = 75; draw = 18; awayWin = 7;
  } else if (difference > 30) {
    homeWin = 65; draw = 25; awayWin = 10;
  } else if (difference > 15) {
    homeWin = 55; draw = 28; awayWin = 17;
  } else if (difference > 0) {
    homeWin = 45; draw = 30; awayWin = 25;
  } else if (difference > -15) {
    homeWin = 35; draw = 30; awayWin = 35;
  } else if (difference > -30) {
    homeWin = 25; draw = 28; awayWin = 47;
  } else if (difference > -50) {
    homeWin = 15; draw = 25; awayWin = 60;
  } else {
    homeWin = 8; draw = 17; awayWin = 75;
  }

  // Expected Goals
  const homeXG = 1.5 + (homeStats.attack - 50) / 25;
  const awayXG = 1.2 + (awayStats.attack - 50) / 30;
  const totalXG = homeXG + awayXG;

  // BTTS Probability
  const bttsYes = (homeXG > 0.8 && awayXG > 0.8) ? 55 : 35;
  const bttsNo = 100 - bttsYes;

  // Over/Under probabilities
  const over05 = Math.min(95, totalXG > 0.5 ? 85 : 65);
  const over15 = Math.min(90, totalXG > 1.5 ? 75 : 50);
  const over25 = Math.min(85, totalXG > 2.5 ? 65 : 40);
  const over35 = Math.min(75, totalXG > 3.5 ? 50 : 25);
  const over45 = Math.min(65, totalXG > 4.5 ? 35 : 15);

  // Double Chance
  const dc1X = homeWin + draw;
  const dc12 = homeWin + awayWin;
  const dcX2 = draw + awayWin;

  // First Half Result
  const fhHome = Math.round(homeWin * 0.7);
  const fhDraw = Math.round(draw * 1.3);
  const fhAway = Math.round(awayWin * 0.7);

  // Correct Score (Top 5)
  const correctScores = [
    { score: '1-1', probability: Math.round(draw * 0.35) },
    { score: '2-1', probability: Math.round(homeWin * 0.25) },
    { score: '1-0', probability: Math.round(homeWin * 0.30) },
    { score: '2-0', probability: Math.round(homeWin * 0.20) },
    { score: '0-0', probability: Math.round(draw * 0.25) },
  ].sort((a, b) => b.probability - a.probability);

  // Team Total Goals
  const homeOver15 = homeXG > 1.5 ? 65 : 40;
  const awayOver15 = awayXG > 1.5 ? 60 : 35;

  // Compile all markets
  const allMarkets = [
    { market: 'Home Win', probability: homeWin, category: 'FT Result' },
    { market: 'Draw', probability: draw, category: 'FT Result' },
    { market: 'Away Win', probability: awayWin, category: 'FT Result' },
    { market: '1X (Home/Draw)', probability: dc1X, category: 'Double Chance' },
    { market: '12 (Home/Away)', probability: dc12, category: 'Double Chance' },
    { market: 'X2 (Draw/Away)', probability: dcX2, category: 'Double Chance' },
    { market: 'Over 0.5', probability: over05, category: 'Over/Under' },
    { market: 'Over 1.5', probability: over15, category: 'Over/Under' },
    { market: 'Over 2.5', probability: over25, category: 'Over/Under' },
    { market: 'Over 3.5', probability: over35, category: 'Over/Under' },
    { market: 'Over 4.5', probability: over45, category: 'Over/Under' },
    { market: 'Under 0.5', probability: 100 - over05, category: 'Over/Under' },
    { market: 'Under 1.5', probability: 100 - over15, category: 'Over/Under' },
    { market: 'Under 2.5', probability: 100 - over25, category: 'Over/Under' },
    { market: 'Under 3.5', probability: 100 - over35, category: 'Over/Under' },
    { market: 'Under 4.5', probability: 100 - over45, category: 'Over/Under' },
    { market: 'BTTS Yes', probability: bttsYes, category: 'BTTS' },
    { market: 'BTTS No', probability: bttsNo, category: 'BTTS' },
    { market: 'FH Home', probability: fhHome, category: 'First Half' },
    { market: 'FH Draw', probability: fhDraw, category: 'First Half' },
    { market: 'FH Away', probability: fhAway, category: 'First Half' },
    { market: 'Home Over 1.5', probability: homeOver15, category: 'Team Goals' },
    { market: 'Away Over 1.5', probability: awayOver15, category: 'Team Goals' },
  ];

  // Filter markets ≥60%
  const validMarkets = allMarkets.filter(m => m.probability >= 60);

  // Get top 2-3 bets
  const topBets = validMarkets
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  // Calculate safety score
  const maxFT = Math.max(homeWin, draw, awayWin);
  const maxDC = Math.max(dc1X, dc12, dcX2);
  const maxOU = Math.max(over15, over25, 100 - over25);
  const safetyScore = Math.round((maxFT * 0.4) + (maxDC * 0.3) + (maxOU * 0.3));

  // Get confidence emoji
  let confidenceEmoji = '❌';
  if (safetyScore >= 75) confidenceEmoji = '🔥';
  else if (safetyScore >= 65) confidenceEmoji = '⚡';
  else if (safetyScore >= 60) confidenceEmoji = '⚠️';

  return {
    fullTime: { homeWin, draw, awayWin },
    doubleChance: { dc1X, dc12, dcX2 },
    overUnder: { over05, over15, over25, over35, over45 },
    btts: { yes: bttsYes, no: bttsNo },
    firstHalf: { home: fhHome, draw: fhDraw, away: fhAway },
    teamGoals: { homeOver15, awayOver15 },
    correctScores,
    expectedGoals: { home: homeXG.toFixed(2), away: awayXG.toFixed(2) },
    topBets,
    safetyScore,
    confidenceEmoji,
    allMarkets: validMarkets
  };

};
