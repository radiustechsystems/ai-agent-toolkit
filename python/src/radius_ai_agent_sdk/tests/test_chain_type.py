"""
Tests for the Chain type definitions.
"""
import pytest
from typing import cast
from radius.types.chain import EvmChain, Chain


def test_evm_chain_definition():
    """Test EvmChain type definition."""
    # Create a valid EVM chain
    evm_chain: EvmChain = {
        "type": "evm",
        "id": 1
    }
    
    # Check properties
    assert evm_chain["type"] == "evm"
    assert evm_chain["id"] == 1


def test_chain_union_with_evm_chain():
    """Test using the Chain union type with EvmChain."""
    # Create a chain as EvmChain
    evm_chain: EvmChain = {
        "type": "evm",
        "id": 1
    }
    
    # Cast to Chain type (should be valid)
    chain: Chain = cast(Chain, evm_chain)
    
    # Check properties are preserved
    assert chain["type"] == "evm"
    assert chain["id"] == 1


def test_chain_direct_initialization():
    """Test creating Chain directly."""
    # Create a Chain directly with EVM data
    chain: Chain = {
        "type": "evm",
        "id": 100
    }
    
    # Check properties
    assert chain["type"] == "evm"
    assert chain["id"] == 100


def test_chain_common_chains():
    """Test creating common chain configurations."""
    # Ethereum Mainnet
    ethereum: Chain = {
        "type": "evm",
        "id": 1
    }
    assert ethereum["type"] == "evm"
    assert ethereum["id"] == 1
    
    # Goerli Testnet
    goerli: Chain = {
        "type": "evm",
        "id": 5
    }
    assert goerli["type"] == "evm"
    assert goerli["id"] == 5
    
    # Radius Testnet
    radius: Chain = {
        "type": "evm",
        "id": 1223953
    }
    assert radius["type"] == "evm"
    assert radius["id"] == 1223953