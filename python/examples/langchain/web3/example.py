import os
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from web3 import Web3
from web3.middleware.signing import construct_sign_and_send_raw_middleware
from web3.middleware import geth_poa_middleware
from eth_account.signers.local import LocalAccount
from eth_account import Account

from radius_adapters.langchain import get_on_chain_tools
from langchain.agents import AgentExecutor, create_tool_calling_agent
from radius_plugins.erc20.token import USDC, Token

from radius_plugins.erc20 import erc20, ERC20PluginOptions
from radius_wallets.evm import send_eth
from radius_wallets.web3 import Web3EVMWalletClient

# Define RAD token for Radius testnet
RAD: Token = {
    "decimals": 18,
    "symbol": "RAD",
    "name": "Radius Token",
    "chains": {
        1223953: {"contractAddress": "0xB73AAc53149af16DADA10D7cC99a9c4Cb722e21E"}
    },
}

# Update USDC address for Radius testnet
USDC["chains"][1223953]["contractAddress"] = "0x51fCe89b9f6D4c530698f181167043e1bB4abf89"

# Load environment variables
load_dotenv()

# Initialize Web3 and account
w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_PROVIDER_URL")))
private_key = os.getenv("WALLET_PRIVATE_KEY")
assert private_key is not None, "You must set WALLET_PRIVATE_KEY environment variable"
assert private_key.startswith("0x"), "Private key must start with 0x hex prefix"

w3.middleware_onion.inject(geth_poa_middleware, layer=0)

account: LocalAccount = Account.from_key(private_key)
w3.eth.default_account = account.address  # Set the default account
w3.eth.default_local_account = account
w3.middleware_onion.add(construct_sign_and_send_raw_middleware(account))

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o-mini")


def main():
    # Print connection information
    print(f"Connected to RPC provider at {os.getenv('RPC_PROVIDER_URL')}")
    print(f"Chain ID: {w3.eth.chain_id}")
    print(f"Connected wallet address: {account.address}")
    eth_balance = w3.eth.get_balance(account.address)
    print(f"ETH Balance: {w3.from_wei(eth_balance, 'ether')} ETH")
    
    # Get the prompt template
    prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant"),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)

    # Initialize tools with web3 wallet
    wallet_client = Web3EVMWalletClient(w3)
    tools = get_on_chain_tools(
        wallet=wallet_client,
        plugins=[
            send_eth(),
            erc20(options=ERC20PluginOptions(tokens=[USDC, RAD]))
        ],
    )
    
    print(f"\nTools initialized successfully: {[tool.name for tool in tools]}")

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
