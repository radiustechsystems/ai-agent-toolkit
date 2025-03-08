import pytest
from radius_plugins.erc20 import erc20, ERC20Plugin, ERC20PluginOptions
from radius_plugins.erc20.token import Token
from radius.types.chain import Chain


class TestERC20Plugin:
    def test_plugin_initialization(self):
        """Test that the plugin can be properly initialized."""
        # Create sample tokens
        tokens: list[Token] = [
            {
                "decimals": 18,
                "symbol": "TEST",
                "name": "Test Token",
                "chains": {
                    1: {"contractAddress": "0x1234567890123456789012345678901234567890"},
                },
            },
        ]
        
        # Create plugin options
        options = ERC20PluginOptions(tokens=tokens)
        
        # Initialize plugin
        plugin = erc20(options)
        
        # Check plugin properties
        assert plugin is not None
        assert isinstance(plugin, ERC20Plugin)
        assert plugin.name == "erc20"
        assert len(plugin.services) == 1
    
    def test_supports_chain(self):
        """Test the supports_chain method of the plugin."""
        # Create plugin
        tokens: list[Token] = []
        options = ERC20PluginOptions(tokens=tokens)
        plugin = erc20(options)
        
        # Test EVM chains (should be supported)
        evm_chain: Chain = {"type": "evm", "id": 1}
        assert plugin.supports_chain(evm_chain) is True
        
        # Test other chain types (should not be supported)
        solana_chain: Chain = {"type": "solana", "id": 101}
        assert plugin.supports_chain(solana_chain) is False
    
    def test_plugin_factory_function(self):
        """Test that the erc20 factory function creates and returns a plugin instance."""
        # Create sample tokens
        tokens: list[Token] = [
            {
                "decimals": 18,
                "symbol": "TEST",
                "name": "Test Token",
                "chains": {
                    1: {"contractAddress": "0x1234567890123456789012345678901234567890"},
                },
            },
        ]
        
        # Create plugin via factory function
        options = ERC20PluginOptions(tokens=tokens)
        plugin = erc20(options)
        
        # Check plugin
        assert plugin is not None
        assert plugin.name == "erc20"
        assert plugin.services[0] is not None