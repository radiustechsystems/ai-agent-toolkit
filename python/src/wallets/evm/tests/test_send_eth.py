"""
Tests for the SendETH plugin.
"""
import pytest
from unittest.mock import Mock
from typing import cast

from radius_wallets.evm.send_eth import (
    SendETHPlugin,
    send_eth,
    send_eth_method,
    get_chain_token,
    RADIUS_CHAIN_ID,
    RADIUS_NATIVE_CURRENCY
)
from radius.types.chain import EvmChain
from radius_wallets.evm import EVMWalletClient


def test_send_eth_plugin_initialization():
    """Test SendETHPlugin initialization."""
    # Create plugin
    plugin = send_eth()
    
    # Verify plugin properties
    assert plugin.name == "sendETH"
    assert isinstance(plugin, SendETHPlugin)


def test_send_eth_plugin_supports_chain():
    """Test the supports_chain method of the SendETHPlugin."""
    # Create plugin
    plugin = send_eth()
    
    # Test with Radius chain (should be supported)
    radius_chain: EvmChain = {"type": "evm", "id": RADIUS_CHAIN_ID}
    assert plugin.supports_chain(radius_chain) is True
    
    # Test with other EVM chain (should not be supported)
    ethereum_chain: EvmChain = {"type": "evm", "id": 1}
    assert plugin.supports_chain(ethereum_chain) is False
    
    # Test with non-EVM chain (should not be supported)
    solana_chain = {"type": "solana", "id": 101}
    assert plugin.supports_chain(solana_chain) is False


def test_send_eth_plugin_get_tools():
    """Test the get_tools method of the SendETHPlugin."""
    # Create plugin
    plugin = send_eth()
    
    # Create mock wallet client
    wallet_client = Mock(spec=EVMWalletClient)
    wallet_client.get_chain.return_value = cast(EvmChain, {"type": "evm", "id": RADIUS_CHAIN_ID})
    
    # Get tools
    tools = plugin.get_tools(wallet_client)
    
    # Verify tools
    assert len(tools) == 1
    
    # Verify tool properties
    tool = tools[0]
    assert tool.name == f"send_{RADIUS_NATIVE_CURRENCY['symbol']}"
    assert f"Send {RADIUS_NATIVE_CURRENCY['symbol']} to an address" in tool.description


def test_send_eth_method():
    """Test the send_eth_method function."""
    # Create mock wallet client
    wallet_client = Mock(spec=EVMWalletClient)
    wallet_client.get_chain.return_value = cast(EvmChain, {"type": "evm", "id": RADIUS_CHAIN_ID})
    wallet_client.send_transaction.return_value = {"hash": "0xmockedtxhash"}
    
    # Call send_eth_method
    parameters = {
        "to": "0xrecipient",
        "amount": "1.5"
    }
    result = send_eth_method(wallet_client, parameters)
    
    # Verify result
    assert result == "0xmockedtxhash"
    
    # Verify wallet_client.send_transaction was called with correct parameters
    wallet_client.send_transaction.assert_called_once()
    call_args = wallet_client.send_transaction.call_args[0][0]
    assert call_args["to"] == "0xrecipient"
    assert call_args["value"] == 1500000000000000000  # 1.5 ETH in Wei


def test_send_eth_method_error_handling():
    """Test error handling in send_eth_method."""
    # Create mock wallet client
    wallet_client = Mock(spec=EVMWalletClient)
    wallet_client.get_chain.return_value = cast(EvmChain, {"type": "evm", "id": RADIUS_CHAIN_ID})
    wallet_client.send_transaction.side_effect = Exception("Transaction failed")
    
    # Call send_eth_method and expect an exception
    parameters = {
        "to": "0xrecipient",
        "amount": "1.5"
    }
    with pytest.raises(Exception) as excinfo:
        send_eth_method(wallet_client, parameters)
    
    # Verify exception message
    assert f"Failed to send {RADIUS_NATIVE_CURRENCY['symbol']}: Transaction failed" in str(excinfo.value)


def test_get_chain_token():
    """Test the get_chain_token function."""
    # Get token info for Radius chain
    token_info = get_chain_token(RADIUS_CHAIN_ID)
    
    # Verify token info
    assert token_info["symbol"] == RADIUS_NATIVE_CURRENCY["symbol"]
    assert token_info["name"] == RADIUS_NATIVE_CURRENCY["name"]
    assert token_info["decimals"] == RADIUS_NATIVE_CURRENCY["decimals"]


def test_get_chain_token_unsupported_chain():
    """Test get_chain_token with unsupported chain."""
    # Call get_chain_token with unsupported chain ID
    with pytest.raises(Exception) as excinfo:
        get_chain_token(1)  # Ethereum chain ID
    
    # Verify exception message
    assert f"Unsupported EVM chain ID: 1. Only Radius chain (ID: {RADIUS_CHAIN_ID}) is supported" in str(excinfo.value)


def test_send_eth_tool_execution():
    """Test executing the send_eth tool."""
    # Create plugin
    plugin = send_eth()
    
    # Create mock wallet client
    wallet_client = Mock(spec=EVMWalletClient)
    wallet_client.get_chain.return_value = cast(EvmChain, {"type": "evm", "id": RADIUS_CHAIN_ID})
    wallet_client.send_transaction.return_value = {"hash": "0xmockedtxhash"}
    
    # Get tools
    tools = plugin.get_tools(wallet_client)
    assert len(tools) == 1
    send_tool = tools[0]
    
    # Execute the tool
    result = send_tool.execute({
        "to": "0xrecipient",
        "amount": "2.5"
    })
    
    # Verify result
    assert result == "0xmockedtxhash"
    
    # Verify wallet_client.send_transaction was called with correct parameters
    wallet_client.send_transaction.assert_called_once()
    call_args = wallet_client.send_transaction.call_args[0][0]
    assert call_args["to"] == "0xrecipient"
    assert call_args["value"] == 2500000000000000000  # 2.5 ETH in Wei