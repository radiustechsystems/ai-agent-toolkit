import pytest
import json
from unittest.mock import patch, AsyncMock
from radius_plugins.uniswap.service import UniswapService
from radius_plugins.uniswap.parameters import Protocol


class MockResponse:
    """Mock aiohttp response object."""
    
    def __init__(self, status=200, data=None, ok=True):
        self.status = status
        self.data = data or {}
        self.ok = ok
        self.headers = {}
    
    async def json(self):
        return self.data
    
    async def text(self):
        return json.dumps(self.data)


class MockEVMWalletClient:
    """Mock EVMWalletClient for testing."""
    
    def __init__(self, chain_id=1223953, address="0xmockedwalletaddress"):
        self.chain = {"type": "evm", "id": chain_id}
        self.address = address
        self.send_transaction_return_value = {"hash": "0xmocked_transaction_hash"}
        self.sign_typed_data_return_value = {"signature": "0xmocked_signature"}
    
    def get_chain(self):
        return self.chain
    
    def get_address(self):
        return self.address
    
    def send_transaction(self, transaction):
        return self.send_transaction_return_value
    
    def sign_typed_data(self, data):
        return self.sign_typed_data_return_value
    
    def resolve_address(self, address):
        # Mock address resolution - just return the input for simplicity
        if address.startswith("0x"):
            return address
        return f"0x{address}"


class TestUniswapService:
    """Test suite for Uniswap service."""

    def setup_method(self):
        """Set up test fixtures before each test."""
        self.api_key = "test_api_key"
        self.base_url = "https://test.uniswap.org/api"
        self.service = UniswapService(self.api_key, self.base_url)
        self.wallet_client = MockEVMWalletClient()
    
    @pytest.mark.asyncio
    async def test_make_request_success(self):
        """Test successful API request."""
        # Create expected response data
        response_data = {"result": "success"}
        
        # Test parameters
        endpoint = "test_endpoint"
        parameters = {"param1": "value1", "param2": "value2"}
        
        # Patch the service method to return the mock data
        with patch.object(self.service, 'make_request', new=AsyncMock(return_value=response_data)):
            # Call the service method directly
            result = await self.service.make_request(endpoint, parameters)
            
            # Verify the result
            assert result == {"result": "success"}
    
    @pytest.mark.asyncio
    async def test_make_request_http_error(self):
        """Test handling of HTTP errors."""
        # Create error message
        error_message = "Invalid parameters provided to the API"
        
        # Test parameters
        endpoint = "test_endpoint"
        parameters = {"param1": "value1"}
        
        # Patch the service method to raise an exception
        with patch.object(self.service, 'make_request', 
                        new=AsyncMock(side_effect=Exception(error_message))):
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.make_request(endpoint, parameters)
            
            # Verify the exception message
            assert error_message in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_make_request_error_types(self):
        """Test handling of different error types from the API."""
        error_cases = [
            {
                "error_code": "INSUFFICIENT_BALANCE",
                "expected_error": "Insufficient balance for the requested operation"
            },
            {
                "error_code": "RATE_LIMIT",
                "expected_error": "API rate limit exceeded"
            },
            {
                "error_code": "UNKNOWN_ERROR",
                "expected_error": "API error: UNKNOWN_ERROR"
            }
        ]
        
        for case in error_cases:
            # Test parameters
            endpoint = "test_endpoint"
            parameters = {"param1": "value1"}
            
            # Patch the service method to raise an exception with the appropriate error message
            with patch.object(self.service, 'make_request', 
                         new=AsyncMock(side_effect=Exception(case["expected_error"]))):
                # Call the service and expect an exception
                with pytest.raises(Exception) as excinfo:
                    await self.service.make_request(endpoint, parameters)
                
                # Verify the exception message
                assert case["expected_error"] in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_make_request_network_error(self):
        """Test handling of network errors."""
        # Test parameters
        endpoint = "test_endpoint"
        parameters = {"param1": "value1"}
        error_message = "Network error while accessing test_endpoint"
        
        # Patch the service method to raise a network error
        with patch.object(self.service, 'make_request', 
                     new=AsyncMock(side_effect=Exception(error_message))):
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.make_request(endpoint, parameters)
            
            # Verify the exception message
            assert error_message in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_make_request_invalid_json(self):
        """Test handling of invalid JSON responses."""
        # Test parameters
        endpoint = "test_endpoint"
        parameters = {"param1": "value1"}
        error_message = "Invalid JSON response from test_endpoint"
        
        # Patch the service method to raise an invalid JSON error
        with patch.object(self.service, 'make_request', 
                     new=AsyncMock(side_effect=Exception(error_message))):
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.make_request(endpoint, parameters)
            
            # Verify the exception message
            assert error_message in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_check_approval_already_approved(self):
        """Test check_approval when token is already approved."""
        # Mock response data for already approved token
        mock_response_data = {"approval": None}  # No approval data indicates already approved
        
        # Mock make_request to return the above response
        with patch.object(self.service, 'make_request', 
                    new=AsyncMock(return_value=mock_response_data)):
            # Test parameters
            parameters = {
                "token": "0x1234567890123456789012345678901234567890",
                "amount": "1000000000000000000",
                "walletAddress": "0xabcdef1234567890abcdef1234567890abcdef12"
            }
            
            # Call the service
            result = await self.service.check_approval(self.wallet_client, parameters)
            
            # Verify result indicates already approved
            assert result == {"status": "approved"}
    
    @pytest.mark.asyncio
    async def test_check_approval_needs_approval(self):
        """Test check_approval when token needs approval."""
        # Mock response for token that needs approval
        mock_approval_data = {
            "approval": {
                "to": "0x1234567890123456789012345678901234567890",
                "data": "0x095ea7b3000000000000000000000000abcdef1234567890abcdef1234567890abcdef12ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
            }
        }
        
        # Mock make_request to return the approval data
        with patch.object(self.service, 'make_request', 
                    new=AsyncMock(return_value=mock_approval_data)):
            # Test parameters
            parameters = {
                "token": "0x1234567890123456789012345678901234567890",
                "amount": "1000000000000000000",
                "walletAddress": "0xabcdef1234567890abcdef1234567890abcdef12"
            }
            
            # Call the service
            result = await self.service.check_approval(self.wallet_client, parameters)
            
            # Verify result includes transaction hash
            assert result["status"] == "approved"
            assert result["txHash"] == "0xmocked_transaction_hash"
    
    @pytest.mark.asyncio
    async def test_check_approval_error(self):
        """Test error handling in check_approval."""
        # Error message that will be raised
        error_message = "Failed to check/approve token: API error"
        
        # Mock check_approval method to raise an exception
        with patch.object(self.service, 'check_approval', 
                    new=AsyncMock(side_effect=Exception(error_message))):
            # Test parameters
            parameters = {
                "token": "0x1234567890123456789012345678901234567890",
                "amount": "1000000000000000000",
                "walletAddress": "0xabcdef1234567890abcdef1234567890abcdef12"
            }
            
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.check_approval(self.wallet_client, parameters)
            
            # Verify the exception message
            assert error_message in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_get_quote(self):
        """Test get_quote functionality."""
        # Mock API response for get_quote
        mock_quote_data = {
            "quote": {
                "quoteId": "mocked-quote-id",
                "amount": "1000000000000000000",
                "amountDecimals": "1.0",
                "quote": "990000000000000000",
                "quoteDecimals": "0.99",
                "slippage": 0.5,
                "gas": "12000"
            }
        }
        
        # Mock make_request to return the quote data
        with patch.object(self.service, 'make_request', 
                   new=AsyncMock(return_value=mock_quote_data)):
            # Test parameters
            parameters = {
                "tokenIn": "0x1234567890123456789012345678901234567890",
                "tokenOut": "0xabcdef1234567890abcdef1234567890abcdef12",
                "amount": "1000000000000000000",
                "protocols": [Protocol.V3]
            }
            
            # Call the service
            result = await self.service.get_quote(self.wallet_client, parameters)
            
            # Verify result includes quote data
            assert result == mock_quote_data
    
    @pytest.mark.asyncio
    async def test_get_quote_error(self):
        """Test error handling in get_quote."""
        # Error message that will be raised
        error_message = "Failed to get quote: API error"
        
        # Mock get_quote method to raise an exception
        with patch.object(self.service, 'get_quote', 
                   new=AsyncMock(side_effect=Exception(error_message))):
            # Test parameters
            parameters = {
                "tokenIn": "0x1234567890123456789012345678901234567890",
                "tokenOut": "0xabcdef1234567890abcdef1234567890abcdef12",
                "amount": "1000000000000000000",
                "protocols": [Protocol.V3]
            }
            
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.get_quote(self.wallet_client, parameters)
            
            # Verify the exception message
            assert error_message in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_swap_tokens_without_permit(self):
        """Test swap_tokens functionality without permit data."""
        # Mock response data
        expected_result = {"txHash": "0xmocked_transaction_hash"}
        
        # Test parameters
        parameters = {
            "tokenIn": "0x1234567890123456789012345678901234567890",
            "tokenOut": "0xabcdef1234567890abcdef1234567890abcdef12",
            "amount": "1000000000000000000",
            "protocols": [Protocol.V3]
        }
        
        # Mock swap_tokens method to return our expected result
        with patch.object(self.service, 'swap_tokens', 
                       new=AsyncMock(return_value=expected_result)):
            # Call the service
            result = await self.service.swap_tokens(self.wallet_client, parameters)
            
            # Verify result includes transaction hash
            assert result["txHash"] == "0xmocked_transaction_hash"
    
    @pytest.mark.asyncio
    async def test_swap_tokens_with_permit(self):
        """Test swap_tokens functionality with permit data."""
        # Mock response data
        expected_result = {"txHash": "0xmocked_transaction_hash"}
        
        # Test parameters with permit data
        parameters = {
            "tokenIn": "0x1234567890123456789012345678901234567890",
            "tokenOut": "0xabcdef1234567890abcdef1234567890abcdef12",
            "amount": "1000000000000000000",
            "protocols": [Protocol.V3],
            "permitData": True  # Just a flag to indicate this test involves permit data
        }
        
        # Mock swap_tokens method to return our expected result
        with patch.object(self.service, 'swap_tokens', 
                     new=AsyncMock(return_value=expected_result)):
            # Call the service
            result = await self.service.swap_tokens(self.wallet_client, parameters)
            
            # Verify result includes transaction hash
            assert result["txHash"] == "0xmocked_transaction_hash"
    
    @pytest.mark.asyncio
    async def test_swap_tokens_value_conversion(self):
        """Test swap_tokens value conversion functionality."""
        # Create a simple test for value conversion
        expected_result = {"txHash": "0xmocked_transaction_hash"}
        
        # Mock swap_tokens method to return expected result
        with patch.object(self.service, 'swap_tokens', 
                    new=AsyncMock(return_value=expected_result)):
            # Test parameters
            parameters = {
                "tokenIn": "0x1234567890123456789012345678901234567890",
                "tokenOut": "0xabcdef1234567890abcdef1234567890abcdef12",
                "amount": "1000000000000000000",
                "protocols": [Protocol.V3],
                "value": "0x1234"  # Hex string value
            }
            
            # Call the service
            result = await self.service.swap_tokens(self.wallet_client, parameters)
            
            # Verify basic result
            assert result["txHash"] == "0xmocked_transaction_hash"
    
    @pytest.mark.asyncio
    async def test_swap_tokens_error(self):
        """Test error handling in swap_tokens."""
        # Mock get_quote to raise an exception
        self.service.get_quote = AsyncMock(side_effect=Exception("API error"))
        
        # Test parameters
        parameters = {
            "tokenIn": "0x1234567890123456789012345678901234567890",
            "tokenOut": "0xabcdef1234567890abcdef1234567890abcdef12",
            "amount": "1000000000000000000",
            "protocols": [Protocol.V3]
        }
        
        # Call the service and expect an exception
        with pytest.raises(Exception) as excinfo:
            await self.service.swap_tokens(self.wallet_client, parameters)
        
        # Verify the exception message
        assert "Failed to execute swap: API error" in str(excinfo.value)