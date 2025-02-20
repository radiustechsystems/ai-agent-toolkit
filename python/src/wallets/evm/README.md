# EVM Wallet for Radius AI Agent SDK

A Python implementation of an EVM wallet for the Radius AI Agent SDK, providing secure key management and transaction signing capabilities for the Radius network.

## Installation

```bash
poetry add radius-ai-agent-sdk-wallet-evm
```

## Usage

```python
from radius_wallets.evm import evm_wallet

# Initialize wallet with private key
wallet = evm_wallet(
    private_key="${WALLET_PRIVATE_KEY}",  # Your EVM wallet private key
    rpc_url="${RPC_PROVIDER_URL}"  # Your Radius RPC endpoint
)

# Get wallet address
address = wallet.get_address()

# Get ETH balance
balance = await wallet.get_balance()

# Sign and send transaction
tx_hash = await wallet.sign_and_send_transaction({
    "to": "recipient_address",
    "value": "1000000000000000000",  # 1 ETH in wei
    "data": "0x",  # Optional contract data
})

# Get transaction receipt
receipt = await wallet.get_transaction_receipt(tx_hash)
```

## Features

- Secure Key Management:
  - Private key support
  - Public address derivation
  - Message signing
  
- Transaction Operations:
  - Transaction signing
  - Transaction sending
  - Gas estimation
  - Receipt tracking
  
- Balance Management:
  - Native token balance
  - ERC20 token balance
  - Contract interactions
  
- Network Support:
  - Radius

## License

This project is licensed under the terms of the MIT license.
