"""
Tests for the get_tools utility function.
"""
from unittest.mock import Mock, patch

from radius.utils.get_tools import get_tools
from radius.classes.tool_base import create_tool
from tests.conftest import MockWalletClient, MockPlugin, TestParameters


def test_get_tools_empty_plugins():
    """Test get_tools with an empty plugins list."""
    # Create a wallet client
    wallet = MockWalletClient()
    
    # Create a mock for wallet.get_core_tools
    core_tools = [
        create_tool(
            {
                "name": "core_tool",
                "description": "A core wallet tool",
                "parameters": TestParameters
            },
            lambda _: {"result": "Core tool executed"}
        )
    ]
    wallet.get_core_tools = Mock(return_value=core_tools)
    
    # Get tools with empty plugins list
    tools = get_tools(wallet, [])
    
    # Verify tools
    assert len(tools) == 1
    assert tools[0].name == "core_tool"


def test_get_tools_with_plugins():
    """Test get_tools with plugins."""
    # Create a wallet client
    wallet = MockWalletClient()
    
    # Create a mock for wallet.get_core_tools
    core_tools = [
        create_tool(
            {
                "name": "core_tool",
                "description": "A core wallet tool",
                "parameters": TestParameters
            },
            lambda _: {"result": "Core tool executed"}
        )
    ]
    wallet.get_core_tools = Mock(return_value=core_tools)
    
    # Create plugins with tools
    plugin1_tools = [
        create_tool(
            {
                "name": "plugin1_tool",
                "description": "A tool from plugin 1",
                "parameters": TestParameters
            },
            lambda _: {"result": "Plugin 1 tool executed"}
        )
    ]
    plugin1 = MockPlugin(name="plugin1")
    plugin1.get_tools = Mock(return_value=plugin1_tools)
    
    plugin2_tools = [
        create_tool(
            {
                "name": "plugin2_tool1",
                "description": "A tool from plugin 2",
                "parameters": TestParameters
            },
            lambda _: {"result": "Plugin 2 tool 1 executed"}
        ),
        create_tool(
            {
                "name": "plugin2_tool2",
                "description": "Another tool from plugin 2",
                "parameters": TestParameters
            },
            lambda _: {"result": "Plugin 2 tool 2 executed"}
        )
    ]
    plugin2 = MockPlugin(name="plugin2")
    plugin2.get_tools = Mock(return_value=plugin2_tools)
    
    # Get tools with both plugins
    tools = get_tools(wallet, [plugin1, plugin2])
    
    # Verify tools
    assert len(tools) == 4  # 1 core tool + 1 from plugin1 + 2 from plugin2
    tool_names = [tool.name for tool in tools]
    assert "core_tool" in tool_names
    assert "plugin1_tool" in tool_names
    assert "plugin2_tool1" in tool_names
    assert "plugin2_tool2" in tool_names


def test_get_tools_plugin_chain_filtering():
    """Test that plugins not supporting the chain are filtered out."""
    # Create a wallet client with a specific chain
    wallet = MockWalletClient(chain={"type": "evm", "id": 100})
    
    # Create a mock for wallet.get_core_tools
    core_tools = [
        create_tool(
            {
                "name": "core_tool",
                "description": "A core wallet tool",
                "parameters": TestParameters
            },
            lambda _: {"result": "Core tool executed"}
        )
    ]
    wallet.get_core_tools = Mock(return_value=core_tools)
    
    # Create plugins with different chain support
    plugin1 = MockPlugin(
        name="plugin1",
        supported_chains=[{"type": "evm", "id": 1}]  # Does not support chain 100
    )
    plugin1.get_tools = Mock(return_value=[])  # Should not be called
    
    plugin2 = MockPlugin(
        name="plugin2",
        supported_chains=[{"type": "evm", "id": 100}]  # Supports chain 100
    )
    plugin2_tools = [
        create_tool(
            {
                "name": "plugin2_tool",
                "description": "A tool from plugin 2",
                "parameters": TestParameters
            },
            lambda _: {"result": "Plugin 2 tool executed"}
        )
    ]
    plugin2.get_tools = Mock(return_value=plugin2_tools)
    
    # Mock print function to capture warning messages
    with patch("builtins.print") as mock_print:
        # Get tools
        tools = get_tools(wallet, [plugin1, plugin2])
        
        # Verify warning message for unsupported plugin
        mock_print.assert_called_once()
        warning_msg = mock_print.call_args[0][0]
        assert "Plugin plugin1 does not support evm chain id 100" in warning_msg
    
    # Verify tools
    assert len(tools) == 2  # 1 core tool + 1 from plugin2
    tool_names = [tool.name for tool in tools]
    assert "core_tool" in tool_names
    assert "plugin2_tool" in tool_names
    
    # Verify that plugin1.get_tools was not called
    plugin1.get_tools.assert_not_called()
    
    # Verify that plugin2.get_tools was called
    plugin2.get_tools.assert_called_once_with(wallet)


def test_get_tools_default_plugins():
    """Test get_tools with default plugins value."""
    # Create a wallet client
    wallet = MockWalletClient()
    
    # Create a mock for wallet.get_core_tools
    core_tools = [
        create_tool(
            {
                "name": "core_tool",
                "description": "A core wallet tool",
                "parameters": TestParameters
            },
            lambda _: {"result": "Core tool executed"}
        )
    ]
    wallet.get_core_tools = Mock(return_value=core_tools)
    
    # Get tools with default plugins (None)
    tools = get_tools(wallet)
    
    # Verify tools
    assert len(tools) == 1
    assert tools[0].name == "core_tool"