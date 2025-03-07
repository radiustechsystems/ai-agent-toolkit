import pytest
from unittest.mock import Mock, patch
from typing import List, Dict, Any
from pydantic import BaseModel
from langchain_core.tools import BaseTool

from radius.classes.tool_base import ToolBase
from radius.classes.wallet_client_base import WalletClientBase
from radius.classes.plugin_base import PluginBase
from radius_adapters.langchain.adapter import get_on_chain_tools


class TestParameters(BaseModel):
    """Test parameters model for mocked tools."""
    param1: str
    param2: int


class MockWallet(WalletClientBase):
    """Mock wallet for testing."""
    
    def __init__(self, chain=None):
        self.chain = chain or {"type": "evm", "id": 1}
        
    def get_chain(self):
        return self.chain
    
    def get_core_tools(self):
        return []


class MockPlugin(PluginBase):
    """Mock plugin for testing."""
    
    def __init__(self, name="test_plugin", supported_chains=None):
        self.name = name
        self.supported_chains = supported_chains or [{"type": "evm", "id": 1}]
        
    def supports_chain(self, chain):
        return any(
            chain["type"] == c["type"] and chain["id"] == c["id"]
            for c in self.supported_chains
        )
        
    def get_tools(self, wallet):
        return []


class MockTool(ToolBase):
    """Mock tool for testing."""
    
    def __init__(self, name="test_tool", description="Test tool description"):
        config = {
            "name": name,
            "description": description,
            "parameters": TestParameters
        }
        super().__init__(config)
        
    def execute(self, parameters: Dict[str, Any]):
        # In a real test this would do something with the parameters
        return {"result": f"Executed {self.name} with {parameters}"}


class TestLangChainAdapter:
    """Test suite for the LangChain adapter."""

    def test_get_on_chain_tools_empty_plugins(self):
        """Test get_on_chain_tools with empty plugins list."""
        wallet = MockWallet()
        plugins = []
        
        with patch("radius_adapters.langchain.adapter.get_tools", return_value=[]):
            tools = get_on_chain_tools(wallet, plugins)
            
            assert isinstance(tools, list)
            assert len(tools) == 0

    def test_get_on_chain_tools_with_tools(self):
        """Test get_on_chain_tools with tools returned from plugins."""
        wallet = MockWallet()
        plugins = [MockPlugin()]
        
        mock_tool1 = MockTool(name="tool1", description="Tool 1 description")
        mock_tool2 = MockTool(name="tool2", description="Tool 2 description")
        
        with patch("radius_adapters.langchain.adapter.get_tools", return_value=[mock_tool1, mock_tool2]):
            tools = get_on_chain_tools(wallet, plugins)
            
            assert isinstance(tools, list)
            assert len(tools) == 2
            
            # Verify each tool was properly converted to a LangChain tool
            for tool in tools:
                assert isinstance(tool, BaseTool)
                assert tool.name in ["tool1", "tool2"]
                assert tool.description in ["Tool 1 description", "Tool 2 description"] 
                assert hasattr(tool, "func")

    def test_langchain_tool_execution(self):
        """Test that the LangChain tool correctly executes the underlying Radius tool."""
        wallet = MockWallet()
        plugins = [MockPlugin()]
        
        mock_tool = MockTool(name="test_tool")
        mock_tool.execute = Mock(return_value={"success": True})
        
        with patch("radius_adapters.langchain.adapter.get_tools", return_value=[mock_tool]):
            tools = get_on_chain_tools(wallet, plugins)
            
            assert len(tools) == 1
            langchain_tool = tools[0]
            
            # Execute the LangChain tool
            test_params = {"param1": "test", "param2": 123}
            result = langchain_tool.func(**test_params)
            
            # Verify the underlying Radius tool was executed with the parameters
            mock_tool.execute.assert_called_once_with(test_params)
            assert result == {"success": True}

    def test_tool_parameter_schemas(self):
        """Test that the parameter schema is properly passed to the LangChain tool."""
        wallet = MockWallet()
        plugins = [MockPlugin()]
        
        mock_tool = MockTool()
        
        with patch("radius_adapters.langchain.adapter.get_tools", return_value=[mock_tool]):
            tools = get_on_chain_tools(wallet, plugins)
            
            assert len(tools) == 1
            langchain_tool = tools[0]
            
            # Verify the parameter schema matches
            assert langchain_tool.args_schema == TestParameters

    def test_multiple_plugins_and_tools(self):
        """Test with multiple plugins and tools."""
        wallet = MockWallet()
        
        plugin1 = MockPlugin(name="plugin1")
        plugin2 = MockPlugin(name="plugin2")
        
        plugins = [plugin1, plugin2]
        
        mock_tools = [
            MockTool(name=f"tool{i}", description=f"Tool {i} description")
            for i in range(1, 6)
        ]
        
        with patch("radius_adapters.langchain.adapter.get_tools", return_value=mock_tools):
            tools = get_on_chain_tools(wallet, plugins)
            
            assert len(tools) == 5
            
            # Verify all tools were converted correctly
            tool_names = [tool.name for tool in tools]
            expected_names = [f"tool{i}" for i in range(1, 6)]
            
            assert set(tool_names) == set(expected_names)

    def test_tool_name_and_description_preserved(self):
        """Test that tool names and descriptions are preserved in the conversion process."""
        wallet = MockWallet()
        plugins = [MockPlugin()]
        
        # Create tool with specific name and description
        test_name = "special_tool_name"
        test_description = "This is a special tool description with áçcèntèd characters"
        mock_tool = MockTool(name=test_name, description=test_description)
        
        with patch("radius_adapters.langchain.adapter.get_tools", return_value=[mock_tool]):
            tools = get_on_chain_tools(wallet, plugins)
            
            assert len(tools) == 1
            langchain_tool = tools[0]
            
            # Verify name and description match exactly
            assert langchain_tool.name == test_name
            assert langchain_tool.description == test_description