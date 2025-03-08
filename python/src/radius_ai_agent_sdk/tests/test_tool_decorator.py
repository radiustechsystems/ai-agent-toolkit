"""
Tests for the Tool decorator and related functionality.
"""
import pytest

from radius.decorators.tool import Tool, TOOL_METADATA_KEY, validate_decorator_parameters
from radius.classes.wallet_client_base import WalletClientBase
from tests.conftest import TestParameters, MockWalletClient


def test_tool_decorator_basic():
    """Test the basic functionality of the Tool decorator."""
    # Create a class with a decorated method
    class TestService:
        @Tool({
            "description": "A test tool",
            "parameters_schema": TestParameters
        })
        def test_tool(self, params: dict):
            return {"result": f"Tool executed with {params}"}
    
    # Create an instance
    service = TestService()
    
    # Check if the metadata was correctly attached to the method
    metadata = getattr(service.test_tool, TOOL_METADATA_KEY, None)
    assert metadata is not None
    assert metadata.name == "test_tool"  # Default name from method name
    assert metadata.description == "A test tool"
    assert metadata.parameters["schema"] == TestParameters


def test_tool_decorator_with_custom_name():
    """Test the Tool decorator with a custom name."""
    # Create a class with a decorated method using a custom name
    class TestService:
        @Tool({
            "name": "custom_name",
            "description": "A tool with custom name",
            "parameters_schema": TestParameters
        })
        def test_tool(self, params: dict):
            return {"result": "Executed"}
    
    # Create an instance
    service = TestService()
    
    # Check if the metadata was correctly attached to the method
    metadata = getattr(service.test_tool, TOOL_METADATA_KEY, None)
    assert metadata is not None
    assert metadata.name == "custom_name"  # Custom name from decorator
    assert metadata.description == "A tool with custom name"


def test_validate_decorator_parameters_basic():
    """Test the validate_decorator_parameters function with a valid method."""
    # Create a test method with the right signature
    def test_method(self, params: dict):
        pass
    
    # Validate parameters
    result = validate_decorator_parameters(test_method)
    
    # Verify result
    assert result["parameters"] == 1  # params is at index 1 (after self)
    assert "wallet_client" not in result  # No wallet client parameter


def test_validate_decorator_parameters_with_wallet():
    """Test validate_decorator_parameters with a method that has a wallet parameter."""
    # Create a test method with wallet and params
    def test_method(self, params: dict, wallet_client: WalletClientBase):
        pass
    
    # Validate parameters
    result = validate_decorator_parameters(test_method)
    
    # Verify result
    assert result["parameters"] == 1  # params is at index 1
    assert result["wallet_client"] == 2  # wallet_client is at index 2


def test_validate_decorator_parameters_invalid_no_params():
    """Test validate_decorator_parameters with a method that has no parameters."""
    # Create a test method with no parameters
    def test_method():
        pass
    
    # Validation should fail
    with pytest.raises(ValueError):
        validate_decorator_parameters(test_method)


def test_validate_decorator_parameters_invalid_no_dict():
    """Test validate_decorator_parameters with a method that has no dict parameter."""
    # Create a test method with non-dict parameter
    def test_method(self, params: str):
        pass
    
    # Validation should fail
    with pytest.raises(ValueError):
        validate_decorator_parameters(test_method)


def test_validate_decorator_parameters_invalid_too_many():
    """Test validate_decorator_parameters with a method that has too many parameters."""
    # Create a test method with too many parameters
    def test_method(self, param1: dict, param2: WalletClientBase, param3: str, param4: int):
        pass
    
    # Validation should fail
    with pytest.raises(ValueError):
        validate_decorator_parameters(test_method)


def test_tool_execution_in_class_context():
    """Test that a tool-decorated method works in a class context."""
    # Create a class with a decorated method
    class TestService:
        def __init__(self, value):
            self.value = value
        
        @Tool({
            "description": "A test tool that uses instance state",
            "parameters_schema": TestParameters
        })
        def test_tool(self, params: dict):
            return {"result": f"Value: {self.value}, Params: {params}"}
    
    # Create an instance
    service = TestService("test_value")
    
    # Call the method directly
    result = service.test_tool({"param1": "test", "param2": 123})
    
    # Verify result
    assert result == {"result": "Value: test_value, Params: {'param1': 'test', 'param2': 123}"}


def test_tool_execution_with_wallet_client():
    """Test tool execution with a wallet client parameter."""
    # Create a class with a decorated method that uses a wallet client
    class TestService:
        @Tool({
            "description": "A tool that uses a wallet client",
            "parameters_schema": TestParameters
        })
        def test_tool(self, params: dict, wallet_client: WalletClientBase):
            return {
                "wallet_address": wallet_client.get_address(),
                "params": params
            }
    
    # Create an instance
    service = TestService()
    wallet = MockWalletClient(address="0xspecialaddress")
    
    # Call the method directly
    result = service.test_tool({"param1": "test", "param2": 123}, wallet)
    
    # Verify result
    assert result["wallet_address"] == "0xspecialaddress"
    assert result["params"] == {"param1": "test", "param2": 123}