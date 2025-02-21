import os
from radius.types.chain import RadiusChain
from radius_plugins.uniswap import uniswap, UniswapPluginOptions

def test_plugin_instantiation():
    """Test that the plugin can be instantiated without errors."""
    api_key = os.environ.get("UNISWAP_API_KEY")
    assert api_key is not None, "UNISWAP_API_KEY environment variable is required"
    
    options = UniswapPluginOptions(api_key=api_key)
    plugin = uniswap(options)
    
    assert plugin is not None
    assert plugin.name == "uniswap"
    
    # Test chain support
    radius_chain: RadiusChain = {"type": "evm", "id": 1223953}  # Radius testnet
    
    assert plugin.supports_chain(radius_chain)
