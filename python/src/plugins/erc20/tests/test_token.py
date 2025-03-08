import pytest
from radius_plugins.erc20.token import Token, ChainSpecificToken, get_tokens_for_network, USDC


class TestToken:
    def test_token_type(self):
        """Test that the Token type is correctly defined."""
        # Define a token according to the Token type
        token: Token = {
            "decimals": 18,
            "symbol": "TEST",
            "name": "Test Token",
            "chains": {
                1: {"contractAddress": "0x1234567890123456789012345678901234567890"},
                5: {"contractAddress": "0x0987654321098765432109876543210987654321"},
            },
        }
        
        # Check token properties
        assert token["decimals"] == 18
        assert token["symbol"] == "TEST"
        assert token["name"] == "Test Token"
        assert len(token["chains"]) == 2
        assert token["chains"][1]["contractAddress"] == "0x1234567890123456789012345678901234567890"
        assert token["chains"][5]["contractAddress"] == "0x0987654321098765432109876543210987654321"
    
    def test_chain_specific_token_type(self):
        """Test that the ChainSpecificToken type is correctly defined."""
        # Define a chain-specific token
        chain_token: ChainSpecificToken = {
            "chain_id": 1,
            "decimals": 18,
            "symbol": "TEST",
            "name": "Test Token",
            "contract_address": "0x1234567890123456789012345678901234567890",
        }
        
        # Check chain token properties
        assert chain_token["chain_id"] == 1
        assert chain_token["decimals"] == 18
        assert chain_token["symbol"] == "TEST"
        assert chain_token["name"] == "Test Token"
        assert chain_token["contract_address"] == "0x1234567890123456789012345678901234567890"
    
    def test_usdc_token_definition(self):
        """Test that the USDC token is correctly defined."""
        assert USDC["decimals"] == 6
        assert USDC["symbol"] == "USDC"
        assert USDC["name"] == "USDC"
        assert 1223953 in USDC["chains"]  # Radius testnet
    
    def test_get_tokens_for_network_with_matching_tokens(self):
        """Test getting tokens for a network that has matching tokens."""
        # Create test tokens
        tokens: list[Token] = [
            {
                "decimals": 18,
                "symbol": "TKN1",
                "name": "Token 1",
                "chains": {
                    1: {"contractAddress": "0x1111111111111111111111111111111111111111"},
                    5: {"contractAddress": "0x5555555555555555555555555555555555555555"},
                },
            },
            {
                "decimals": 8,
                "symbol": "TKN2",
                "name": "Token 2",
                "chains": {
                    1: {"contractAddress": "0x2222222222222222222222222222222222222222"},
                },
            },
        ]
        
        # Get tokens for chain ID 1
        result = get_tokens_for_network(1, tokens)
        
        # Check results
        assert len(result) == 2
        
        # Check first token
        assert result[0]["chain_id"] == 1
        assert result[0]["decimals"] == 18
        assert result[0]["symbol"] == "TKN1"
        assert result[0]["name"] == "Token 1"
        assert result[0]["contract_address"] == "0x1111111111111111111111111111111111111111"
        
        # Check second token
        assert result[1]["chain_id"] == 1
        assert result[1]["decimals"] == 8
        assert result[1]["symbol"] == "TKN2"
        assert result[1]["name"] == "Token 2"
        assert result[1]["contract_address"] == "0x2222222222222222222222222222222222222222"
    
    def test_get_tokens_for_network_with_no_matching_tokens(self):
        """Test getting tokens for a network that has no matching tokens."""
        # Create test tokens
        tokens: list[Token] = [
            {
                "decimals": 18,
                "symbol": "TKN1",
                "name": "Token 1",
                "chains": {
                    1: {"contractAddress": "0x1111111111111111111111111111111111111111"},
                    5: {"contractAddress": "0x5555555555555555555555555555555555555555"},
                },
            },
        ]
        
        # Get tokens for chain ID 10 (not in the token definitions)
        result = get_tokens_for_network(10, tokens)
        
        # Check results
        assert len(result) == 0
    
    def test_get_tokens_for_network_with_empty_token_list(self):
        """Test getting tokens for a network with an empty token list."""
        result = get_tokens_for_network(1, [])
        assert len(result) == 0