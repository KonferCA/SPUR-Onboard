import { ethers } from "hardhat";

async function main() {
  // get the deployer's address
  const [deployer] = await ethers.getSigners();
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
  const spurCoinAddress = await spurCoin.getAddress();
  console.log(`spurcoin deployed to: ${spurCoinAddress}`);

  // --- deploy projectfunding ---

  console.log("deploying projectfunding...");
  // get the contract factory for projectfunding
  const ProjectFundingFactory = await ethers.getContractFactory("ProjectFunding");
  // deploy the projectfunding contract, passing the deployed spurcoin contract address
  const projectFunding = await ProjectFundingFactory.deploy(spurCoinAddress);

  // wait for the deployment transaction to be mined
  await projectFunding.waitForDeployment();
  const projectFundingAddress = await projectFunding.getAddress();
  console.log(`projectfunding deployed to: ${projectFundingAddress}`);

  console.log("\ndeployment complete!");
}

// standard hardhat pattern to run the main function and handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 