export const TEAM_STATS = {
  // TOP TIER (85/80/85)
  'Manchester City': { attack: 85, defense: 80, form: 85 },
  'Real Madrid': { attack: 85, defense: 80, form: 85 },
  'Bayern Munich': { attack: 85, defense: 80, form: 85 },
  'Barcelona': { attack: 85, defense: 80, form: 85 },
  'Liverpool': { attack: 85, defense: 80, form: 85 },
  'Arsenal': { attack: 85, defense: 80, form: 85 },
  'Paris Saint-Germain': { attack: 85, defense: 80, form: 85 },
  'PSG': { attack: 85, defense: 80, form: 85 },

  // GOOD TIER (70/70/70)
  'Brighton & Hove Albion': { attack: 70, defense: 70, form: 70 },
  'Brighton': { attack: 70, defense: 70, form: 70 },
  'Aston Villa': { attack: 70, defense: 70, form: 70 },
  'Newcastle United': { attack: 70, defense: 70, form: 70 },
  'Newcastle': { attack: 70, defense: 70, form: 70 },
  'Atlético Madrid': { attack: 70, defense: 70, form: 70 },
  'Atletico Madrid': { attack: 70, defense: 70, form: 70 },
  'Inter Milan': { attack: 70, defense: 70, form: 70 },
  'Inter': { attack: 70, defense: 70, form: 70 },
  'AC Milan': { attack: 70, defense: 70, form: 70 },
  'Milan': { attack: 70, defense: 70, form: 70 },
  'SSC Napoli': { attack: 70, defense: 70, form: 70 },
  'Napoli': { attack: 70, defense: 70, form: 70 },
  'Tottenham Hotspur': { attack: 70, defense: 70, form: 70 },
  'Tottenham': { attack: 70, defense: 70, form: 70 },
  'Chelsea FC': { attack: 70, defense: 70, form: 70 },
  'Chelsea': { attack: 70, defense: 70, form: 70 },
  'Manchester United': { attack: 70, defense: 70, form: 70 },
  'Juventus': { attack: 70, defense: 70, form: 70 },
  'Borussia Dortmund': { attack: 70, defense: 70, form: 70 },
  'Dortmund': { attack: 70, defense: 70, form: 70 },
  'RB Leipzig': { attack: 70, defense: 70, form: 70 },
  'Leipzig': { attack: 70, defense: 70, form: 70 },
  'Bayer Leverkusen': { attack: 70, defense: 70, form: 70 },
  'Leverkusen': { attack: 70, defense: 70, form: 70 },

  // AVERAGE TIER (55/60/55)
  'Everton FC': { attack: 55, defense: 60, form: 55 },
  'Everton': { attack: 55, defense: 60, form: 55 },
  'Wolverhampton Wanderers': { attack: 55, defense: 60, form: 55 },
  'Wolves': { attack: 55, defense: 60, form: 55 },
  'Fulham FC': { attack: 55, defense: 60, form: 55 },
  'Fulham': { attack: 55, defense: 60, form: 55 },
  'Brentford FC': { attack: 55, defense: 60, form: 55 },
  'Brentford': { attack: 55, defense: 60, form: 55 },
  'Crystal Palace': { attack: 55, defense: 60, form: 55 },
  'West Ham United': { attack: 55, defense: 60, form: 55 },
  'West Ham': { attack: 55, defense: 60, form: 55 },
  'Nottingham Forest': { attack: 55, defense: 60, form: 55 },
  'AFC Bournemouth': { attack: 55, defense: 60, form: 55 },
  'Bournemouth': { attack: 55, defense: 60, form: 55 },

  // WEAK TIER (45/50/45) - Default for all others
};

export const getTeamStats = (teamName) => {
  if (TEAM_STATS[teamName]) {
    return TEAM_STATS[teamName];
  }
  // Default for unknown teams
  return { attack: 45, defense: 50, form: 45 };
};

export const LEAGUES = {
  'PL': 'Premier League',
  'PD': 'La Liga',
  'BL1': 'Bundesliga',
  'SA': 'Serie A',
  'FL1': 'Ligue 1',
  'DED': 'Eredivisie',
  'PPL': 'Primeira Liga',
  'ELC': 'Championship',
  'CL': 'Champions League',
  'EL': 'Europa League'

};
