from radius.types.chain import Chain
from radius_plugins.uniswap import UniswapPlugin, UniswapPluginOptions


class TestUniswapPlugin:
    """Test suite for the Uniswap plugin."""

    def setup_method(self):
        """Set up test fixtures before each test."""
        self.test_api_key = "test_api_key"
        self.test_base_url = "https://test.uniswap.org/api"
        self.options = UniswapPluginOptions(api_key=self.test_api_key, base_url=self.test_base_url)
        self.plugin = UniswapPlugin(self.options)

    def test_plugin_initialization(self):
        """Test that the plugin is properly initialized."""
        # Check plugin properties
        assert self.plugin is not None
        assert self.plugin.name == "uniswap"
        assert len(self.plugin.services) == 1
        
        # Check service properties
        service = self.plugin.services[0]
        assert service.api_key == self.test_api_key
        assert service.base_url == self.test_base_url

    def test_options_configuration(self):
        """Test that options are properly configured."""
        # Create options with various base URL formats
        options1 = UniswapPluginOptions(api_key="key1", base_url="https://example.com/api")
        options2 = UniswapPluginOptions(api_key="key2", base_url="https://example.com/api/")  # with trailing slash
        
        # Create plugins with these options
        plugin1 = UniswapPlugin(options1)
        plugin2 = UniswapPlugin(options2)
        
        # Check base URLs (should normalize trailing slashes)
        assert plugin1.services[0].base_url == "https://example.com/api"
        assert plugin2.services[0].base_url == "https://example.com/api"  # trailing slash removed
        
        # Check API keys
        assert plugin1.services[0].api_key == "key1"
        assert plugin2.services[0].api_key == "key2"

    def test_supports_chain_valid(self):
        """Test the supports_chain method with valid chains."""
        # Test Radius chain support
        radius_chain: Chain = {"type": "evm", "id": 1223953}
        assert self.plugin.supports_chain(radius_chain) is True
        
    def test_supports_chain_invalid(self):
        """Test the supports_chain method with invalid chains."""
        # Test with non-EVM chain
        solana_chain: Chain = {"type": "solana", "id": 101}
        assert self.plugin.supports_chain(solana_chain) is False
        
        # Test with unsupported EVM chain ID
        ethereum_chain: Chain = {"type": "evm", "id": 1}  # Ethereum Mainnet
        assert self.plugin.supports_chain(ethereum_chain) is False

    def test_chain_id_map(self):
        """Test the chain ID mapping in the service."""
        service = self.plugin.services[0]
        
        # Check Radius chain ID mapping
        assert 1223953 in service.chain_id_map
        assert service.chain_id_map[1223953] == "RADIUS"