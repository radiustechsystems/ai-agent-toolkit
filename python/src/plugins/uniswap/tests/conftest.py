"""
Pytest configuration for the Uniswap plugin tests.
"""
import os
import pytest
from radius_plugins.uniswap import UniswapPluginOptions


@pytest.fixture
def api_key():
    """Fixture that provides an API key for testing, using environment variable if available."""
    # Use environment variable if available, otherwise use a test key
    return os.environ.get("UNISWAP_API_KEY", "test_api_key")


@pytest.fixture
def base_url():
    """Fixture that provides a base URL for testing."""
    return "https://test.uniswap.org/api"


@pytest.fixture
def plugin_options(api_key, base_url):
    """Fixture that provides Uniswap plugin options for testing."""
    return UniswapPluginOptions(api_key=api_key, base_url=base_url)


@pytest.fixture
def sample_token_addresses():
    """Fixture that provides sample token addresses for testing."""
    return {
        "usdc": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",  # USDC on Ethereum
        "usdt": "0xdAC17F958D2ee523a2206206994597C13D831ec7",  # USDT on Ethereum
        "dai": "0x6B175474E89094C44Da98b954EedeAC495271d0F",  # DAI on Ethereum
        "weth": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",  # WETH on Ethereum
    }


@pytest.fixture
def sample_wallet_address():
    """Fixture that provides a sample wallet address for testing."""
    return "0x1234567890123456789012345678901234567890"