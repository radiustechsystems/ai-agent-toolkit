"""
Pytest configuration for the Radius AI Agent SDK tests.
"""
import pytest
from typing import Dict, Any, List
from pydantic import BaseModel
from radius.classes.plugin_base import PluginBase
from radius.classes.tool_base import ToolBase
from radius.classes.wallet_client_base import WalletClientBase, Balance, Signature
from radius.types.chain import Chain


class TestParameters(BaseModel):
    """Test parameters model for test tools."""
    param1: str
    param2: int


class MockWalletClient(WalletClientBase):
    """Mock wallet client for testing."""
    
    def __init__(self, address="0xmockedwalletaddress", chain=None):
        self.address = address
        self._chain = chain or {"type": "evm", "id": 1}
        
    def get_address(self) -> str:
        return self.address
    
    def get_chain(self) -> Chain:
        return self._chain
    
    def sign_message(self, message: str) -> Signature:
        return {"signature": f"sig_{message[:10]}"}
    
    def balance_of(self, address: str) -> Balance:
        return {
            "decimals": 18,
            "symbol": "ETH",
            "name": "Ethereum",
            "value": "1.5",
            "in_base_units": "1500000000000000000"
        }


class MockPlugin(PluginBase):
    """Mock plugin for testing."""
    
    def __init__(self, name="test_plugin", supported_chains=None, tools=None):
        self.supported_chains = supported_chains or [{"type": "evm", "id": 1}]
        self.tools_to_return = tools or []
        
        class ToolProvider:
            def get_test_tool(self, parameters: Dict[str, Any]):
                return {"result": f"Test tool executed with {parameters}"}
                
            async def get_async_test_tool(self, parameters: Dict[str, Any]):
                return {"result": f"Async test tool executed with {parameters}"}
        
        super().__init__(name, [ToolProvider()])
    
    def supports_chain(self, chain: Chain) -> bool:
        return any(
            chain["type"] == c["type"] and chain["id"] == c["id"]
            for c in self.supported_chains
        )
    
    def get_tools(self, wallet_client) -> List[ToolBase]:
        """Override to control returned tools in tests."""
        if self.tools_to_return:
            return self.tools_to_return
        return super().get_tools(wallet_client)


@pytest.fixture
def mock_wallet_client():
    """Fixture that provides a mock wallet client for testing."""
    return MockWalletClient()


@pytest.fixture
def mock_plugin():
    """Fixture that provides a mock plugin for testing."""
    return MockPlugin()


@pytest.fixture
def test_parameters():
    """Fixture that provides test parameters for testing."""
    return TestParameters(param1="test", param2=123)