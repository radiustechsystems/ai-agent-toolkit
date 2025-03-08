import pytest
from pydantic import ValidationError
from radius_plugins.jsonrpc.parameters import JSONRpcBodyParameters


class TestParameters:
    """Test suite for JSON-RPC parameters validation."""

    def test_valid_jsonrpc_parameters(self):
        """Test valid JSON-RPC parameters."""
        # Create valid parameters
        params = JSONRpcBodyParameters(
            method="eth_getBalance",
            params=["0x407d73d8a49eeb85d32cf465507dd71d507100c1", "latest"],
            id=1,
            jsonrpc="2.0"
        )

        # Verify parameter values
        assert params.method == "eth_getBalance"
        assert params.params == ["0x407d73d8a49eeb85d32cf465507dd71d507100c1", "latest"]
        assert params.id == 1
        assert params.jsonrpc == "2.0"

    def test_missing_method(self):
        """Test validation with missing method parameter."""
        with pytest.raises(ValidationError):
            JSONRpcBodyParameters(
                params=["0x407d73d8a49eeb85d32cf465507dd71d507100c1", "latest"],
                id=1,
                jsonrpc="2.0"
            )

    def test_missing_params(self):
        """Test validation with missing params parameter."""
        with pytest.raises(ValidationError):
            JSONRpcBodyParameters(
                method="eth_getBalance",
                id=1,
                jsonrpc="2.0"
            )

    def test_missing_id(self):
        """Test validation with missing id parameter."""
        with pytest.raises(ValidationError):
            JSONRpcBodyParameters(
                method="eth_getBalance",
                params=["0x407d73d8a49eeb85d32cf465507dd71d507100c1", "latest"],
                jsonrpc="2.0"
            )

    def test_missing_jsonrpc(self):
        """Test validation with missing jsonrpc parameter."""
        with pytest.raises(ValidationError):
            JSONRpcBodyParameters(
                method="eth_getBalance",
                params=["0x407d73d8a49eeb85d32cf465507dd71d507100c1", "latest"],
                id=1
            )

    def test_empty_params_list(self):
        """Test with empty params list (should be valid)."""
        params = JSONRpcBodyParameters(
            method="eth_blockNumber",
            params=[],
            id=1,
            jsonrpc="2.0"
        )
        assert params.params == []

    def test_different_method_types(self):
        """Test different valid method names."""
        method_names = [
            "eth_getBlockByNumber",
            "web3_clientVersion",
            "custom_method",
            "method.with.dots",
            "method-with-hyphens"
        ]

        for method in method_names:
            params = JSONRpcBodyParameters(
                method=method,
                params=[],
                id=1,
                jsonrpc="2.0"
            )
            assert params.method == method

    def test_different_id_values(self):
        """Test different valid id values."""
        id_values = [0, 1, 99999]

        for id_val in id_values:
            params = JSONRpcBodyParameters(
                method="eth_blockNumber",
                params=[],
                id=id_val,
                jsonrpc="2.0"
            )
            assert params.id == id_val