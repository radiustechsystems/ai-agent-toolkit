"""
Pytest configuration for the EVM wallet tests.
"""
import pytest
from typing import Dict, Any, List, cast

from radius.types.chain import EvmChain
from radius_wallets.evm import EVMWalletClient, EVMSmartWalletClient
from radius_wallets.evm.types import EVMTransaction, EVMReadRequest, EVMReadResult, EVMTypedData


class MockEVMWalletClient(EVMWalletClient):
    """Mock EVM wallet client for testing."""
    
    def __init__(self, chain_id=1223953, address="0xmockedwalletaddress"):
        self.address = address
        self._chain = {"type": "evm", "id": chain_id}
        self.default_tx_hash = "0xmockedtransactionhash"
        self.default_signature = "0xmockedsignature"
        
    def get_address(self) -> str:
        return self.address
    
    def get_chain(self) -> EvmChain:
        return cast(EvmChain, self._chain)
    
    def sign_message(self, message: str) -> Dict[str, str]:
        return {"signature": f"{self.default_signature}_{message[:10]}"}
    
    def send_transaction(self, transaction: EVMTransaction) -> Dict[str, str]:
        return {"hash": self.default_tx_hash, "status": "1"}
    
    def read(self, request: EVMReadRequest) -> EVMReadResult:
        return {"value": "mockedReadValue"}
    
    def resolve_address(self, address: str) -> str:
        if address.startswith("0x"):
            return address
        return f"0x{address}"
    
    def sign_typed_data(self, data: EVMTypedData) -> Dict[str, str]:
        return {"signature": self.default_signature}
    
    def balance_of(self, address: str) -> Dict[str, Any]:
        return {
            "decimals": 18,
            "symbol": "ETH",
            "name": "Ethereum",
            "value": "1.5",
            "in_base_units": "1500000000000000000"
        }


class MockEVMSmartWalletClient(EVMSmartWalletClient):
    """Mock EVM smart wallet client for testing."""
    
    def __init__(self, chain_id=1223953, address="0xmockedsmartwalletaddress"):
        self.address = address
        self._chain = {"type": "evm", "id": chain_id}
        self.default_tx_hash = "0xmockedtransactionhash"
        self.default_signature = "0xmockedsignature"
        
    def get_address(self) -> str:
        return self.address
    
    def get_chain(self) -> EvmChain:
        return cast(EvmChain, self._chain)
    
    def sign_message(self, message: str) -> Dict[str, str]:
        return {"signature": f"{self.default_signature}_{message[:10]}"}
    
    def send_transaction(self, transaction: EVMTransaction) -> Dict[str, str]:
        return {"hash": f"{self.default_tx_hash}_single", "status": "1"}
    
    def read(self, request: EVMReadRequest) -> EVMReadResult:
        return {"value": "mockedReadValue"}
    
    def resolve_address(self, address: str) -> str:
        if address.startswith("0x"):
            return address
        return f"0x{address}"
    
    def sign_typed_data(self, data: EVMTypedData) -> Dict[str, str]:
        return {"signature": self.default_signature}
    
    def balance_of(self, address: str) -> Dict[str, Any]:
        return {
            "decimals": 18,
            "symbol": "ETH",
            "name": "Ethereum",
            "value": "1.5",
            "in_base_units": "1500000000000000000"
        }
    
    def send_batch_of_transactions(self, transactions: List[EVMTransaction]) -> Dict[str, str]:
        return {"hash": f"{self.default_tx_hash}_batch", "status": "1"}


@pytest.fixture
def mock_evm_wallet_client():
    """Fixture that provides a mock EVM wallet client for testing."""
    return MockEVMWalletClient()


@pytest.fixture
def mock_evm_smart_wallet_client():
    """Fixture that provides a mock EVM smart wallet client for testing."""
    return MockEVMSmartWalletClient()