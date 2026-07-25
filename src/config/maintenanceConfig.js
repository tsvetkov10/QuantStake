// Maintenance Mode Configuration for QuantStakes Production Pages
// Set any page to true to show the Maintenance / System Upgrade screen, or false to keep active.

export const MAINTENANCE_CONFIG = {
  social: true,        // Social Feed & Signal Marketplace
  leaderboard: true,   // Analyst Leaderboard & Track Records
  tools: true,         // Kelly & Arbitrage Calculators
  addBet: true,        // Bet Slip Parser & Manual Entry
  history: true,       // Bet History & Verification Ledger
  settings: false,     // Account & Profile Settings (active)
};
