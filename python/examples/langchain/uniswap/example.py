import os
from dotenv import load_dotenv
from radius_plugins.erc20.token import USDC, Token
from radius_plugins.erc20 import ERC20PluginOptions, erc20
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from web3 import Web3
from web3.middleware.signing import construct_sign_and_send_raw_middleware
from eth_account.signers.local import LocalAccount
from eth_account import Account

from radius_adapters.langchain import get_on_chain_tools
from langchain.agents import AgentExecutor, create_tool_calling_agent
from radius_plugins.uniswap import uniswap, UniswapPluginOptions
from radius_wallets.web3 import Web3EVMWalletClient

# Define RADUSD token for Radius testnet
RADUSD: Token = {
    "decimals": 18,
    "symbol": "RADUSD",
    "name": "Radius Token",
    "chains": {
        1223953: {"contractAddress": "0x9aeEa4f3025940dBdbf6863C7e16a23Ea95272a4"}
    },
}

# Update USDC address for Radius testnet
USDC["chains"][1223953]["contractAddress"] = "0x51fCe89b9f6D4c530698f181167043e1bB4abf89"

# Load environment variables
load_dotenv()

# Initialize Web3 and account
# Connect to Radius
BASE_RPC_URL = os.getenv("BASE_RPC_URL")
w3 = Web3(Web3.HTTPProvider(BASE_RPC_URL))
private_key = os.getenv("WALLET_PRIVATE_KEY")
assert private_key is not None, "You must set WALLET_PRIVATE_KEY environment variable"
assert private_key.startswith("0x"), "Private key must start with 0x hex prefix"

# Verify we're on Radius
chain_id = w3.eth.chain_id
if chain_id != 1223953:  # Radius chain ID
    raise ValueError(f"Must be connected to Radius (chain_id: 1223953), got chain_id: {chain_id}")

account: LocalAccount = Account.from_key(private_key)
w3.eth.default_account = account.address  # Set the default account
w3.eth.default_local_account = account
w3.middleware_onion.add(
    construct_sign_and_send_raw_middleware(account)
)  # Add middleware

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o-mini")

def main():
    """Main function to demonstrate Uniswap plugin functionality."""
    # Print connection information
    print(f"Connected to RPC provider at {os.getenv('BASE_RPC_URL')}")
    print(f"Chain ID: {w3.eth.chain_id}")
    print(f"Connected wallet address: {account.address}")
    eth_balance = w3.eth.get_balance(account.address)
    print(f"ETH Balance: {w3.from_wei(eth_balance, 'ether')} ETH")
    
    # Get the prompt template
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", """You are the Uniswap plugin tester. You can help users test Uniswap functionality including:
1. Check token approvals using uniswap_check_approval
   Example: "Check if I have enough USDC approval for Uniswap"
2. Get swap quotes using uniswap_get_quote
   Example: "Get a quote to swap 1 RADUSD for USDC"
3. Execute token swaps using uniswap_swap_tokens
   Example: "Swap 0.1 RADUSD for USDC"

For testing purposes, use small amounts.

When users ask for token swaps:
1. First check approval using uniswap_check_approval
2. Then get a quote using uniswap_get_quote
3. Finally execute the swap using uniswap_swap_tokens

Always use base units (wei) for amounts. For example:
- 1 RADUSD = 1000000000000000000 (18 decimals)
- 1 USDC = 1000000 (6 decimals)"""),
            ("placeholder", "{chat_history}"),
            ("human", "{input}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    )

    # Initialize tools with web3 wallet and Uniswap plugin
    uniswap_api_key = os.getenv("UNISWAP_API_KEY")
    uniswap_base_url = os.getenv("UNISWAP_BASE_URL", "https://trade-api.gateway.uniswap.org/v1")
    assert uniswap_api_key is not None, "You must set UNISWAP_API_KEY environment variable"
    assert uniswap_base_url is not None, "You must set UNISWAP_BASE_URL environment variable"

    wallet_client = Web3EVMWalletClient(w3)
    try:
        tools = get_on_chain_tools(
            wallet=wallet_client,
            plugins=[
                erc20(options=ERC20PluginOptions(tokens=[USDC, RADUSD])),
                uniswap(options=UniswapPluginOptions(
                    api_key=uniswap_api_key,
                    base_url=uniswap_base_url
                )),
            ],
        )
        print(f"\nTools initialized successfully: {[tool.name for tool in tools]}")
    except Exception as e:
        print(f"\nError initializing tools: {str(e)}")
        return
    
    print("\nUniswap Plugin Test Interface")
    print("Example commands:")
    print("1. Check if I have enough USDC approval for Uniswap")
    print("2. Get a quote to swap 1 RADUSD for USDC")
    print("3. Swap 0.1 RADUSD for USDC")
    print("\nTestnet token addresses:")
    # These are standard Radius-deployed testnet tokens
    print("- RADUSD: 0x9aeEa4f3025940dBdbf6863C7e16a23Ea95272a4")
    print("- USDC: 0x51fCe89b9f6D4c530698f181167043e1bB4abf89")
    print("\nTest amounts:")
    print("- 0.01 RADUSD = 10000000000000000 wei")
    print("- 10 USDC = 10000000 units")

    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, handle_parsing_errors=True, verbose=True)
    
    print("\nType 'quit' to exit\n")
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() == 'quit':
            print("Goodbye!")
            break
            
        try:
            response = agent_executor.invoke({
                "input": user_input,
            })

            print("\nAssistant:", response["output"])
        except Exception as e:
            print("\nError:", str(e))


if __name__ == "__main__":
    main()
