const { ethers } = require("ethers");
const { ERC20_CONTRACT_ADDRESS, INFURA_PROJECT_ID } = require("../config");

const provider = new ethers.providers.InfuraProvider(
  "homestead",
  INFURA_PROJECT_ID
);
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];
const contract = new ethers.Contract(
  ERC20_CONTRACT_ADDRESS,
  ERC20_ABI,
  provider
);

async function getBalance(address) {
  try {
    const balance = await contract.balanceOf(address);
    console.log(`Balance: ${balance} tokens`);
    // Format the balance (assuming the token has 18 decimals)
    const formattedBalance = ethers.utils.formatUnits(balance, 18);

    // Display the formatted balance
    console.log(`formattedBalance: ${formattedBalance} tokens`);
    return { success: true, tokenbalance: formattedBalance };
  } catch (error) {
    console.error("Error fetching balance:", error);
    return { success: false, tokenbalance: 0 };
  }
}

module.exports = getBalance;
