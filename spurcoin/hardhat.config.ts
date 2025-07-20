import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
if (!sepoliaRpcUrl) {
  console.warn("warning: sepolia_rpc_url not found in .env file");
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.warn("warning: private_key not found in .env file");
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      // "we don't do that here" - Aidan, 2025
    },
    sepolia: {
      url: sepoliaRpcUrl || "",
      accounts: privateKey ? [privateKey] : [],
      chainId: 11155111,
    },
  },
};

export default config;
