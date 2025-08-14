import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";

const { ethers } = hre;

async function main() {
  // get the deployer's address
  const [deployer] = await (hre as any).ethers.getSigners();
  console.log("deploying contracts with the account:", deployer.address);

  // --- deploy spurcoin --- 

  // define the initial supply (e.g., 1 million tokens with 18 decimals)
  // using ethers.parseunits handles the large number conversion correctly
  const initialSupply = ethers.parseUnits("1000000", 18);
  console.log(`deploying spurcoin with initial supply: ${ethers.formatUnits(initialSupply, 18)} spur`);

  // get the contract factory for spurcoin
  const SpurCoinFactory = await ethers.getContractFactory("SpurCoin");
  // deploy the spurcoin contract, passing initial owner (deployer) and initial supply
  const spurCoin = await SpurCoinFactory.deploy(deployer.address, initialSupply);

  // wait for the deployment transaction to be mined
  await spurCoin.waitForDeployment();
  const spurCoinAddress = (spurCoin as any).target as string;
  console.log(`spurcoin deployed to: ${spurCoinAddress}`);

  // --- deploy projectfunding ---

  console.log("deploying projectfunding...");
  // get the contract factory for projectfunding
  const ProjectFundingFactory = await ethers.getContractFactory("ProjectFunding");
  // deploy the projectfunding contract, passing the deployed spurcoin contract address
  const projectFunding = await ProjectFundingFactory.deploy(spurCoinAddress);

  // wait for the deployment transaction to be mined
  await projectFunding.waitForDeployment();
  const projectFundingAddress = (projectFunding as any).target as string;
  console.log(`projectfunding deployed to: ${projectFundingAddress}`);

  // --- deploy SpurRegistry ---
  console.log("deploying spurregistry...");
  const SpurRegistryFactory = await ethers.getContractFactory("SpurRegistry");
  const registry = await SpurRegistryFactory.deploy(
    deployer.address,
    deployer.address, // initial platform wallet is deployer by default
    spurCoinAddress,
    projectFundingAddress
  );
  await registry.waitForDeployment();
  const registryAddress = (registry as any).target as string;
  console.log(`spurregistry deployed to: ${registryAddress}`);

  console.log("\ndeployment complete!");
  console.log("\nexport these envs for backend:");
  console.log(`export BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545`);
  console.log(`export SPUR_REGISTRY_ADDRESS=${registryAddress}`);

  // write deployments file for tooling
  try {
    const outDir = path.join(process.cwd(), "deployments");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "local.json");
    const payload = {
      SpurCoin: spurCoinAddress,
      ProjectFunding: projectFundingAddress,
      SpurRegistry: registryAddress,
    };
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf-8");
    console.log(`wrote deployments to: ${outPath}`);
  } catch (e) {
    console.warn("warning: failed to write deployments file:", e);
  }
}

// standard hardhat pattern to run the main function and handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 