"""
Pytest configuration for the JSON-RPC plugin tests.
"""
import pytest


@pytest.fixture
def jsonrpc_endpoint():
    """Fixture that provides a sample JSON-RPC endpoint for testing."""
    return "https://example.com/jsonrpc"


@pytest.fixture
def sample_jsonrpc_request():
    """Fixture that provides a sample JSON-RPC request for testing."""
    return {
        "method": "eth_blockNumber",
        "params": [],
        "id": 1,
        "jsonrpc": "2.0"
    }


@pytest.fixture
def sample_jsonrpc_response():
    """Fixture that provides a sample JSON-RPC response for testing."""
    return {
        "jsonrpc": "2.0",
        "result": "0x4b7",
        "id": 1
    }


@pytest.fixture
def sample_jsonrpc_error_response():
    """Fixture that provides a sample JSON-RPC error response for testing."""
    return {
        "jsonrpc": "2.0",
        "error": {
            "code": -32601,
            "message": "Method not found"
        },
        "id": 1
    }