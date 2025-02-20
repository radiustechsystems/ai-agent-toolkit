from typing import TypedDict, Literal, Union

class EvmChain(TypedDict):
    """EVM chain type definition
    
    Args:
        type: Literal "evm" chain type identifier
        id: Chain ID number for EVM networks
    """
    type: Literal["evm"]
    id: int

Chain = Union[EvmChain]
