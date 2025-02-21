import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from web3 import Web3
from web3.middleware import construct_sign_and_send_raw_middleware, geth_poa_middleware
from eth_account.signers.local import LocalAccount
from eth_account import Account

from radius_adapters.langchain import get_on_chain_tools
from radius_plugins.erc20.token import USDC
from radius_plugins.erc20 import erc20, ERC20PluginOptions
from radius_wallets.evm import send_eth
from radius_wallets.web3 import Web3EVMWalletClient

# Initialize Web3 and account
w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_PROVIDER_URL")))
private_key = os.getenv("WALLET_PRIVATE_KEY")
assert private_key is not None, "You must set WALLET_PRIVATE_KEY environment variable"
assert private_key.startswith("0x"), "Private key must start with 0x hex prefix"

w3.middleware_onion.inject(geth_poa_middleware, layer=0)

w3.middleware_onion.add(construct_sign_and_send_raw_middleware(private_key))

account: LocalAccount = Account.from_key(private_key)
w3.eth.default_account = account.address  # Set the default account

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o-mini")


def main():
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
    tools = get_on_chain_tools(
        wallet=Web3EVMWalletClient(w3),
        plugins=[
            send_eth(),
            erc20(options=ERC20PluginOptions(tokens=[USDC]))
        ],
    )
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, handle_parsing_errors=True, verbose=True)
    
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
