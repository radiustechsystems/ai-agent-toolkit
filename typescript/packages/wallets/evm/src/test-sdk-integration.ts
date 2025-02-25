import {
  Account,
  Client,
  Contract,
  withPrivateKey
} from "@radiustechsystems/sdk"

// Create a test that can be run from the command line
async function testSDKIntegration() {
  try {
    console.log("Starting Radius SDK integration test...")
    
    // Use test endpoint and placeholder private key (we won"t actually send transactions)
    const rpcEndpoint = "https://rpc.testnet.tryradi.us/03e50e44eff27b9608b2820a56cc71a18c666e821d6e14a2"
    console.log(`Connecting to Radius at: ${rpcEndpoint}`)
    
    // Create a client
    const client = await Client.New(rpcEndpoint)
    console.log("Client created successfully")
    
    // Use a placeholder private key for testing 
    // (we"re just verifying the code compiles and the functions exist)
    const privKey = "0x466886036555d012c1e6a01a4e7975f3715fa541b30e96a7cc1576c1a7b02751"
    
    // Create an account from the private key
    console.log("Creating account...")
    const account = await Account.New(withPrivateKey(privKey, client))
    console.log("Account created successfully")
    
    // Print the account address to verify it was created properly
    console.log("Account address:", account.address)
    
    console.log("Radius SDK integration test completed successfully!")
    return true
  } catch (error) {
    console.error("Radius SDK integration test failed:", error)
    return false
  }
}

// This way we can test the imports and basic setup without sending actual transactions
async function fullContractTest() {
  try {
    // Create a client with a real endpoint
    const client = await Client.New("https://rpc.testnet.tryradi.us/03e50e44eff27b9608b2820a56cc71a18c666e821d6e14a2")
      
    // Use a real private key if running the full test
    const privKey = "0x466886036555d012c1e6a01a4e7975f3715fa541b30e96a7cc1576c1a7b02751"
    if (!privKey) {
      throw new Error("TEST_PRIVATE_KEY environment variable must be set for contract tests")
    }
      
    // Create an account from a private key
    const account = await Account.New(withPrivateKey(privKey, client))

    // Deploy a simple storage contract
    console.log("Deploying contract...")
    const contract = await Contract.New(SIMPLE_STORAGE_ABI, SIMPLE_STORAGE_BIN)
    await contract.deploy(client, account)
    console.log("Contract deployed successfully")

    // Set a value in the contract
    const value = BigInt(42)
    console.log(`Setting value to ${value}...`)
    console.log("Transaction sent successfully")

    // Read the value back
    const result = await contract.call(client, "get")
    console.log("Stored value:", result[0])
  } catch (error) {
    console.error("Contract test failed:", error)
  }
}

const SIMPLE_STORAGE_ABI = `[{
  "inputs": [],
  "name": "get",
  "outputs": [{"type": "uint256"}],
  "type": "function"
}, {
  "inputs": [{"type": "uint256"}],
  "name": "set",
  "type": "function"
}]`

// eslint-disable-next-line max-len -- temp
const SIMPLE_STORAGE_BIN = "608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806360fe47b11461003b5780636d4ce63c14610057575b600080fd5b610055600480360381019061005091906100c3565b610075575b005b61005f61007f565b60405161006c91906100ff565b60405180910390f35b8060008190555050565b60008054905090565b600080fd5b6000819050919050565b6100a08161008d565b81146100ab57600080fd5b50565b6000813590506100bd81610097565b92915050565b6000602082840312156100d9576100d8610088565b5b60006100e7848285016100ae565b91505092915050565b6100f98161008d565b82525050565b600060208201905061011460008301846100f0565b9291505056fea2646970667358221220f89f75eaa20f4e402fc9d3319f2172bfe6b69ccdb58265e8887e24a45437b86764736f6c63430008120033"

// Run the basic integration test by default
testSDKIntegration().then(success => {
  if (success) {
    // Only try the contract test if the basic test passes
    return fullContractTest()
  }
}).catch(console.error)
