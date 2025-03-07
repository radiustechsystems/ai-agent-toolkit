import pytest
import json
from unittest.mock import patch, AsyncMock, MagicMock
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
        # Setup mock response
        mock_response = MockResponse(
            data={"jsonrpc": "2.0", "result": "0x1234", "id": 1}
        )
        
        # Mock aiohttp client session
        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.post.return_value.__aenter__.return_value = mock_response
        
        # Create test parameters
        params = {
            "method": "eth_blockNumber",
            "params": [],
            "id": 1,
            "jsonrpc": "2.0"
        }
        
        # Mock the client session
        with patch("aiohttp.ClientSession", return_value=mock_session):
            # Call the service
            result = await self.service.JSONRpcFunc(params)
            
            # Verify the result
            assert result == {"jsonrpc": "2.0", "result": "0x1234", "id": 1}
            
            # Verify the mock was called with the correct arguments
            mock_session.post.assert_called_once_with(self.endpoint, json=params)
    
    @pytest.mark.asyncio
    async def test_http_error_handling(self):
        """Test handling of HTTP errors."""
        # Setup mock response with error status
        mock_response = MockResponse(
            status=404, 
            data={"error": "Not Found"}, 
            ok=False
        )
        
        # Mock aiohttp client session
        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.post.return_value.__aenter__.return_value = mock_response
        
        # Create test parameters
        params = {
            "method": "eth_blockNumber",
            "params": [],
            "id": 1,
            "jsonrpc": "2.0"
        }
        
        # Mock the client session
        with patch("aiohttp.ClientSession", return_value=mock_session):
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.JSONRpcFunc(params)
            
            # Verify the exception message
            assert "HTTP error! status: 404" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_jsonrpc_error_response(self):
        """Test handling of JSON-RPC error responses."""
        # Setup mock response with JSON-RPC error
        mock_response = MockResponse(
            data={
                "jsonrpc": "2.0", 
                "error": {"code": -32601, "message": "Method not found"}, 
                "id": 1
            }
        )
        
        # Mock aiohttp client session
        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.post.return_value.__aenter__.return_value = mock_response
        
        # Create test parameters
        params = {
            "method": "invalid_method",
            "params": [],
            "id": 1,
            "jsonrpc": "2.0"
        }
        
        # Mock the client session
        with patch("aiohttp.ClientSession", return_value=mock_session):
            # Call the service
            result = await self.service.JSONRpcFunc(params)
            
            # Verify the result contains the error
            assert "error" in result
            assert result["error"]["code"] == -32601
            assert result["error"]["message"] == "Method not found"
    
    @pytest.mark.asyncio
    async def test_network_error_handling(self):
        """Test handling of network errors."""
        # Mock aiohttp client session to raise an exception
        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.post.side_effect = Exception("Connection error")
        
        # Create test parameters
        params = {
            "method": "eth_blockNumber",
            "params": [],
            "id": 1,
            "jsonrpc": "2.0"
        }
        
        # Mock the client session
        with patch("aiohttp.ClientSession", return_value=mock_session):
            # Call the service and expect an exception
            with pytest.raises(Exception) as excinfo:
                await self.service.JSONRpcFunc(params)
            
            # Verify the exception message
            assert f"Failed to call {self.endpoint}: Connection error" in str(excinfo.value)
    
    @pytest.mark.asyncio
    async def test_complex_parameters(self):
        """Test with complex parameter structures."""
        # Setup mock response
        mock_response = MockResponse(
            data={"jsonrpc": "2.0", "result": {"blockHash": "0x1234", "blockNumber": "0x10"}, "id": 1}
        )
        
        # Mock aiohttp client session
        mock_session = AsyncMock()
        mock_session.__aenter__.return_value = mock_session
        mock_session.post.return_value.__aenter__.return_value = mock_response
        
        # Create test parameters with more complex structure
        params = {
            "method": "eth_getBlockByNumber",
            "params": ["0x1b4", True],  # Mix of hex string and boolean
            "id": 1,
            "jsonrpc": "2.0"
        }
        
        # Mock the client session
        with patch("aiohttp.ClientSession", return_value=mock_session):
            # Call the service
            result = await self.service.JSONRpcFunc(params)
            
            # Verify the result
            assert result["result"]["blockHash"] == "0x1234"
            assert result["result"]["blockNumber"] == "0x10"