import { expect } from "chai";
import { ethers } from "hardhat";
// import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"; // Likely unnecessary with ethers v6 types
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"; // Explicit type import if needed, check if error persists
import type { SpurCoin, ProjectFunding } from "../typechain-types"; // use type imports

// helper function to parse ether amounts
const parseEther = ethers.parseEther;
// helper function to format ether amounts
const formatEther = ethers.formatEther;

describe("ProjectFunding Contract", () => { // use arrow function
  // declare variables to hold contract instances and signers
  let spurCoin: SpurCoin;
  let projectFunding: ProjectFunding;
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let depositor: SignerWithAddress;
  let recipient: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  const initialSpurCoinSupply = parseEther("1000000"); // 1 million spurcoin

  // before each test, deploy new contract instances
  beforeEach(async () => { // use arrow function
    // get signers provided by hardhat
    [owner, creator, depositor, recipient, otherAccount] = await ethers.getSigners();

    // deploy spurcoin
    const SpurCoinFactory = await ethers.getContractFactory("SpurCoin");
    spurCoin = await SpurCoinFactory.connect(owner).deploy(owner.address, initialSpurCoinSupply);
    await spurCoin.waitForDeployment();
    const spurCoinAddress = spurCoin.target; // use .target for address in ethers v6

    // deploy projectfunding, linking it to the deployed spurcoin
    const ProjectFundingFactory = await ethers.getContractFactory("ProjectFunding");
    projectFunding = await ProjectFundingFactory.connect(owner).deploy(spurCoinAddress);
    await projectFunding.waitForDeployment();
    const projectFundingAddress = projectFunding.target; // use .target for address in ethers v6

    // distribute some spurcoin to the creator and depositor for testing
    await spurCoin.connect(owner).transfer(creator.address, parseEther("10000"));
    await spurCoin.connect(owner).transfer(depositor.address, parseEther("5000"));
  });

  // --- test suite starts here ---

  it("should deploy contracts successfully and set initial state", async () => { // use arrow function
    expect(spurCoin.target).to.be.properAddress;
    expect(projectFunding.target).to.be.properAddress;
    // use connect(null) or provider for static calls if needed, checking spurCoin() is a view function
    const linkedSpurCoinAddress = await projectFunding.spurCoin(); 
    expect(linkedSpurCoinAddress).to.equal(spurCoin.target);
    
    // check balances
    const ownerBalance = await spurCoin.balanceOf(owner.address);
    const creatorBalance = await spurCoin.balanceOf(creator.address);
    const depositorBalance = await spurCoin.balanceOf(depositor.address);

    // use BigInt directly for comparisons with ethers v6
    expect(ownerBalance).to.equal(initialSpurCoinSupply - parseEther("15000")); // 1m - 10k - 5k
    expect(creatorBalance).to.equal(parseEther("10000"));
    expect(depositorBalance).to.equal(parseEther("5000"));
    
  });

  describe("Project Creation", () => {
    it("should allow a user to create a new project", async () => {
      const projectName = "test project 1";
      const tx = await projectFunding.connect(creator).createProject(recipient.address, projectName);
      const receipt = await tx.wait(); // wait for transaction confirmation

      // check if the projectcreated event was emitted correctly
      // note: hardhat chai matchers simplify event checking
      await expect(tx)
        .to.emit(projectFunding, "ProjectCreated")
        .withArgs(1, creator.address, recipient.address, projectName); // project id should be 1

      // retrieve project details using the getter function
      const [id, projectCreator, projectRecipient, name] = await projectFunding.getProjectDetails(1);
      
      expect(id).to.equal(1);
      expect(projectCreator).to.equal(creator.address);
      expect(projectRecipient).to.equal(recipient.address);
      expect(name).to.equal(projectName);

      // verify initial balance is zero
      expect(await projectFunding.getProjectBalance(1)).to.equal(0);
    });

    it("should increment project ids correctly", async () => {
        await projectFunding.connect(creator).createProject(recipient.address, "project 1");
        // second project should have id 2
        await expect(projectFunding.connect(otherAccount).createProject(otherAccount.address, "project 2"))
            .to.emit(projectFunding, "ProjectCreated")
            .withArgs(2, otherAccount.address, otherAccount.address, "project 2"); 
        
        const [, , , name2] = await projectFunding.getProjectDetails(2);
        expect(name2).to.equal("project 2");
    });

     it("should fail if recipient address is zero", async () => {
        // const zeroAddress = ethers.constants.AddressZero; // ethers v5 style
        const zeroAddress = ethers.ZeroAddress; // ethers v6 style
        await expect(projectFunding.connect(creator).createProject(zeroAddress, "invalid project"))
            .to.be.revertedWith("invalid recipient address"); // check require message
    });
  });

  describe("Deposits", () => {
    const projectId = 1; // use project 1 for deposit tests
    const depositAmount = parseEther("100");

    beforeEach(async () => {
      // create project 1 before each deposit test
      await projectFunding.connect(creator).createProject(recipient.address, "deposit test project");
    });

    it("should allow a user to deposit spurcoin after approval", async () => {
      // depositor approves the projectfunding contract to spend their spurcoin
      await spurCoin.connect(depositor).approve(projectFunding.target, depositAmount);
      
      // depositor deposits spurcoin into project 1
      const tx = await projectFunding.connect(depositor).deposit(projectId, depositAmount);

      // check event emission
      await expect(tx)
        .to.emit(projectFunding, "DepositMade")
        .withArgs(projectId, depositor.address, depositAmount);

      // check project balance increased
      expect(await projectFunding.getProjectBalance(projectId)).to.equal(depositAmount);

      // check depositor's spurcoin balance decreased
      // initial depositor balance was 5000
      expect(await spurCoin.balanceOf(depositor.address)).to.equal(parseEther("4900")); // 5000 - 100

      // check contract's spurcoin balance increased
      expect(await spurCoin.balanceOf(projectFunding.target)).to.equal(depositAmount);
    });

    it("should fail if depositor has not approved the contract", async () => {
        // depositor tries to deposit without approving first
        await expect(projectFunding.connect(depositor).deposit(projectId, depositAmount))
            .to.be.reverted; // ethers v6 default revert check, could be more specific with erc20 error
            // specific check for ERC20InsufficientAllowance might look like:
            // .to.be.revertedWithCustomError(spurCoin, "ERC20InsufficientAllowance"); // needs abi
    });

    it("should fail if depositing to a non-existent project", async () => {
        const nonExistentProjectId = 99;
        await spurCoin.connect(depositor).approve(projectFunding.target, depositAmount);
        
        await expect(projectFunding.connect(depositor).deposit(nonExistentProjectId, depositAmount))
            .to.revertedWithCustomError(projectFunding, "ProjectDoesNotExist")
            .withArgs(nonExistentProjectId);
    });

    it("should fail if deposit amount is zero", async () => {
        await spurCoin.connect(depositor).approve(projectFunding.target, depositAmount);

        await expect(projectFunding.connect(depositor).deposit(projectId, 0))
            .to.be.revertedWith("deposit amount must be positive");
    });

  });

  describe("Withdrawals", () => {
    const projectId = 1;
    const depositAmount = parseEther("250");

    beforeEach(async () => {
      // create project 1
      await projectFunding.connect(creator).createProject(recipient.address, "withdraw test project");
      // depositor approves and deposits into project 1
      await spurCoin.connect(depositor).approve(projectFunding.target, depositAmount);
      await projectFunding.connect(depositor).deposit(projectId, depositAmount);
    });

    it("should allow the project creator to withdraw funds", async () => {
      const initialRecipientBalance = await spurCoin.balanceOf(recipient.address);
      const initialContractBalance = await spurCoin.balanceOf(projectFunding.target);
      expect(await projectFunding.getProjectBalance(projectId)).to.equal(depositAmount);

      // creator withdraws funds
      const tx = await projectFunding.connect(creator).withdraw(projectId);

      // check event emission
      await expect(tx)
        .to.emit(projectFunding, "WithdrawalMade")
        .withArgs(projectId, creator.address, recipient.address, depositAmount);

      // check project balance is now zero
      expect(await projectFunding.getProjectBalance(projectId)).to.equal(0);

      // check recipient's spurcoin balance increased
      expect(await spurCoin.balanceOf(recipient.address)).to.equal(initialRecipientBalance + depositAmount);

      // check contract's spurcoin balance decreased
      expect(await spurCoin.balanceOf(projectFunding.target)).to.equal(initialContractBalance - depositAmount);
      expect(await spurCoin.balanceOf(projectFunding.target)).to.equal(0); // should be zero after withdrawal
    });

    it("should fail if non-creator tries to withdraw", async () => {
      // depositor (not creator) tries to withdraw
      await expect(projectFunding.connect(depositor).withdraw(projectId))
        .to.revertedWithCustomError(projectFunding, "NotProjectCreator")
        .withArgs(projectId, depositor.address);

      // other account (not creator) tries to withdraw
      await expect(projectFunding.connect(otherAccount).withdraw(projectId))
         .to.revertedWithCustomError(projectFunding, "NotProjectCreator")
         .withArgs(projectId, otherAccount.address);
    });

    it("should fail if project balance is zero", async () => {
      // first withdrawal succeeds
      await projectFunding.connect(creator).withdraw(projectId);
      expect(await projectFunding.getProjectBalance(projectId)).to.equal(0);

      // second withdrawal should fail
      await expect(projectFunding.connect(creator).withdraw(projectId))
        .to.revertedWithCustomError(projectFunding, "NoFundsToWithdraw")
        .withArgs(projectId);
    });

    it("should fail if withdrawing from a non-existent project", async () => {
       const nonExistentProjectId = 99;
       await expect(projectFunding.connect(creator).withdraw(nonExistentProjectId))
        .to.revertedWithCustomError(projectFunding, "ProjectDoesNotExist")
        .withArgs(nonExistentProjectId);
    });

  });

}); 