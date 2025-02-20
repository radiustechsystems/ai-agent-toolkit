from typing import Dict, List, TypedDict


class ChainData(TypedDict):
    contractAddress: str


class Token(TypedDict):
    decimals: int
    symbol: str
    name: str
    chains: Dict[int, ChainData]


class ChainSpecificToken(TypedDict):
    chain_id: int
    decimals: int
    symbol: str
    name: str
    contract_address: str

USDC: Token = {
    "decimals": 6,
    "symbol": "USDC",
    "name": "USDC",
    "chains": {
        # TODO: Add USDC contract or utilize existing "RadToken" ERC20 contract
        1223953: {"contractAddress": "<TODO_ADD_RADIUS_USDC_CONTRACT_ADDRESS>"}
    },
}


def get_tokens_for_network(
    chain_id: int, tokens: List[Token]
) -> List[ChainSpecificToken]:
    result: List[ChainSpecificToken] = []

    for token in tokens:
        chain_data = token["chains"].get(chain_id)
        if chain_data:
            result.append(
                {
                    "chain_id": chain_id,
                    "decimals": token["decimals"],
                    "symbol": token["symbol"],
                    "name": token["name"],
                    "contract_address": chain_data["contractAddress"],
                }
            )

    return result
