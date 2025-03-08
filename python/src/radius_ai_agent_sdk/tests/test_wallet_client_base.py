"""
Tests for the WalletClientBase class and related functionality.
"""
import pytest
from radius.classes.wallet_client_base import EmptyParams, BalanceParams
from tests.conftest import MockWalletClient


def test_wallet_client_core_tools(mock_wallet_client):
    """Test that the wallet client provides core tools."""
    # Get core tools
    tools = mock_wallet_client.get_core_tools()
    
    # Verify the number of tools
    assert len(tools) == 3
    
    # Verify tool properties
    tool_names = [tool.name for tool in tools]
    assert "get_address" in tool_names
    assert "get_chain" in tool_names
    assert "get_balance" in tool_names
    
    # Verify tool parameters
    address_tool = next(tool for tool in tools if tool.name == "get_address")
    assert address_tool.parameters == EmptyParams
    
    chain_tool = next(tool for tool in tools if tool.name == "get_chain")
    assert chain_tool.parameters == EmptyParams
    
    balance_tool = next(tool for tool in tools if tool.name == "get_balance")
    assert balance_tool.parameters == BalanceParams


def test_get_address_tool(mock_wallet_client):
    """Test the get_address tool."""
    # Get the tool
    tools = mock_wallet_client.get_core_tools()
    address_tool = next(tool for tool in tools if tool.name == "get_address")
    
    # Execute the tool
    result = address_tool.execute({})
    
    # Verify result
    assert result == "0xmockedwalletaddress"


def test_get_chain_tool(mock_wallet_client):
    """Test the get_chain tool."""
    # Get the tool
    tools = mock_wallet_client.get_core_tools()
    chain_tool = next(tool for tool in tools if tool.name == "get_chain")
    
    # Execute the tool
    result = chain_tool.execute({})
    
    # Verify result
    assert result == {"type": "evm", "id": 1}


def test_get_balance_tool(mock_wallet_client):
    """Test the get_balance tool."""
    # Get the tool
    tools = mock_wallet_client.get_core_tools()
    balance_tool = next(tool for tool in tools if tool.name == "get_balance")
    
    # Execute the tool
    result = balance_tool.execute({"address": "0xsomeaddress"})
    
    # Verify result
    assert result["decimals"] == 18
    assert result["symbol"] == "ETH"
    assert result["name"] == "Ethereum"
    assert result["value"] == "1.5"
    assert result["in_base_units"] == "1500000000000000000"


def test_get_balance_tool_validation(mock_wallet_client):
    """Test that the get_balance tool validates parameters."""
    # Get the tool
    tools = mock_wallet_client.get_core_tools()
    balance_tool = next(tool for tool in tools if tool.name == "get_balance")
    
    # Execute with missing address parameter
    with pytest.raises(Exception):  # Pydantic will raise a validation error
        balance_tool.execute({})


def test_wallet_client_methods(mock_wallet_client):
    """Test the wallet client's abstract methods are properly implemented."""
    # Test get_address
    assert mock_wallet_client.get_address() == "0xmockedwalletaddress"
    
    # Test get_chain
    assert mock_wallet_client.get_chain() == {"type": "evm", "id": 1}
    
    # Test sign_message
    sig = mock_wallet_client.sign_message("test message")
    # The MockWalletClient implementation takes the first 10 chars of the message
    assert sig == {"signature": "sig_test messa"}
    
    # Test balance_of
    balance = mock_wallet_client.balance_of("0xsomeaddress")
    assert balance["decimals"] == 18
    assert balance["symbol"] == "ETH"
    assert balance["name"] == "Ethereum"
    assert balance["value"] == "1.5"
    assert balance["in_base_units"] == "1500000000000000000"


def test_wallet_client_with_custom_chain():
    """Test wallet client with a custom chain."""
    # Create wallet client with custom chain
    custom_chain = {"type": "evm", "id": 100}
    wallet = MockWalletClient(address="0xcustom", chain=custom_chain)
    
    # Verify chain
    assert wallet.get_chain() == custom_chain
    
    # Get core tools
    tools = wallet.get_core_tools()
    
    # Execute get_chain tool
    chain_tool = next(tool for tool in tools if tool.name == "get_chain")
    result = chain_tool.execute({})
    
    # Verify result
    assert result == custom_chain