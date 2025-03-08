import pytest
from unittest.mock import Mock
from radius_plugins.erc20.service import Erc20Service
from radius_plugins.erc20.token import Token


class MockEVMWalletClient:
    """Mock EVMWalletClient for testing."""
    
    def __init__(self, chain_id=1):
        self.chain = {"type": "evm", "id": chain_id}
        self.read_return_value = {"value": "0"}
        self.send_transaction_return_value = {"hash": "0xmocked_transaction_hash"}
    
    def get_chain(self):
        return self.chain
    
    def read(self, request):
        return self.read_return_value
    
    def send_transaction(self, transaction):
        return self.send_transaction_return_value
    
    def resolve_address(self, address):
        # Mock address resolution - just return the input for simplicity
        if address.startswith("0x"):
            return address
        return f"0x{address}"


class TestErc20Service:
    def setup_method(self):
        """Set up test environment before each test method."""
        self.test_tokens: list[Token] = [
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
        
        # Create service instance
        self.service = Erc20Service(self.test_tokens)
        
        # Create mock wallet client
        self.wallet_client = MockEVMWalletClient()
    
    def test_service_initialization(self):
        """Test service initialization."""
        service = Erc20Service(self.test_tokens)
        assert service is not None
        assert service.tokens == self.test_tokens
        
        # Test with empty tokens list
        empty_service = Erc20Service()
        assert empty_service.tokens == []
    
    def test_get_token_info_by_symbol_success(self):
        """Test getting token info by symbol."""
        # Set up test
        params = {"symbol": "TEST"}
        
        # Call the method
        result = self.service.get_token_info_by_symbol(self.wallet_client, params)
        
        # Check the result
        assert result["symbol"] == "TEST"
        assert result["contractAddress"] == "0x1234567890123456789012345678901234567890"
        assert result["decimals"] == 18
        assert result["name"] == "Test Token"
    
    def test_get_token_info_by_symbol_case_insensitive(self):
        """Test getting token info by symbol is case insensitive."""
        # Set up test with lowercase symbol
        params = {"symbol": "test"}
        
        # Call the method
        result = self.service.get_token_info_by_symbol(self.wallet_client, params)
        
        # Check the result
        assert result["symbol"] == "TEST"  # Should return the original case
        assert result["contractAddress"] == "0x1234567890123456789012345678901234567890"
    
    def test_get_token_info_by_symbol_token_not_found(self):
        """Test getting token info with a symbol that doesn't exist."""
        # Set up test
        params = {"symbol": "NONEXISTENT"}
        
        # Call the method and expect an exception
        with pytest.raises(Exception) as excinfo:
            self.service.get_token_info_by_symbol(self.wallet_client, params)
        
        assert "Token with symbol NONEXISTENT not found" in str(excinfo.value)
    
    def test_get_token_info_by_symbol_chain_not_found(self):
        """Test getting token info on a chain that doesn't support the token."""
        # Set up test with a different chain ID
        wallet_client = MockEVMWalletClient(chain_id=999)  # Chain not supported by TEST token
        params = {"symbol": "TEST"}
        
        # Call the method and expect an exception
        with pytest.raises(Exception) as excinfo:
            self.service.get_token_info_by_symbol(wallet_client, params)
        
        assert "Token with symbol TEST not found on chain 999" in str(excinfo.value)
    
    def test_get_token_balance(self):
        """Test getting token balance."""
        # Set up test
        params = {
            "wallet": "0xabcdef1234567890abcdef1234567890abcdef12",
            "tokenAddress": "0x1111111111111111111111111111111111111111",
        }
        
        # Mock the wallet client read response
        self.wallet_client.read_return_value = {"value": "1000000000000000000"}
        
        # Call the method
        result = self.service.get_token_balance(self.wallet_client, params)
        
        # Check the result
        assert result == 1000000000000000000
    
    def test_get_token_balance_error(self):
        """Test error handling for get_token_balance."""
        # Set up test
        params = {
            "wallet": "0xabcdef1234567890abcdef1234567890abcdef12",
            "tokenAddress": "0x1111111111111111111111111111111111111111",
        }
        
        # Mock the wallet client to raise an exception
        self.wallet_client.read = Mock(side_effect=Exception("Read error"))
        
        # Call the method and expect an exception
        with pytest.raises(Exception) as excinfo:
            self.service.get_token_balance(self.wallet_client, params)
        
        assert "Failed to fetch balance: Read error" in str(excinfo.value)
    
    def test_transfer(self):
        """Test transferring tokens."""
        # Set up test
        params = {
            "tokenAddress": "0x1111111111111111111111111111111111111111",
            "to": "0xabcdef1234567890abcdef1234567890abcdef12",
            "amount": "1000000000000000000",
        }
        
        # Call the method
        result = self.service.transfer(self.wallet_client, params)
        
        # Check the result
        assert result == "0xmocked_transaction_hash"
    
    def test_transfer_error(self):
        """Test error handling for transfer."""
        # Set up test
        params = {
            "tokenAddress": "0x1111111111111111111111111111111111111111",
            "to": "0xabcdef1234567890abcdef1234567890abcdef12",
            "amount": "1000000000000000000",
        }
        
        # Mock the wallet client to raise an exception
        self.wallet_client.send_transaction = Mock(side_effect=Exception("Transfer error"))
        
        # Call the method and expect an exception
        with pytest.raises(Exception) as excinfo:
            self.service.transfer(self.wallet_client, params)
        
        assert "Failed to transfer: Transfer error" in str(excinfo.value)
    
    def test_get_token_total_supply(self):
        """Test getting token total supply."""
        # Set up test
        params = {
            "tokenAddress": "0x1111111111111111111111111111111111111111",
        }
        
        # Mock the wallet client read response
        self.wallet_client.read_return_value = {"value": "1000000000000000000000000"}
        
        # Call the method
        result = self.service.get_token_total_supply(self.wallet_client, params)
        
        # Check the result
        assert result == "1000000000000000000000000"
    
    def test_get_token_total_supply_error(self):
        """Test error handling for get_token_total_supply."""
        # Set up test
        params = {
            "tokenAddress": "0x1111111111111111111111111111111111111111",
        }
        
        # Mock the wallet client to raise an exception
        self.wallet_client.read = Mock(side_effect=Exception("Read error"))
        
        # Call the method and expect an exception
        with pytest.raises(Exception) as excinfo:
            self.service.get_token_total_supply(self.wallet_client, params)
        
        assert "Failed to fetch total supply: Read error" in str(excinfo.value)
    
    def test_get_token_allowance(self):
        """Test getting token allowance."""
        # Set up test
        params = {
            "tokenAddress": "0x1111111111111111111111111111111111111111",
            "owner": "0xabcdef1234567890abcdef1234567890abcdef12",
            "spender": "0x9876543210abcdef9876543210abcdef98765432",
        }
        
        # Mock the wallet client read response
        self.wallet_client.read_return_value = {"value": "500000000000000000"}
        
        # Call the method
        result = self.service.get_token_allowance(self.wallet_client, params)
        
        # Check the result
        assert result == 500000000000000000
    
    def test_get_token_allowance_error(self):
        """Test error handling for get_token_allowance."""
        # Set up test
        params = {
            "tokenAddress": "0x1111111111111111111111111111111111111111",
            "owner": "0xabcdef1234567890abcdef1234567890abcdef12",
            "spender": "0x9876543210abcdef9876543210abcdef98765432",
        }
        
        # Mock the wallet client to raise an exception
        self.wallet_client.read = Mock(side_effect=Exception("Read error"))
        
        # Call the method and expect an exception
        with pytest.raises(Exception) as excinfo:
            self.service.get_token_allowance(self.wallet_client, params)
        
        assert "Failed to fetch allowance: Read error" in str(excinfo.value)
    
    def test_approve(self):
        """Test approving token allowance."""
        # Set up test
        params = {
            "tokenAddress": "0x1111111111111111111111111111111111111111",
            "spender": "0x9876543210abcdef9876543210abcdef98765432",
            "amount": "1000000000000000000",
        }
        
        # Call the method
        result = self.service.approve(self.wallet_client, params)
        
        # Check the result
        assert result == "0xmocked_transaction_hash"
    
    def test_approve_error(self):
        """Test error handling for approve."""
        # Set up test
        params = {
            "tokenAddress": "0x1111111111111111111111111111111111111111",
            "spender": "0x9876543210abcdef9876543210abcdef98765432",
            "amount": "1000000000000000000",
        }
        
        # Mock the wallet client to raise an exception
        self.wallet_client.send_transaction = Mock(side_effect=Exception("Approve error"))
        
        # Call the method and expect an exception
        with pytest.raises(Exception) as excinfo:
            self.service.approve(self.wallet_client, params)
        
        assert "Failed to approve: Approve error" in str(excinfo.value)
    
    def test_transfer_from(self):
        """Test transferring tokens from another address."""
        # Set up test
        params = {
            "tokenAddress": "0x1111111111111111111111111111111111111111",
            "from": "0xabcdef1234567890abcdef1234567890abcdef12",
            "to": "0x9876543210abcdef9876543210abcdef98765432",
            "amount": "1000000000000000000",
        }
        
        # Call the method
        result = self.service.transfer_from(self.wallet_client, params)
        
        # Check the result
        assert result == "0xmocked_transaction_hash"
    
    def test_transfer_from_error(self):
        """Test error handling for transfer_from."""
        # Set up test
        params = {
            "tokenAddress": "0x1111111111111111111111111111111111111111",
            "from": "0xabcdef1234567890abcdef1234567890abcdef12",
            "to": "0x9876543210abcdef9876543210abcdef98765432",
            "amount": "1000000000000000000",
        }
        
        # Mock the wallet client to raise an exception
        self.wallet_client.send_transaction = Mock(side_effect=Exception("TransferFrom error"))
        
        # Call the method and expect an exception
        with pytest.raises(Exception) as excinfo:
            self.service.transfer_from(self.wallet_client, params)
        
        assert "Failed to transfer from: TransferFrom error" in str(excinfo.value)
    
    def test_convert_to_base_unit(self):
        """Test converting token amount to base unit."""
        # Set up test
        params = {
            "amount": 1.5,
            "decimals": 18,
        }
        
        # Call the method
        result = self.service.convert_to_base_unit(params)
        
        # Check the result
        assert result == 1500000000000000000
    
    def test_convert_from_base_unit(self):
        """Test converting token amount from base unit."""
        # Set up test
        params = {
            "amount": 1500000000000000000,
            "decimals": 18,
        }
        
        # Call the method
        result = self.service.convert_from_base_unit(params)
        
        # Check the result
        assert result == 1.5
    
    def test_convert_to_base_unit_with_different_decimals(self):
        """Test converting token amount to base unit with different decimal values."""
        test_cases = [
            {"amount": 1.5, "decimals": 6, "expected": 1500000},
            {"amount": 0.00123, "decimals": 8, "expected": 123000},
            {"amount": 100, "decimals": 0, "expected": 100},
        ]
        
        for case in test_cases:
            params = {
                "amount": case["amount"],
                "decimals": case["decimals"],
            }
            result = self.service.convert_to_base_unit(params)
            assert result == case["expected"]
    
    def test_convert_from_base_unit_with_different_decimals(self):
        """Test converting token amount from base unit with different decimal values."""
        test_cases = [
            {"amount": 1500000, "decimals": 6, "expected": 1.5},
            {"amount": 123000, "decimals": 8, "expected": 0.00123},
            {"amount": 100, "decimals": 0, "expected": 100.0},
        ]
        
        for case in test_cases:
            params = {
                "amount": case["amount"],
                "decimals": case["decimals"],
            }
            result = self.service.convert_from_base_unit(params)
            assert result == case["expected"]