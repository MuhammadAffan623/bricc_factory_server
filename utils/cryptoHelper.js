
// Import ethers library
const { ethers } = require('ethers');

// Infura Project ID (Replace with your own Project ID from Infura)
const INFURA_PROJECT_ID = '6da4e973f4ce4bfa905fca9323610818';

// Connect to the Ethereum mainnet using Infura
const provider = new ethers.providers.InfuraProvider('homestead', INFURA_PROJECT_ID);

// ERC20 Contract ABI (Replace this with the ABI of your specific ERC20 contract)
const ERC20_ABI = [
    // Minimal ABI to interact with the balanceOf method
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    }
];

// Replace with your ERC20 contract address
const ERC20_CONTRACT_ADDRESS = '0x6F1E92fb8a685AaA0710BAD194D7B1aa839F7F8a';

// Create a contract instance
const contract = new ethers.Contract(ERC20_CONTRACT_ADDRESS, ERC20_ABI, provider);

// Replace with the address you want to check the balance of
const address = '0x0A2d40cd15BCF1616281c8c0276F351496B4A0f8';

// Function to get and format the balance
async function getBalance() {
    try {
        // Call the balanceOf method
        const balance = await contract.balanceOf(address);
        console.log(`Balance: ${balance} tokens`);
        // Format the balance (assuming the token has 18 decimals)
        const formattedBalance = ethers.utils.formatUnits(balance, 18);
        
        // Display the formatted balance
        console.log(`formattedBalance: ${formattedBalance} tokens`);
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

module.exports = getBalance;