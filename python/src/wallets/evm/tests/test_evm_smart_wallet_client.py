"""
Tests for the EVMSmartWalletClient class.
"""
import pytest
from typing import List, cast
from unittest.mock import Mock

from radius_wallets.evm import EVMSmartWalletClient, EVMWalletClient, EVMTransaction
from radius.types.chain import EvmChain


def test_smart_wallet_client_interface(mock_evm_smart_wallet_client):
    """Test that the mock smart wallet client implements the abstract interface correctly."""
    # Verify it's both an EVMWalletClient and EVMSmartWalletClient
    assert isinstance(mock_evm_smart_wallet_client, EVMWalletClient)
    assert isinstance(mock_evm_smart_wallet_client, EVMSmartWalletClient)
    
    # Check that all abstract methods are implemented
    assert hasattr(mock_evm_smart_wallet_client, 'get_address')
    assert hasattr(mock_evm_smart_wallet_client, 'get_chain')
    assert hasattr(mock_evm_smart_wallet_client, 'send_transaction')
    assert hasattr(mock_evm_smart_wallet_client, 'read')
    assert hasattr(mock_evm_smart_wallet_client, 'resolve_address')
    assert hasattr(mock_evm_smart_wallet_client, 'sign_typed_data')
    assert hasattr(mock_evm_smart_wallet_client, 'send_batch_of_transactions')


def test_send_batch_of_transactions(mock_evm_smart_wallet_client):
    """Test sending a batch of transactions."""
    # Create a list of transactions
    transactions: List[EVMTransaction] = [
        {
            "to": "0xrecipient1",
            "value": 1000000000000000000,  # 1 ETH
        },
        {
            "to": "0xrecipient2",
            "functionName": "transfer",
            "args": ["0xrecipient3", "1000000000000000000"],
            "abi": [{"type": "function", "name": "transfer", "inputs": [{"type": "address"}, {"type": "uint256"}], "outputs": [{"type": "bool"}]}]
        }
    ]
    
    # Send the batch of transactions
    result = mock_evm_smart_wallet_client.send_batch_of_transactions(transactions)
    
    # Verify the result
    assert "hash" in result
    assert result["hash"] == f"{mock_evm_smart_wallet_client.default_tx_hash}_batch"
    assert result["status"] == "1"


def test_send_transaction_in_smart_wallet(mock_evm_smart_wallet_client):
    """Test sending a transaction with the smart wallet client."""
    # Create a transaction
    transaction: EVMTransaction = {
        "to": "0xrecipientaddress",
        "value": 1000000000000000000,  # 1 ETH
    }
    
    # Send the transaction
    result = mock_evm_smart_wallet_client.send_transaction(transaction)
    
    # Verify the result
    assert "hash" in result
    assert result["hash"] == f"{mock_evm_smart_wallet_client.default_tx_hash}_single"
    assert result["status"] == "1"


def test_smart_wallet_inheritance():
    """Test that EVMSmartWalletClient properly inherits from EVMWalletClient."""
    # Create a custom smart wallet client
    wallet = Mock(spec=EVMSmartWalletClient)
    
    # It should be an instance of both classes
    assert isinstance(wallet, EVMWalletClient)
    
    # Set up returns for both basic and extended methods
    wallet.get_chain.return_value = cast(EvmChain, {"type": "evm", "id": 1})
    wallet.send_transaction.return_value = {"hash": "0xsingle"}
    wallet.send_batch_of_transactions.return_value = {"hash": "0xbatch"}
    
    # Verify both sets of methods work
    assert wallet.get_chain()["id"] == 1
    assert wallet.send_transaction({})["hash"] == "0xsingle"
    assert wallet.send_batch_of_transactions([])["hash"] == "0xbatch"