// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProjectFunding
 * @dev manages creation of projects, depositing spurcoin into them, and withdrawing funds to a project recipient.
 */
contract ProjectFunding is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- state variables ---

    IERC20 public immutable spurCoin; // the address of the spurcoin token contract
    uint256 private _nextProjectId; // counter to assign unique ids to projects, starts at 1

    // mapping from project id to project details
    mapping(uint256 => Project) public projects;
    // mapping from project id to the total amount deposited
    mapping(uint256 => uint256) public projectDeposits;

    // --- structs ---

    // defines the structure for a project
    struct Project {
        uint256 id;             // unique identifier for the project
        address creator;        // address that created the project
        address recipient;      // address where withdrawn funds will be sent
        string name;            // name or description of the project
        bool exists;            // flag to check if a project id is valid
    }

    // --- events ---

    event ProjectCreated(
        uint256 indexed projectId, 
        address indexed creator, 
        address indexed recipient, 
        string name
    );
    event DepositMade(
        uint256 indexed projectId, 
        address indexed depositor, 
        uint256 amount
    );
    event WithdrawalMade(
        uint256 indexed projectId, 
        address indexed withdrawer, // address triggering the withdrawal (project creator)
        address indexed recipient, // address receiving the funds
        uint256 amount
    );

    // --- errors ---

    error ProjectDoesNotExist(uint256 projectId);
    error NotProjectCreator(uint256 projectId, address caller);
    error NoFundsToWithdraw(uint256 projectId);
    error TransferFailed();

    // --- constructor ---

    /**
     * @dev sets the spurcoin token address during deployment.
     * @param _spurCoinAddress the address of the deployed spurcoin contract.
     */
    constructor(address _spurCoinAddress) {
        require(_spurCoinAddress != address(0), "invalid token address");
        spurCoin = IERC20(_spurCoinAddress);
        _nextProjectId = 1; // start project ids from 1
    }

    // --- functions ---

    /**
     * @dev creates a new project.
     * increments the project id counter.
     * stores the project details.
     * emits a projectcreated event.
     * @param _recipient the address that will receive funds withdrawn for this project.
     * @param _name the name or description of the project.
     */
    function createProject(address _recipient, string calldata _name) external returns (uint256) {
        require(_recipient != address(0), "invalid recipient address");
        
        uint256 newProjectId = _nextProjectId++; // get current id and then increment for the next one

        projects[newProjectId] = Project({
            id: newProjectId,
            creator: msg.sender,
            recipient: _recipient,
            name: _name,
            exists: true
        });

        emit ProjectCreated(newProjectId, msg.sender, _recipient, _name);
        return newProjectId;
    }

    /**
     * @dev allows a user to deposit spurcoin into a specific project.
     * requires the user to have approved this contract to spend their spurcoin beforehand.
     * uses nonreentrant modifier to prevent reentrancy attacks.
     * @param _projectId the id of the project to deposit into.
     * @param _amount the amount of spurcoin to deposit.
     */
    function deposit(uint256 _projectId, uint256 _amount) external nonReentrant {
        Project storage project = projects[_projectId];
        if (!project.exists) {
            revert ProjectDoesNotExist(_projectId);
        }
        require(_amount > 0, "deposit amount must be positive");

        // transfer tokens from the depositor to this contract
        spurCoin.safeTransferFrom(msg.sender, address(this), _amount);

        projectDeposits[_projectId] += _amount;

        emit DepositMade(_projectId, msg.sender, _amount);
    }

    /**
     * @dev allows the creator of a project to withdraw all deposited funds to the project's designated recipient address.
     * uses nonreentrant modifier to prevent reentrancy attacks.
     * @param _projectId the id of the project to withdraw from.
     */
    function withdraw(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        if (!project.exists) {
            revert ProjectDoesNotExist(_projectId);
        }
        // only the original creator of the project can withdraw
        if (msg.sender != project.creator) {
            revert NotProjectCreator(_projectId, msg.sender);
        }

        uint256 amountToWithdraw = projectDeposits[_projectId];
        if (amountToWithdraw == 0) {
            revert NoFundsToWithdraw(_projectId);
        }

        // reset balance before transfer to prevent reentrancy issues if check/effect/interaction pattern isn't strictly followed by safeTransfer
        projectDeposits[_projectId] = 0; 

        // transfer the funds to the project's recipient address
        spurCoin.safeTransfer(project.recipient, amountToWithdraw);

        emit WithdrawalMade(_projectId, msg.sender, project.recipient, amountToWithdraw);
    }

    /**
     * @dev retrieves the details of a specific project.
     * @param _projectId the id of the project.
     * @return project details: id, creator, recipient, name.
     */
    function getProjectDetails(uint256 _projectId) external view returns (uint256, address, address, string memory) {
        Project storage project = projects[_projectId];
         if (!project.exists) {
            revert ProjectDoesNotExist(_projectId);
        }
        return (project.id, project.creator, project.recipient, project.name);
    }

     /**
     * @dev retrieves the current deposited balance for a specific project.
     * @param _projectId the id of the project.
     * @return the total amount of spurcoin deposited into the project.
     */
    function getProjectBalance(uint256 _projectId) external view returns (uint256) {
         if (!projects[_projectId].exists) {
            revert ProjectDoesNotExist(_projectId);
        }
        return projectDeposits[_projectId];
    }
} 