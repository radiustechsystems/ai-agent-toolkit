"""
Tests for the Web3EVMWalletClient implementation.
"""
import pytest
from unittest.mock import Mock, MagicMock, patch
from web3 import Web3
from web3.types import HexBytes

from radius_wallets.evm import EVMWalletClient
from radius_wallets.web3 import Web3EVMWalletClient, Web3Options
from radius_wallets.evm.types import EVMTransaction, EVMReadRequest, EVMTypedData


def test_web3_wallet_initialization(mock_web3, mock_web3_options):
    """Test the Web3EVMWalletClient initialization."""
    # Create wallet client
    wallet = Web3EVMWalletClient(mock_web3, mock_web3_options)
    
    # Verify that wallet is an instance of EVMWalletClient
    assert isinstance(wallet, EVMWalletClient)
    
    # Verify internal state
    assert wallet._web3 == mock_web3
    assert wallet._default_paymaster_address == mock_web3_options.paymaster["address"]
    assert wallet._default_paymaster_input == mock_web3_options.paymaster["input"]


def test_web3_wallet_without_options(mock_web3):
    """Test initializing Web3EVMWalletClient without options."""
    # Create wallet client without options
    wallet = Web3EVMWalletClient(mock_web3)
    
    # Verify internal state
    assert wallet._web3 == mock_web3
    assert wallet._default_paymaster_address is None
    assert wallet._default_paymaster_input is None


def test_get_address(mock_web3_wallet, mock_web3):
    """Test the get_address method."""
    address = mock_web3_wallet.get_address()
    assert address == mock_web3.eth.default_account


def test_get_address_no_account(mock_web3):
    """Test get_address method with no default account."""
    # Create a Web3 instance with no default account
    mock_web3.eth.default_account = None
    
    # Create wallet client
    wallet = Web3EVMWalletClient(mock_web3)
    
    # Get address
    address = wallet.get_address()
    
    # Verify address is empty
    assert address == ""


def test_get_chain(mock_web3_wallet, mock_web3):
    """Test the get_chain method."""
    chain = mock_web3_wallet.get_chain()
    
    # Verify chain properties
    assert chain["type"] == "evm"
    assert chain["id"] == mock_web3.eth.chain_id


def test_resolve_address_with_0x_prefix(mock_web3_wallet):
    """Test resolving an address with 0x prefix."""
    address = "0xabcdef1234567890abcdef1234567890abcdef12"
    
    # Set up Web3.is_address to return True
    with patch.object(Web3, "is_address", return_value=True):
        resolved = mock_web3_wallet.resolve_address(address)
    
    # Verify resolved address
    assert resolved.lower() == address.lower()


def test_resolve_address_ens_domain(mock_web3_wallet, mock_web3):
    """Test resolving an ENS domain."""
    domain = "test.eth"
    
    # Set up Web3.is_address to return False
    with patch.object(Web3, "is_address", return_value=False):
        resolved = mock_web3_wallet.resolve_address(domain)
    
    # Verify resolved address
    assert resolved == "0xmockedensdomain"
    
    # Verify ENS resolution was called
    mock_web3.ens.address.assert_called_once_with(domain)


def test_resolve_address_ens_resolution_failure(mock_web3_wallet, mock_web3):
    """Test error handling when ENS resolution fails."""
    domain = "invalid.eth"
    
    # Set up Web3.is_address to return False
    with patch.object(Web3, "is_address", return_value=False):
        # Set up ens.address to return None
        mock_web3.ens.address.return_value = None
        
        # Attempt to resolve address and expect an error
        with pytest.raises(ValueError) as excinfo:
            mock_web3_wallet.resolve_address(domain)
        
        # Verify error message
        assert "ENS name could not be resolved" in str(excinfo.value)


def test_sign_message(mock_web3_wallet, mock_web3):
    """Test signing a message."""
    message = "Test message to sign"
    
    # Sign the message
    signature = mock_web3_wallet.sign_message(message)
    
    # Verify signature
    assert signature["signature"] == "0xmockedsignature"
    
    # Verify sign_message was called
    mock_web3.eth.default_local_account.sign_message.assert_called_once()


def test_sign_message_no_account(mock_web3):
    """Test sign_message with no default account."""
    # Create a Web3 instance with no default account
    mock_web3.eth.default_account = None
    
    # Create wallet client
    wallet = Web3EVMWalletClient(mock_web3)
    
    # Attempt to sign message and expect an error
    with pytest.raises(ValueError) as excinfo:
        wallet.sign_message("Test message")
    
    # Verify error message
    assert "No account connected" in str(excinfo.value)


def test_sign_typed_data(mock_web3_wallet, mock_web3):
    """Test signing typed data."""
    # Create typed data
    typed_data: EVMTypedData = {
        "domain": {
            "name": "Test Domain",
            "version": "1",
            "chainId": 1,
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
    
    # Sign the typed data
    signature = mock_web3_wallet.sign_typed_data(typed_data)
    
    # Verify signature
    assert signature["signature"] == "0xmockedsignature"
    
    # Verify sign_message was called
    mock_web3.eth.default_local_account.sign_message.assert_called_once()


def test_sign_typed_data_string_chain_id(mock_web3_wallet, mock_web3):
    """Test sign_typed_data with string chain ID."""
    # Create typed data with string chain ID
    typed_data: EVMTypedData = {
        "domain": {
            "name": "Test Domain",
            "version": "1",
            "chainId": "1",  # String instead of integer
            "verifyingContract": "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
        },
        "types": {
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
    
    # Sign the typed data
    signature = mock_web3_wallet.sign_typed_data(typed_data)
    
    # Verify signature
    assert signature["signature"] == "0xmockedsignature"
    
    # Verify sign_message was called
    mock_web3.eth.default_local_account.sign_message.assert_called_once()


def test_simple_eth_transfer(mock_web3_wallet, mock_web3):
    """Test sending a simple ETH transfer."""
    # Create transaction
    transaction: EVMTransaction = {
        "to": "0xrecipient",
        "value": 1000000000000000000,  # 1 ETH
    }
    
    # Send transaction
    result = mock_web3_wallet.send_transaction(transaction)
    
    # Verify result
    assert result["hash"] == "0xmockedtxhash"
    assert result["status"] == "1"
    
    # Verify send_transaction was called with correct parameters
    mock_web3.eth.send_transaction.assert_called_once()
    call_args = mock_web3.eth.send_transaction.call_args[0][0]
    assert call_args["to"] == "0xrecipient"
    assert call_args["value"] == 1000000000000000000
    assert call_args["from"] == mock_web3.eth.default_account
    assert call_args["chainId"] == mock_web3.eth.chain_id


def test_contract_call(mock_web3_wallet, mock_web3):
    """Test sending a contract call transaction."""
    # Set up mock contract
    mock_contract = MagicMock()
    mock_web3.eth.contract.return_value = mock_contract
    
    # Set up mock contract function
    mock_function = MagicMock()
    mock_contract.functions.transfer = MagicMock(return_value=mock_function)
    mock_function.call.return_value = True
    
    # Set up mock transaction
    mock_tx = {"nonce": 0}
    mock_function.build_transaction.return_value = mock_tx
    
    # Set up mock transaction count
    mock_web3.eth.get_transaction_count.return_value = 1
    
    # Create transaction
    transaction: EVMTransaction = {
        "to": "0xcontract",
        "functionName": "transfer",
        "args": ["0xrecipient", "1000000000000000000"],
        "abi": [{"type": "function", "name": "transfer", "inputs": [{"type": "address"}, {"type": "uint256"}], "outputs": [{"type": "bool"}]}]
    }
    
    # Send transaction
    result = mock_web3_wallet.send_transaction(transaction)
    
    # Verify result
    assert result["hash"] == "0xmockedtxhash"
    assert result["status"] == "1"
    
    # Verify contract was created with correct parameters
    mock_web3.eth.contract.assert_called_once()
    contract_args = mock_web3.eth.contract.call_args[1]
    assert contract_args["address"] == "0xcontract"
    assert contract_args["abi"] == transaction["abi"]
    
    # Verify contract function was called
    mock_contract.functions.transfer.assert_called_once_with("0xrecipient", "1000000000000000000")
    
    # Verify simulation was performed
    mock_function.call.assert_called_once_with({"from": mock_web3.eth.default_account, "value": 0})
    
    # Verify transaction was built
    mock_function.build_transaction.assert_called_once()
    tx_args = mock_function.build_transaction.call_args[0][0]
    assert tx_args["from"] == mock_web3.eth.default_account
    assert tx_args["chainId"] == mock_web3.eth.chain_id
    assert tx_args["value"] == 0
    
    # Verify transaction was sent
    mock_web3.eth.send_transaction.assert_called_once()
    mock_web3.eth.wait_for_transaction_receipt.assert_called_once_with(HexBytes("0xmockedtxhash"))


def test_read(mock_web3_wallet, mock_web3):
    """Test reading from a contract."""
    # Set up mock contract
    mock_contract = MagicMock()
    mock_web3.eth.contract.return_value = mock_contract
    
    # Set up mock contract function
    mock_function = MagicMock()
    mock_contract.functions.balanceOf = MagicMock(return_value=mock_function)
    mock_function.call.return_value = 1000000000000000000
    
    # Create read request
    request: EVMReadRequest = {
        "address": "0xcontract",
        "functionName": "balanceOf",
        "args": ["0xaccount"],
        "abi": [{"type": "function", "name": "balanceOf", "inputs": [{"type": "address"}], "outputs": [{"type": "uint256"}]}]
    }
    
    # Call read
    result = mock_web3_wallet.read(request)
    
    # Verify result
    assert result["value"] == 1000000000000000000
    
    # Verify contract was created with correct parameters
    mock_web3.eth.contract.assert_called_once()
    contract_args = mock_web3.eth.contract.call_args[1]
    assert contract_args["address"] == "0xcontract"
    assert contract_args["abi"] == request["abi"]
    
    # Verify contract function was called
    mock_contract.functions.balanceOf.assert_called_once_with("0xaccount")
    mock_function.call.assert_called_once()


def test_balance_of(mock_web3_wallet, mock_web3):
    """Test getting balance information."""
    # Get balance
    balance = mock_web3_wallet.balance_of("0xsomeaddress")
    
    # Verify balance information
    assert balance["decimals"] == 18
    assert balance["symbol"] == "ETH"
    assert balance["name"] == "Ether"
    assert balance["value"] == "1.5"
    assert balance["in_base_units"] == "1500000000000000000"
    
    # Verify get_balance was called with resolved address
    mock_web3.eth.get_balance.assert_called_once()


def test_web3_factory_function(mock_web3, mock_web3_options):
    """Test the web3 factory function."""
    # Import the factory function
    from radius_wallets.web3.wallet import web3
    
    # Create wallet client
    wallet = web3(mock_web3, mock_web3_options)
    
    # Verify wallet properties
    assert isinstance(wallet, Web3EVMWalletClient)
    assert wallet._web3 == mock_web3
    assert wallet._default_paymaster_address == mock_web3_options.paymaster["address"]
    assert wallet._default_paymaster_input == mock_web3_options.paymaster["input"]