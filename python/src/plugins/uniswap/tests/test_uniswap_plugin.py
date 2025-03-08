from radius.types.chain import Chain
from radius_plugins.uniswap import uniswap, UniswapPluginOptions

def test_plugin_instantiation():
    """Test that the plugin can be instantiated without errors."""
    # Use a mock API key instead of requiring an environment variable
    mock_api_key = "test_api_key"
    mock_base_url = "https://test.uniswap.org/api"
    
    options = UniswapPluginOptions(api_key=mock_api_key, base_url=mock_base_url)
    plugin = uniswap(options)
    
    assert plugin is not None
    assert plugin.name == "uniswap"
    
    # Test chain support
    radius_chain: Chain = {"type": "evm", "id": 1223953}  # Radius testnet
    
    assert plugin.supports_chain(radius_chain)
