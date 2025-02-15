const SEPOLIA_NETWORK_ID = 11155111;
const OPTIMISM_NETWORK_ID = 10;
const CELOALFAJORES = 44787;
const CELO = 42220;

export const NETWORK_IDS = {
  development: [SEPOLIA_NETWORK_ID, CELOALFAJORES],
  production: [OPTIMISM_NETWORK_ID, CELO],
  staging: SEPOLIA_NETWORK_ID,
};

export const NETWORK_NAMES = {
  11155111: "Sepolia",
  10: "Optimism",
  44747: "CeloAlfajores",
  42220: "Celo"
};
