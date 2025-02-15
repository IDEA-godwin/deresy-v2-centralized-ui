import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { createClient, http } from "viem";
import { celo, celoAlfajores, optimism, sepolia } from "viem/chains";

export const projectId = '5c273bafcd34bc0b510415376e6b1a36';

export const metadata = {
  name: "Deresy",
  description: "A DEcentralized REview SYstem on Optimism",
  url: "https://deresy.xyz/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const networks = process.env.NODE_ENV === 'development' ? [sepolia, celoAlfajores] : [optimism, celo]

export const getWagmiAdapter = () => {
  return new WagmiAdapter({
    networks,
    projectId,
    client({ chain }) {
      return createClient({ chain, transport: http() })
    },
  })
}

export const getWagmiConfig = () => getWagmiAdapter().wagmiConfig

