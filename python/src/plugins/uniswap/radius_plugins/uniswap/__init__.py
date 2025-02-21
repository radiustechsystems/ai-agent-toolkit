from dataclasses import dataclass
from radius.classes.plugin_base import PluginBase
from .service import UniswapService


@dataclass
class UniswapPluginOptions:
    """Options for the UniswapPlugin."""
    api_key: str  # API key for external service integration
    base_url: str  # Base URL for Uniswap API


class UniswapPlugin(PluginBase):
    """Uniswap plugin for token swaps on the Radius network."""
    def __init__(self, options: UniswapPluginOptions):
        super().__init__("uniswap", [UniswapService(options.api_key, options.base_url)])

    def supports_chain(self, chain) -> bool:
        """Check if the chain is supported by Uniswap.
        
        Currently supports:
        - Radius (1223953)
        """
        if chain['type'] != 'evm':
            return False
            
        # List of supported chain IDs from uniswap.plugin.ts
        SUPPORTED_CHAIN_IDS = [
            1223953,  # Radius
        ]
        return chain['id'] in SUPPORTED_CHAIN_IDS


def uniswap(options: UniswapPluginOptions) -> UniswapPlugin:
    """Create a new instance of the Uniswap plugin.
    
    Args:
        options: Configuration options for the plugin
        
    Returns:
        A configured UniswapPlugin instance
    """
    return UniswapPlugin(options)
