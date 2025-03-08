import pytest
from radius_plugins.jsonrpc import jsonrpc, JSONRpcPlugin, JSONRpcPluginOptions
from radius.types.chain import Chain


class TestJSONRpcPlugin:
    """Test suite for the JSON-RPC plugin."""

    def test_plugin_initialization(self):
        """Test that the plugin can be properly initialized."""
        # Create plugin options with test endpoint
        options = JSONRpcPluginOptions(endpoint="https://example.com/jsonrpc")
        
        # Initialize plugin
        plugin = jsonrpc(options)
        
        # Check plugin properties
        assert plugin is not None
        assert isinstance(plugin, JSONRpcPlugin)
        assert plugin.name == "jsonrpc"
        assert len(plugin.services) == 1
    
    def test_endpoint_configuration(self):
        """Test that the endpoint is properly configured."""
        # Create plugin options with test endpoint
        test_endpoint = "https://example.com/jsonrpc"
        options = JSONRpcPluginOptions(endpoint=test_endpoint)
        
        # Initialize plugin
        plugin = jsonrpc(options)
        
        # Check that the service has the correct endpoint
        assert plugin.services[0].endpoint == test_endpoint
    
    def test_supports_chain(self):
        """Test the supports_chain method of the plugin."""
        # Create plugin
        options = JSONRpcPluginOptions(endpoint="https://example.com/jsonrpc")
        plugin = jsonrpc(options)
        
        # Test with different chain types (all should be supported)
        chains = [
            {"type": "evm", "id": 1},
            {"type": "solana", "id": 101},
            {"type": "custom", "id": 999},
        ]
        
        for chain in chains:
            assert plugin.supports_chain(chain) is True, f"Plugin should support chain: {chain}"
    
    def test_plugin_factory_function(self):
        """Test that the jsonrpc factory function creates and returns a plugin instance."""
        # Create plugin via factory function
        options = JSONRpcPluginOptions(endpoint="https://example.com/jsonrpc")
        plugin = jsonrpc(options)
        
        # Check plugin
        assert plugin is not None
        assert plugin.name == "jsonrpc"
        assert plugin.services[0] is not None