"""
Pytest configuration for the Web3 wallet tests.
"""
import pytest
from unittest.mock import MagicMock
from web3 import Web3
from web3.types import HexBytes, Wei

from radius_wallets.web3 import Web3Options, Web3EVMWalletClient


@pytest.fixture
def mock_web3():
    """Fixture that provides a mock Web3 instance for testing."""
    # Create mock Web3 instance
    w3 = MagicMock(spec=Web3)
    
    # Set up eth attribute with necessary mocks
    w3.eth = MagicMock()
    w3.eth.chain_id = 1
    w3.eth.default_account = "0xmockeddefaultaccount"
    w3.eth.default_local_account = MagicMock()
    w3.eth.default_local_account.sign_message.return_value = MagicMock(signature=b"0xmockedsignature")
    
    # Mock the get_balance method
    w3.eth.get_balance = lambda address: Wei(1500000000000000000)  # 1.5 ETH
    
    # Mock the to_hex method
    w3.to_hex = lambda data: "0xmockedsignature"
    
    # Mock send_transaction and wait_for_transaction_receipt
    w3.eth.send_transaction = MagicMock(return_value=HexBytes("0xmockedtxhash"))
    w3.eth.wait_for_transaction_receipt = MagicMock(return_value={
        "transactionHash": HexBytes("0xmockedtxhash"),
        "status": 1
    })
    
    # Mock contract functionality
    w3.eth.contract = MagicMock()
    
    # Mock ENS
    w3.ens = MagicMock()
    w3.ens.address = MagicMock(return_value="0xmockedensdomain")
    
    return w3


@pytest.fixture
def mock_web3_options():
    """Fixture that provides mock Web3Options for testing."""
    return Web3Options(
        paymaster={
            "address": "0xmockedpaymasteraddress",
            "input": "0xmockedpaymasterinput"
        }
    )


@pytest.fixture
def mock_web3_wallet(mock_web3, mock_web3_options):
    """Fixture that provides a mock Web3EVMWalletClient for testing."""
    return Web3EVMWalletClient(mock_web3, mock_web3_options)