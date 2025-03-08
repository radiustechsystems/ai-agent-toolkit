"""
Pytest configuration for the ERC20 plugin tests.
"""
import pytest
from radius_plugins.erc20.token import Token


@pytest.fixture
def sample_tokens():
    """Fixture that provides a list of sample ERC20 tokens for testing."""
    return [
        {
            "decimals": 18,
            "symbol": "TEST",
            "name": "Test Token",
            "chains": {
                1: {"contractAddress": "0x1234567890123456789012345678901234567890"},
                5: {"contractAddress": "0x5555555555555555555555555555555555555555"},
            },
        },
        {
            "decimals": 6,
            "symbol": "USDT",
            "name": "Tether",
            "chains": {
                1: {"contractAddress": "0x2222222222222222222222222222222222222222"},
            },
        },
    ]