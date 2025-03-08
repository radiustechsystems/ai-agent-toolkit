"""
Tests for the PluginBase class and related functionality.
"""
import pytest
import asyncio
from typing import Dict, Any
from unittest.mock import patch, Mock

from radius.classes.plugin_base import PluginBase
from radius.decorators.tool import Tool, TOOL_METADATA_KEY
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
        def test_tool(self, params: Dict[str, Any]):
            return {"result": f"Tool executed with {params}"}
        
        # Method without decorator
        def not_a_tool(self):
            return "Not a tool"
    
    # Create a plugin with this provider
    plugin = PluginBase.__new__(PluginBase)
    plugin.name = "test_plugin"
    plugin.tool_providers = [ToolProviderWithDecorators()]
    
    # Mock supports_chain since it's abstract
    plugin.supports_chain = lambda _: True
    
    # Create a wallet client
    wallet = MockWalletClient()
    
    # Get tools
    tools = plugin.get_tools(wallet)
    
    # Verify tools
    assert len(tools) == 1
    assert tools[0].name == "test_tool"


def test_execute_tool():
    """Test the _execute_tool method."""
    # Create a tool provider class with a simple method
    class ToolProvider:
        def test_tool(self, params, wallet=None):
            return {"result": f"Executed with {params}"}
    
    # Create plugin and tool metadata
    plugin = PluginBase.__new__(PluginBase)
    provider = ToolProvider()
    wallet = MockWalletClient()
    
    # Create tool metadata
    tool_fn = provider.test_tool
    setattr(tool_fn, TOOL_METADATA_KEY, Mock(
        target=tool_fn,
        name="test_tool",
        description="Test tool",
        wallet_client={"index": 2},
        parameters={"index": 1}
    ))
    
    # Execute the tool
    result = plugin._execute_tool(
        getattr(tool_fn, TOOL_METADATA_KEY),
        provider,
        wallet,
        {"param1": "test", "param2": 123}
    )
    
    # Verify result
    assert result == {"result": "Executed with {'param1': 'test', 'param2': 123}"}


@pytest.mark.asyncio
async def test_execute_async_tool():
    """Test executing an async tool."""
    # Create a tool provider with an async method
    class AsyncToolProvider:
        async def async_test_tool(self, params):
            await asyncio.sleep(0.01)  # Small delay to simulate async operation
            return {"async_result": f"Async executed with {params}"}
    
    # Create plugin and tool metadata
    plugin = PluginBase.__new__(PluginBase)
    provider = AsyncToolProvider()
    
    # Create tool metadata
    tool_fn = provider.async_test_tool
    setattr(tool_fn, TOOL_METADATA_KEY, Mock(
        target=tool_fn,
        name="async_test_tool",
        description="Async test tool",
        wallet_client={"index": None},
        parameters={"index": 1}
    ))
    
    # Test handling of coroutine result
    with patch("inspect.iscoroutine", return_value=True):
        # Case 1: Existing event loop not running
        with patch("asyncio.get_event_loop") as mock_get_loop:
            mock_loop = Mock()
            mock_loop.is_running.return_value = False
            mock_loop.run_until_complete.return_value = {"mocked_result": True}
            mock_get_loop.return_value = mock_loop
            
            result = plugin._execute_tool(
                getattr(tool_fn, TOOL_METADATA_KEY),
                provider,
                None,
                {"param1": "async"}
            )
            
            assert result == {"mocked_result": True}
            mock_loop.run_until_complete.assert_called_once()
        
        # Case 2: Existing event loop is running
        with patch("asyncio.get_event_loop") as mock_get_loop:
            mock_loop = Mock()
            mock_loop.is_running.return_value = True
            mock_get_loop.return_value = mock_loop
            
            # Mock the thread function to return a result directly
            with patch.object(plugin, "_run_coroutine_in_new_thread", return_value={"thread_result": True}):
                result = plugin._execute_tool(
                    getattr(tool_fn, TOOL_METADATA_KEY),
                    provider,
                    None,
                    {"param1": "async"}
                )
                
                assert result == {"thread_result": True}
        
        # Case 3: No existing event loop
        with patch("asyncio.get_event_loop", side_effect=RuntimeError("No event loop")):
            with patch("asyncio.new_event_loop") as mock_new_loop, \
                 patch("asyncio.set_event_loop") as mock_set_loop:
                
                mock_loop = Mock()
                mock_loop.run_until_complete.return_value = {"new_loop_result": True}
                mock_new_loop.return_value = mock_loop
                
                result = plugin._execute_tool(
                    getattr(tool_fn, TOOL_METADATA_KEY),
                    provider,
                    None,
                    {"param1": "async"}
                )
                
                assert result == {"new_loop_result": True}
                mock_new_loop.assert_called_once()
                mock_set_loop.assert_called_once_with(mock_loop)


def test_tool_collection_from_multiple_providers():
    """Test collecting tools from multiple providers."""
    # Create tool provider classes
    class ToolProvider1:
        @Tool({
            "description": "Tool from provider 1",
            "parameters_schema": TestParameters
        })
        def tool1(self, params: Dict[str, Any]):
            return {"provider": 1}
    
    class ToolProvider2:
        @Tool({
            "description": "Tool from provider 2",
            "parameters_schema": TestParameters
        })
        def tool2(self, params: Dict[str, Any]):
            return {"provider": 2}
    
    # Create a plugin with both providers
    plugin = PluginBase.__new__(PluginBase)
    plugin.name = "multi_provider_plugin"
    plugin.tool_providers = [ToolProvider1(), ToolProvider2()]
    
    # Mock supports_chain since it's abstract
    plugin.supports_chain = lambda _: True
    
    # Create a wallet client
    wallet = MockWalletClient()
    
    # Get tools
    tools = plugin.get_tools(wallet)
    
    # Verify tools
    assert len(tools) == 2
    tool_names = [tool.name for tool in tools]
    assert "tool1" in tool_names
    assert "tool2" in tool_names