import pytest
import json
from unittest.mock import patch, AsyncMock, MagicMock, PropertyMock
from radius_plugins.uniswap.service import UniswapService
from radius_plugins.uniswap.parameters import SwapType, Protocol
from radius_wallets.evm import EVMWalletClient


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
        # Setup mock response
        mock_response = MockResponse(
            data={"result": "success"}
        )
        
        # Mock aiohttp client session
        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.post.return_value.__aenter__.return_value = mock_response
        
        # Test parameters
        endpoint = "test_endpoint"
        parameters = {"param1": "value1", "param2": "value2"}
        
        # Mock the client session
        with patch("aiohttp.ClientSession", return_value=mock_session):
            # Call the service
            result = await self.service.make_request(endpoint, parameters)
            
            # Verify the result
            assert result == {"result": "success"}
            
            # Verify the mock was called with the correct arguments
            expected_url = f"{self.base_url}/{endpoint}"
            mock_session.post.assert_called_once_with(
                expected_url, 
                json=parameters, 
                headers={"x-api-key": self.api_key}
            )
    
    @pytest.mark.asyncio
    async def test_make_request_http_error(self):
        """Test handling of HTTP errors."""
        # Setup mock response with error status
        mock_response = MockResponse(
            status=400, 
            data={"errorCode": "VALIDATION_ERROR"}, 
            ok=False
        )
        
        # Mock aiohttp client session
        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.post.return_value.__aenter__.return_value = mock_response
        
        # Test parameters
        endpoint = "test_endpoint"
        parameters = {"param1": "value1"}
        
        # Mock the client session
        with patch("aiohttp.ClientSession", return_value=mock_session):
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.make_request(endpoint, parameters)
            
            # Verify the exception message
            assert "Invalid parameters provided to the API" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_make_request_error_types(self):
        """Test handling of different error types from the API."""
        error_cases = [
            {
                "data": {"errorCode": "INSUFFICIENT_BALANCE"},
                "expected_error": "Insufficient balance for the requested operation"
            },
            {
                "data": {"errorCode": "RATE_LIMIT"},
                "expected_error": "API rate limit exceeded"
            },
            {
                "data": {"errorCode": "UNKNOWN_ERROR"},
                "expected_error": "API error: UNKNOWN_ERROR"
            }
        ]
        
        for case in error_cases:
            # Setup mock response with error
            mock_response = MockResponse(
                status=400, 
                data=case["data"], 
                ok=False
            )
            
            # Mock aiohttp client session
            mock_session = AsyncMock()
            mock_session.__aenter__.return_value = mock_session
            mock_session.post.return_value.__aenter__.return_value = mock_response
            
            # Test parameters
            endpoint = "test_endpoint"
            parameters = {"param1": "value1"}
            
            # Mock the client session
            with patch("aiohttp.ClientSession", return_value=mock_session):
                # Call the service and expect an exception
                with pytest.raises(Exception) as excinfo:
                    await self.service.make_request(endpoint, parameters)
                
                # Verify the exception message
                assert case["expected_error"] in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_make_request_network_error(self):
        """Test handling of network errors."""
        # Mock aiohttp client session to raise an exception
        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.post.side_effect = Exception("Connection error")
        
        # Test parameters
        endpoint = "test_endpoint"
        parameters = {"param1": "value1"}
        
        # Mock the client session
        with patch("aiohttp.ClientSession", return_value=mock_session):
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.make_request(endpoint, parameters)
            
            # Verify the exception message
            assert "Network error while accessing test_endpoint" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_make_request_invalid_json(self):
        """Test handling of invalid JSON responses."""
        # Create a response that returns invalid JSON
        mock_response = AsyncMock()
        mock_response.text = AsyncMock(return_value="not a json string")
        mock_response.ok = True
        
        # Mock aiohttp client session
        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.post.return_value.__aenter__.return_value = mock_response
        
        # Test parameters
        endpoint = "test_endpoint"
        parameters = {"param1": "value1"}
        
        # Mock the client session
        with patch("aiohttp.ClientSession", return_value=mock_session):
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.make_request(endpoint, parameters)
            
            # Verify the exception message
            assert "Invalid JSON response from test_endpoint" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_check_approval_already_approved(self):
        """Test check_approval when token is already approved."""
        # Mock response for already approved token
        mock_response = MockResponse(
            data={"approval": None}  # No approval data indicates already approved
        )
        
        # Mock make_request to return the above response
        self.service.make_request = AsyncMock(return_value=mock_response.data)
        
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
        
        # Verify make_request was called with correct parameters
        self.service.make_request.assert_called_once_with(
            "check_approval",
            {
                "token": parameters["token"],
                "amount": parameters["amount"],
                "walletAddress": parameters["walletAddress"],
                "chainId": self.wallet_client.get_chain()["id"]
            }
        )
    
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
        self.service.make_request = AsyncMock(return_value=mock_approval_data)
        
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
        # Mock make_request to raise an exception
        self.service.make_request = AsyncMock(side_effect=Exception("API error"))
        
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
        assert "Failed to check/approve token: API error" in str(excinfo.value)
    
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
        self.service.make_request = AsyncMock(return_value=mock_quote_data)
        
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
        
        # Verify make_request was called with correct parameters
        expected_params = {
            "tokenIn": parameters["tokenIn"],
            "tokenOut": parameters["tokenOut"],
            "amount": parameters["amount"],
            "type": "EXACT_INPUT",
            "tokenInChainId": self.wallet_client.get_chain()["id"],
            "tokenOutChainId": self.wallet_client.get_chain()["id"],
            "swapper": self.wallet_client.get_address()
        }
        self.service.make_request.assert_called_once_with("quote", expected_params)
    
    @pytest.mark.asyncio
    async def test_get_quote_error(self):
        """Test error handling in get_quote."""
        # Mock make_request to raise an exception
        self.service.make_request = AsyncMock(side_effect=Exception("API error"))
        
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
        assert "Failed to get quote: API error" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_swap_tokens_without_permit(self):
        """Test swap_tokens functionality without permit data."""
        # Mock get_quote response
        mock_quote_response = {
            "quote": {
                "to": "0x1234567890123456789012345678901234567890",
                "data": "0xmocked_data",
                "value": "0x0"
            }
        }
        
        # Mock swap response
        mock_swap_response = {
            "swap": {
                "to": "0x1234567890123456789012345678901234567890",
                "data": "0xmocked_data",
                "value": "0x0"
            }
        }
        
        # Mock get_quote and make_request
        self.service.get_quote = AsyncMock(return_value=mock_quote_response)
        self.service.make_request = AsyncMock(return_value=mock_swap_response)
        
        # Test parameters
        parameters = {
            "tokenIn": "0x1234567890123456789012345678901234567890",
            "tokenOut": "0xabcdef1234567890abcdef1234567890abcdef12",
            "amount": "1000000000000000000",
            "protocols": [Protocol.V3]
        }
        
        # Call the service
        result = await self.service.swap_tokens(self.wallet_client, parameters)
        
        # Verify result includes transaction hash
        assert result["txHash"] == "0xmocked_transaction_hash"
        
        # Verify make_request was called with correct parameters
        expected_params = {
            "quote": mock_quote_response["quote"]
        }
        self.service.make_request.assert_called_once_with("swap", expected_params)
    
    @pytest.mark.asyncio
    async def test_swap_tokens_with_permit(self):
        """Test swap_tokens functionality with permit data."""
        # Mock get_quote response with permit data
        mock_quote_response = {
            "quote": {
                "to": "0x1234567890123456789012345678901234567890",
                "data": "0xmocked_data",
                "value": "0x0"
            },
            "permitData": {
                "domain": {"name": "Test Domain"},
                "types": {"Permit": [{"name": "owner", "type": "address"}]},
                "values": {"owner": "0xowner"}
            }
        }
        
        # Mock swap response
        mock_swap_response = {
            "swap": {
                "to": "0x1234567890123456789012345678901234567890",
                "data": "0xmocked_data",
                "value": "0x0"
            }
        }
        
        # Mock get_quote and make_request
        self.service.get_quote = AsyncMock(return_value=mock_quote_response)
        self.service.make_request = AsyncMock(return_value=mock_swap_response)
        
        # Test parameters
        parameters = {
            "tokenIn": "0x1234567890123456789012345678901234567890",
            "tokenOut": "0xabcdef1234567890abcdef1234567890abcdef12",
            "amount": "1000000000000000000",
            "protocols": [Protocol.V3]
        }
        
        # Call the service
        result = await self.service.swap_tokens(self.wallet_client, parameters)
        
        # Verify result includes transaction hash
        assert result["txHash"] == "0xmocked_transaction_hash"
        
        # Verify make_request was called with correct parameters
        expected_params = {
            "quote": mock_quote_response["quote"],
            "permitData": mock_quote_response["permitData"],
            "signature": "0xmocked_signature"
        }
        self.service.make_request.assert_called_once_with("swap", expected_params)
    
    @pytest.mark.asyncio
    async def test_swap_tokens_with_value(self):
        """Test swap_tokens with different value formats."""
        # Test different value formats
        value_test_cases = [
            {"value_input": "0x1234", "expected_value": 4660},  # Hex string
            {"value_input": "1000", "expected_value": 1000},    # Decimal string
            {"value_input": 5000, "expected_value": 5000},      # Integer
            {"value_input": None, "expected_value": 0}          # None value
        ]
        
        for case in value_test_cases:
            # Mock get_quote response
            mock_quote_response = {
                "quote": {
                    "to": "0x1234567890123456789012345678901234567890",
                    "data": "0xmocked_data"
                }
            }
            
            # Mock swap response with different value formats
            mock_swap_response = {
                "swap": {
                    "to": "0x1234567890123456789012345678901234567890",
                    "data": "0xmocked_data",
                    "value": case["value_input"]
                }
            }
            
            # Mock get_quote and make_request
            self.service.get_quote = AsyncMock(return_value=mock_quote_response)
            self.service.make_request = AsyncMock(return_value=mock_swap_response)
            
            # Test parameters
            parameters = {
                "tokenIn": "0x1234567890123456789012345678901234567890",
                "tokenOut": "0xabcdef1234567890abcdef1234567890abcdef12",
                "amount": "1000000000000000000",
                "protocols": [Protocol.V3]
            }
            
            # Call the service
            await self.service.swap_tokens(self.wallet_client, parameters)
            
            # Get the transaction params passed to send_transaction
            call_args = self.wallet_client.send_transaction.call_args[0][0]
            
            # Verify value was properly converted
            assert call_args["value"] == case["expected_value"]
    
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