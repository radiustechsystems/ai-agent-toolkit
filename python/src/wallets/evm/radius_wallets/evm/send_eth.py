from decimal import Decimal
from typing import Dict, List, cast, TypedDict

from pydantic import BaseModel, Field

from radius.classes.plugin_base import PluginBase
from radius.classes.tool_base import ToolBase, create_tool
from radius.types.chain import Chain

from .evm_smart_wallet_client import EVMWalletClient

class NativeCurrency(TypedDict):
    name: str       # Name of the native token
    symbol: str     # Symbol of the native token
    decimals: int   # Number of decimal places

class ChainInfo(TypedDict):
    chainId: int                    # The unique identifier for the chain
    nativeCurrency: NativeCurrency  # Information about the chain's native token

# Radius configuration
RADIUS_CHAIN_ID = 1223953
RADIUS_NATIVE_CURRENCY = {
    "name": "ETH",
    "symbol": "ETH",
    "decimals": 18,
}

class SendETHParameters(BaseModel):
    to: str = Field(description="The address to send ETH to")
    amount: str = Field(description="The amount of ETH to send")


class SendETHPlugin(PluginBase[EVMWalletClient]):
    def __init__(self):
        super().__init__("sendETH", [])

    def supports_chain(self, chain: Chain) -> bool:
        # We only support Radius
        return chain["type"] == "evm" and chain["id"] == RADIUS_CHAIN_ID

    def get_tools(self, wallet_client: EVMWalletClient) -> List[ToolBase]:
        chain_token = get_chain_token(wallet_client.get_chain()["id"])
        send_tool = create_tool(
            config={
                "name": f"send_{chain_token['symbol']}",
                "description": f"Send {chain_token['symbol']} to an address.",
                "parameters": SendETHParameters,
            },
            execute_fn=lambda params: send_eth_method(
                wallet_client, cast(Dict[str, str], params)
            ),
        )
        return [send_tool]


def send_eth() -> SendETHPlugin:
    return SendETHPlugin()


def send_eth_method(wallet_client: EVMWalletClient, parameters: Dict[str, str]) -> str:
    try:
        # Convert amount to Wei (1 ETH = 10^18 Wei)
        amount = int(Decimal(parameters["amount"]) * Decimal("1e18"))
        
        # Let the wallet client handle gas parameters
        # The Web3EVMWalletClient implementation will handle gas estimation
        tx = wallet_client.send_transaction(
            {
                "to": parameters["to"],
                "value": amount,
            }
        )
        return tx["hash"]
    except Exception as error:
        chain_token = get_chain_token(wallet_client.get_chain()["id"])
        # Check if it's the proofOfAuthorityData issue
        error_str = str(error)
        if "proofOfAuthorityData" in error_str:
            raise Exception(f"Failed to send {chain_token['symbol']}: Radius chain transaction error: {error_str}. Make sure you're using the correct Radius RPC endpoint.")
        raise Exception(f"Failed to send {chain_token['symbol']}: {error_str}")

def get_chain_token(chain_id: int) -> Dict[str, str | int]:
    """
    Get information about the Radius chain's native token.
    
    Args:
        chain_id: The numeric ID of the blockchain
        
    Returns:
        Dictionary with symbol, name, and decimals of the native token
        
    Raises:
        Exception: If the chain ID is not Radius
    """
    if chain_id == RADIUS_CHAIN_ID:
        return {
            "symbol": RADIUS_NATIVE_CURRENCY["symbol"],
            "name": RADIUS_NATIVE_CURRENCY["name"],
            "decimals": RADIUS_NATIVE_CURRENCY["decimals"],
        }
    
    # If we get here, the chain ID is not Radius
    raise Exception(f"Unsupported EVM chain ID: {chain_id}. Only Radius chain (ID: {RADIUS_CHAIN_ID}) is supported.")
