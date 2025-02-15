
export const getContractAddress = chainId => {
  switch(chainId) {
    case 11155111: return process.env.VUE_APP_SEPOLIA_CONTRACT_ADDRESS
    case 10: return process.env.VUE_APP_OPTIMISM_CONTRACT_ADDRESS
    case 44787: return process.env.VUE_APP_ALFAJORES_CONTRACT_ADDRESS
    case 42220: return "not_deployed"
    default: return "not_supported"
  }
}
