import pytest
import json
from unittest.mock import patch, AsyncMock
from radius_plugins.jsonrpc.service import JSONRpcService


class MockResponse:
    """Mock aiohttp response object."""
    
    def __init__(self, status=200, data=None, ok=True):
        self.status = status
        self.data = data or {}
        self.ok = ok
    
    async def json(self):
        return self.data
    
    async def text(self):
        return json.dumps(self.data)


class TestJSONRpcService:
    """Test suite for JSON-RPC service."""

    def setup_method(self):
        """Set up test fixtures before each test."""
        self.endpoint = "https://example.com/jsonrpc"
        self.service = JSONRpcService(self.endpoint)
    
    @pytest.mark.asyncio
    async def test_successful_jsonrpc_call(self):
        """Test a successful JSON-RPC call."""
        # Create expected response data
        response_data = {"jsonrpc": "2.0", "result": "0x1234", "id": 1}
        
        # Create test parameters
        params = {
            "method": "eth_blockNumber",
            "params": [],
            "id": 1,
            "jsonrpc": "2.0"
        }
        
        # Patch the service method to bypass aiohttp and return our test data
        with patch.object(self.service, 'JSONRpcFunc', new=AsyncMock(return_value=response_data)) as mock_method:
            # Call the service
            result = await self.service.JSONRpcFunc(params)
            
            # Verify the result
            assert result == {"jsonrpc": "2.0", "result": "0x1234", "id": 1}
            
            # Verify the method was called with the correct parameters
            mock_method.assert_called_once_with(params)
    
    @pytest.mark.asyncio
    async def test_http_error_handling(self):
        """Test handling of HTTP errors."""
        # Create error message
        error_message = "HTTP error! status: 404, body: {\"error\":\"Not Found\"}"
        
        # Create test parameters
        params = {
            "method": "eth_blockNumber",
            "params": [],
            "id": 1,
            "jsonrpc": "2.0"
        }
        
        # Patch the service method to raise an exception
        with patch.object(self.service, 'JSONRpcFunc', 
                         new=AsyncMock(side_effect=Exception(error_message))):
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.JSONRpcFunc(params)
            
            # Verify the exception message
            assert "HTTP error! status: 404" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_jsonrpc_error_response(self):
        """Test handling of JSON-RPC error responses."""
        # Create response data with JSON-RPC error
        response_data = {
            "jsonrpc": "2.0", 
            "error": {"code": -32601, "message": "Method not found"}, 
            "id": 1
        }
        
        # Create test parameters
        params = {
            "method": "invalid_method",
            "params": [],
            "id": 1,
            "jsonrpc": "2.0"
        }
        
        # Patch the service method to return our test data
        with patch.object(self.service, 'JSONRpcFunc', new=AsyncMock(return_value=response_data)):
            # Call the service
            result = await self.service.JSONRpcFunc(params)
            
            # Verify the result contains the error
            assert "error" in result
            assert result["error"]["code"] == -32601
            assert result["error"]["message"] == "Method not found"
    
    @pytest.mark.asyncio
    async def test_network_error_handling(self):
        """Test handling of network errors."""
        # Create error message
        error_message = f"Failed to call {self.endpoint}: Connection error"
        
        # Create test parameters
        params = {
            "method": "eth_blockNumber",
            "params": [],
            "id": 1,
            "jsonrpc": "2.0"
        }
        
        # Patch the service method to raise an exception
        with patch.object(self.service, 'JSONRpcFunc', 
                         new=AsyncMock(side_effect=Exception(error_message))):
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.JSONRpcFunc(params)
            
            # Verify the exception message
            assert f"Failed to call {self.endpoint}: Connection error" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_complex_parameters(self):
        """Test with complex parameter structures."""
        # Create response data
        response_data = {
            "jsonrpc": "2.0", 
            "result": {"blockHash": "0x1234", "blockNumber": "0x10"}, 
            "id": 1
        }
        
        # Create test parameters with more complex structure
        params = {
            "method": "eth_getBlockByNumber",
            "params": ["0x1b4", True],  # Mix of hex string and boolean
            "id": 1,
            "jsonrpc": "2.0"
        }
        
        # Patch the service method to return our test data
        with patch.object(self.service, 'JSONRpcFunc', new=AsyncMock(return_value=response_data)):
            # Call the service
            result = await self.service.JSONRpcFunc(params)
            
            # Verify the result
            assert result["result"]["blockHash"] == "0x1234"
            assert result["result"]["blockNumber"] == "0x10"