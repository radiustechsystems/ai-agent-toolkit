"""
Tests for the EVMWalletClient class.
"""
import pytest
from typing import Dict, cast
from unittest.mock import Mock, MagicMock

from radius.types.chain import EvmChain
from radius_wallets.evm import EVMWalletClient, EVMTransaction, EVMReadRequest, EVMTypedData


def test_wallet_client_interface(mock_evm_wallet_client):
    """Test that the mock wallet client implements the abstract interface correctly."""
    # We can use isinstance to verify the mock implements the abstract class
    assert isinstance(mock_evm_wallet_client, EVMWalletClient)
    
    # Check that all abstract methods are implemented
    assert hasattr(mock_evm_wallet_client, 'get_address')
    assert hasattr(mock_evm_wallet_client, 'get_chain')
    assert hasattr(mock_evm_wallet_client, 'send_transaction')
    assert hasattr(mock_evm_wallet_client, 'read')
    assert hasattr(mock_evm_wallet_client, 'resolve_address')
    assert hasattr(mock_evm_wallet_client, 'sign_typed_data')


def test_get_address(mock_evm_wallet_client):
    """Test getting the wallet address."""
    address = mock_evm_wallet_client.get_address()
    assert address == "0xmockedwalletaddress"


def test_get_chain(mock_evm_wallet_client):
    """Test getting the chain information."""
    chain = mock_evm_wallet_client.get_chain()
    assert chain["type"] == "evm"
    assert chain["id"] == 1223953


def test_sign_message(mock_evm_wallet_client):
    """Test signing a message."""
    message = "Test message to sign"
    signature = mock_evm_wallet_client.sign_message(message)
    assert signature["signature"] == f"{mock_evm_wallet_client.default_signature}_{message[:10]}"


def test_send_transaction(mock_evm_wallet_client):
    """Test sending a transaction."""
    transaction: EVMTransaction = {
        "to": "0xrecipientaddress",
        "value": 1000000000000000000,  # 1 ETH
    }
    result = mock_evm_wallet_client.send_transaction(transaction)
    assert "hash" in result
    assert result["hash"] == mock_evm_wallet_client.default_tx_hash
    assert result["status"] == "1"


def test_read(mock_evm_wallet_client):
    """Test reading from a contract."""
    request: EVMReadRequest = {
        "address": "0xcontractaddress",
        "functionName": "balanceOf",
        "args": ["0xsomeaddress"],
        "abi": [{"type": "function", "name": "balanceOf", "inputs": [{"type": "address"}], "outputs": [{"type": "uint256"}]}]
    }
    result = mock_evm_wallet_client.read(request)
    assert "value" in result
    assert result["value"] == "mockedReadValue"


def test_resolve_address(mock_evm_wallet_client):
    """Test resolving an address."""
    # Test address with 0x prefix
    address = "0xrecipientaddress"
    resolved = mock_evm_wallet_client.resolve_address(address)
    assert resolved == address
    
    # Test address without 0x prefix
    address_no_prefix = "recipientaddress"
    resolved = mock_evm_wallet_client.resolve_address(address_no_prefix)
    assert resolved == f"0x{address_no_prefix}"


def test_sign_typed_data(mock_evm_wallet_client):
    """Test signing typed data."""
    typed_data: EVMTypedData = {
        "domain": {
            "name": "Test Domain",
            "version": "1",
            "chainId": 1223953,
            "verifyingContract": "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
        },
        "types": {
            "EIP712Domain": [
                {"name": "name", "type": "string"},
                {"name": "version", "type": "string"},
                {"name": "chainId", "type": "uint256"},
                {"name": "verifyingContract", "type": "address"}
            ],
            "Person": [
                {"name": "name", "type": "string"},
                {"name": "wallet", "type": "address"}
            ]
        },
        "primaryType": "Person",
        "message": {
            "name": "John Doe",
            "wallet": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"
        }
    }
    
    signature = mock_evm_wallet_client.sign_typed_data(typed_data)
    assert "signature" in signature
    assert signature["signature"] == mock_evm_wallet_client.default_signature


def test_balance_of(mock_evm_wallet_client):
    """Test getting balance information."""
    balance = mock_evm_wallet_client.balance_of("0xsomeaddress")
    
    assert "decimals" in balance
    assert "symbol" in balance
    assert "name" in balance
    assert "value" in balance
    assert "in_base_units" in balance
    
    assert balance["decimals"] == 18
    assert balance["symbol"] == "ETH"
    assert balance["name"] == "Ethereum"
    assert balance["value"] == "1.5"
    assert balance["in_base_units"] == "1500000000000000000"


def test_wallet_client_with_custom_chain():
    """Test wallet client with a custom chain."""
    custom_chain_id = 5
    custom_address = "0xcustomwalletaddress"
    
    # Create a custom wallet client
    wallet = Mock(spec=EVMWalletClient)
    wallet.get_chain.return_value = cast(EvmChain, {"type": "evm", "id": custom_chain_id})
    wallet.get_address.return_value = custom_address
    
    # Verify chain and address
    assert wallet.get_chain()["id"] == custom_chain_id
    assert wallet.get_address() == custom_address