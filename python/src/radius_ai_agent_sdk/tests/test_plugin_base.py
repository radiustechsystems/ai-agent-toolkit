"""
Tests for the PluginBase class and related functionality.
"""
import pytest
from unittest.mock import Mock

from radius.classes.plugin_base import PluginBase
from radius.decorators.tool import Tool
from tests.conftest import MockPlugin, MockWalletClient, TestParameters


def test_plugin_initialization():
    """Test that the plugin can be properly initialized."""
    # Create a plugin instance
    plugin = MockPlugin(name="test_plugin")
    
    # Verify plugin properties
    assert plugin.name == "test_plugin"
    assert len(plugin.tool_providers) == 1


def test_plugin_initialization_with_invalid_providers():
    """Test that the plugin rejects invalid tool providers."""
    # Class instead of instance
    class InvalidToolProvider:
        def some_method(self):
            pass
    
    # Creating plugin with a class instead of an instance should raise an error
    with pytest.raises(TypeError):
        PluginBase.__new__(PluginBase)._proxyInit("test", [InvalidToolProvider])


def test_supports_chain():
    """Test the supports_chain method."""
    # Create a plugin instance with specific chain support
    supported_chains = [
        {"type": "evm", "id": 1},
        {"type": "evm", "id": 100}
    ]
    plugin = MockPlugin(supported_chains=supported_chains)
    
    # Test with supported chains
    assert plugin.supports_chain({"type": "evm", "id": 1}) is True
    assert plugin.supports_chain({"type": "evm", "id": 100}) is True
    
    # Test with unsupported chains
    assert plugin.supports_chain({"type": "evm", "id": 200}) is False
    assert plugin.supports_chain({"type": "solana", "id": 101}) is False


def test_get_tools():
    """Test the get_tools method that collects tools from providers."""
    # Create a class with tool-decorated methods
    class ToolProviderWithDecorators:
        @Tool({
            "description": "A test tool with decorator",
            "parameters_schema": TestParameters
        })
        def test_tool(self, params: dict):
            return {"result": f"Tool executed with {params}"}
        
        # Method without decorator
        def not_a_tool(self):
            return "Not a tool"
    
    # Create a class that extends PluginBase just for testing
    class TestPlugin(PluginBase):
        def supports_chain(self, chain):
            return True
            
    # Create a plugin with the test provider
    plugin = TestPlugin("test_plugin", [ToolProviderWithDecorators()])
    
    # Create a wallet client
    wallet = MockWalletClient()
    
    # Get tools
    tools = plugin.get_tools(wallet)
    
    # Verify tools
    assert len(tools) == 1
    assert tools[0].name == "test_tool"


def test_execute_tool():
    """Test the _execute_tool method."""
    # Use MockPlugin with pre-defined tools
    mock_tool = Mock()
    mock_tool.name = "mock_tool"
    mock_tool.execute = Mock(return_value={"result": "Tool executed"})
    
    # Create plugin with the mock tool
    plugin = MockPlugin(tools=[mock_tool])
    
    # Create a wallet client
    wallet = MockWalletClient()
    
    # Get the tools from the plugin
    tools = plugin.get_tools(wallet)
    assert len(tools) == 1
    
    # Execute the tool
    params = {"param1": "test", "param2": 123}
    result = tools[0].execute(params)
    assert result == {"result": "Tool executed"}
    
    # Verify the mock was called with the parameters
    mock_tool.execute.assert_called_once_with(params)


@pytest.mark.asyncio
async def test_execute_async_tool():
    """Test executing an async tool."""
    # Use the mock plugin's async tool
    
    # Get an async response directly from the provider method
    plugin = MockPlugin()
    provider = plugin.tool_providers[0]
    
    # Call the async method directly
    params = {"param1": "test", "param2": 123}
    async_result = await provider.get_async_test_tool(params)
    
    # Verify we can get an async result from the provider
    assert async_result["result"].startswith("Async test tool")


def test_tool_collection_from_multiple_providers():
    """Test collecting tools from multiple providers."""
    # Create tool provider classes
    class ToolProvider1:
        @Tool({
            "description": "Tool from provider 1",
            "parameters_schema": TestParameters
        })
        def tool1(self, params: dict):
            return {"provider": 1}
    
    class ToolProvider2:
        @Tool({
            "description": "Tool from provider 2",
            "parameters_schema": TestParameters
        })
        def tool2(self, params: dict):
            return {"provider": 2}
    
    # Create a class that extends PluginBase for testing
    class TestPlugin(PluginBase):
        def supports_chain(self, chain):
            return True
            
    # Create a plugin with both providers
    plugin = TestPlugin("multi_provider_plugin", [ToolProvider1(), ToolProvider2()])
    
    # Create a wallet client
    wallet = MockWalletClient()
    
    # Get tools
    tools = plugin.get_tools(wallet)
    
    # Verify tools
    assert len(tools) == 2
    tool_names = [tool.name for tool in tools]
    assert "tool1" in tool_names
    assert "tool2" in tool_names