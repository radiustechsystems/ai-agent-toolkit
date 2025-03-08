"""
Tests for the ToolBase class and related functionality.
"""
import pytest
from typing import Dict, Any
from pydantic import BaseModel

from radius.classes.tool_base import ToolBase, create_tool, ToolConfig


class TestParameters(BaseModel):
    """Test parameters for tool tests."""
    param1: str
    param2: int


def test_tool_base_initialization():
    """Test that the ToolBase class can be properly initialized."""
    # Create a configuration object
    config: ToolConfig = {
        "name": "test_tool",
        "description": "A test tool",
        "parameters": TestParameters
    }
    
    # Create a concrete subclass for testing
    class TestTool(ToolBase):
        def execute(self, parameters: Dict[str, Any]):
            return {"result": f"Executed with {parameters}"}
    
    # Create an instance
    tool = TestTool(config)
    
    # Verify tool properties
    assert tool.name == "test_tool"
    assert tool.description == "A test tool"
    assert tool.parameters == TestParameters
    
    # Test execution
    result = tool.execute({"param1": "test", "param2": 123})
    assert result == {"result": "Executed with {'param1': 'test', 'param2': 123}"}


def test_create_tool():
    """Test the create_tool factory function."""
    # Create a configuration object
    config: ToolConfig = {
        "name": "factory_tool",
        "description": "A tool created with the factory function",
        "parameters": TestParameters
    }
    
    # Define an execution function
    def execute_fn(params: Dict[str, Any]):
        return {"factory_result": f"Factory executed with {params}"}
    
    # Create a tool using the factory
    tool = create_tool(config, execute_fn)
    
    # Verify tool properties
    assert tool.name == "factory_tool"
    assert tool.description == "A tool created with the factory function"
    assert tool.parameters == TestParameters
    
    # Test execution with valid parameters
    result = tool.execute({"param1": "test", "param2": 123})
    assert result == {"factory_result": "Factory executed with {'param1': 'test', 'param2': 123}"}


def test_tool_parameter_validation():
    """Test that tool parameters are properly validated."""
    # Create a tool with validation
    config: ToolConfig = {
        "name": "validation_tool",
        "description": "A tool that validates parameters",
        "parameters": TestParameters
    }
    
    def execute_fn(params: Dict[str, Any]):
        return {"validation_result": "Validation passed"}
    
    tool = create_tool(config, execute_fn)
    
    # Test with valid parameters
    result = tool.execute({"param1": "test", "param2": 123})
    assert result == {"validation_result": "Validation passed"}
    
    # Test with invalid parameters (missing required field)
    with pytest.raises(Exception):  # Pydantic will raise a validation error
        tool.execute({"param1": "test"})
    
    # Test with invalid parameters (wrong type)
    with pytest.raises(Exception):  # Pydantic will raise a validation error
        tool.execute({"param1": "test", "param2": "not_an_integer"})


def test_tool_with_extra_parameters():
    """Test tool execution with extra parameters that aren't in the schema."""
    # Create a tool
    config: ToolConfig = {
        "name": "extra_params_tool",
        "description": "A tool that handles extra parameters",
        "parameters": TestParameters
    }
    
    captured_params = {}
    
    def execute_fn(params: Dict[str, Any]):
        # Store the params for inspection
        nonlocal captured_params
        captured_params = params
        return {"result": "Success"}
    
    tool = create_tool(config, execute_fn)
    
    # Execute with extra parameters
    tool.execute({
        "param1": "test", 
        "param2": 123,
        "extra_param": "should_be_filtered"
    })
    
    # Verify that extra parameters are filtered out
    assert "extra_param" not in captured_params
    assert captured_params == {"param1": "test", "param2": 123}