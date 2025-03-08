"""
Tests for the EVM wallet types.
"""
from typing import Dict, Any
from eth_typing import HexStr

from radius_wallets.evm.types import (
    EVMTransaction,
    EVMReadRequest,
    EVMReadResult,
    EVMTypedData,
    PaymasterOptions,
    EVMTransactionOptions,
    TypedDataDomain
)


def test_evm_transaction_type():
    """Test EVMTransaction type definition."""
    # Simple ETH transfer
    tx1: EVMTransaction = {
        "to": "0xrecipient",
        "value": 1000000000000000000,  # 1 ETH
    }
    assert tx1["to"] == "0xrecipient"
    assert tx1["value"] == 1000000000000000000
    
    # Contract call with ABI
    tx2: EVMTransaction = {
        "to": "0xcontract",
        "functionName": "transfer",
        "args": ["0xrecipient", "1000000000000000000"],
        "abi": [{"type": "function", "name": "transfer", "inputs": [{"type": "address"}, {"type": "uint256"}], "outputs": [{"type": "bool"}]}]
    }
    assert tx2["to"] == "0xcontract"
    assert tx2["functionName"] == "transfer"
    assert len(tx2["args"]) == 2
    assert len(tx2["abi"]) == 1
    
    # Transaction with data
    tx3: EVMTransaction = {
        "to": "0xcontract",
        "data": HexStr("0x095ea7b3000000000000000000000000abcdef1234567890abcdef1234567890abcdef12ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    }
    assert tx3["to"] == "0xcontract"
    assert tx3["data"].startswith("0x095ea7b3")
    
    # Transaction with options
    paymaster_options: PaymasterOptions = {
        "address": "0xpaymaster",
        "input": "0xpaymasterinput"
    }
    tx_options: EVMTransactionOptions = {
        "paymaster": paymaster_options
    }
    tx4: EVMTransaction = {
        "to": "0xrecipient",
        "value": 1000000000000000000,
        "options": tx_options
    }
    assert tx4["to"] == "0xrecipient"
    assert tx4["value"] == 1000000000000000000
    assert tx4["options"]["paymaster"]["address"] == "0xpaymaster"
    assert tx4["options"]["paymaster"]["input"] == "0xpaymasterinput"


def test_evm_read_request_type():
    """Test EVMReadRequest type definition."""
    # Simple read request
    request1: EVMReadRequest = {
        "address": "0xcontract",
        "functionName": "balanceOf",
        "args": ["0xaccount"],
        "abi": [{"type": "function", "name": "balanceOf", "inputs": [{"type": "address"}], "outputs": [{"type": "uint256"}]}]
    }
    assert request1["address"] == "0xcontract"
    assert request1["functionName"] == "balanceOf"
    assert request1["args"] == ["0xaccount"]
    assert len(request1["abi"]) == 1
    
    # Read request without args
    request2: EVMReadRequest = {
        "address": "0xcontract",
        "functionName": "totalSupply",
        "abi": [{"type": "function", "name": "totalSupply", "inputs": [], "outputs": [{"type": "uint256"}]}]
    }
    assert request2["address"] == "0xcontract"
    assert request2["functionName"] == "totalSupply"
    assert "args" not in request2
    assert len(request2["abi"]) == 1


def test_evm_read_result_type():
    """Test EVMReadResult type definition."""
    # Number result
    result1: EVMReadResult = {
        "value": 1000000000000000000
    }
    assert result1["value"] == 1000000000000000000
    
    # String result
    result2: EVMReadResult = {
        "value": "Hello, World!"
    }
    assert result2["value"] == "Hello, World!"
    
    # Complex result (tuple)
    complex_value: Dict[str, Any] = {
        "id": 1,
        "name": "Test",
        "active": True
    }
    result3: EVMReadResult = {
        "value": complex_value
    }
    assert result3["value"]["id"] == 1
    assert result3["value"]["name"] == "Test"
    assert result3["value"]["active"] is True


def test_evm_typed_data_type():
    """Test EVMTypedData type definition."""
    # Create domain data
    domain: TypedDataDomain = {
        "name": "Test Domain",
        "version": "1",
        "chainId": 1,
        "verifyingContract": "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
    }
    
    # Create types
    types = {
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
    }
    
    # Create message
    message = {
        "name": "John Doe",
        "wallet": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"
    }
    
    # Create typed data
    typed_data: EVMTypedData = {
        "domain": domain,
        "types": types,
        "primaryType": "Person",
        "message": message
    }
    
    # Verify the typed data
    assert typed_data["domain"] == domain
    assert typed_data["types"] == types
    assert typed_data["primaryType"] == "Person"
    assert typed_data["message"] == message
    
    # Test with optional fields omitted
    minimal_domain: TypedDataDomain = {
        "name": "Minimal Domain"
    }
    
    minimal_typed_data: EVMTypedData = {
        "domain": minimal_domain,
        "types": types,
        "primaryType": "Person",
        "message": message
    }
    
    assert minimal_typed_data["domain"]["name"] == "Minimal Domain"
    assert "version" not in minimal_typed_data["domain"]
    assert "chainId" not in minimal_typed_data["domain"]
    assert "verifyingContract" not in minimal_typed_data["domain"]