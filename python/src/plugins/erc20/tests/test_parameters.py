import pytest
from pydantic import ValidationError
from radius_plugins.erc20.parameters import (
    GetTokenInfoBySymbolParameters,
    GetTokenBalanceParameters,
    TransferParameters,
    GetTokenTotalSupplyParameters,
    GetTokenAllowanceParameters,
    ApproveParameters,
    TransferFromParameters,
    ConvertToBaseUnitParameters,
    ConvertFromBaseUnitParameters,
)


class TestParameters:
    def test_get_token_info_by_symbol_parameters(self):
        """Test GetTokenInfoBySymbolParameters validation."""
        # Valid parameters
        params = GetTokenInfoBySymbolParameters(symbol="TEST")
        assert params.symbol == "TEST"
        
        # Missing required field
        with pytest.raises(ValidationError):
            GetTokenInfoBySymbolParameters()
    
    def test_get_token_balance_parameters(self):
        """Test GetTokenBalanceParameters validation."""
        # Valid parameters
        params = GetTokenBalanceParameters(
            wallet="0x1234567890123456789012345678901234567890",
            tokenAddress="0xabcdef1234567890abcdef1234567890abcdef12",
        )
        assert params.wallet == "0x1234567890123456789012345678901234567890"
        assert params.tokenAddress == "0xabcdef1234567890abcdef1234567890abcdef12"
        
        # Missing required fields
        with pytest.raises(ValidationError):
            GetTokenBalanceParameters(wallet="0x1234567890123456789012345678901234567890")
        
        with pytest.raises(ValidationError):
            GetTokenBalanceParameters(tokenAddress="0xabcdef1234567890abcdef1234567890abcdef12")
    
    def test_transfer_parameters(self):
        """Test TransferParameters validation."""
        # Valid parameters
        params = TransferParameters(
            tokenAddress="0x1234567890123456789012345678901234567890",
            to="0xabcdef1234567890abcdef1234567890abcdef12",
            amount="1000000000000000000",
        )
        assert params.tokenAddress == "0x1234567890123456789012345678901234567890"
        assert params.to == "0xabcdef1234567890abcdef1234567890abcdef12"
        assert params.amount == "1000000000000000000"
        
        # Missing required fields
        with pytest.raises(ValidationError):
            TransferParameters(
                to="0xabcdef1234567890abcdef1234567890abcdef12",
                amount="1000000000000000000",
            )
        
        with pytest.raises(ValidationError):
            TransferParameters(
                tokenAddress="0x1234567890123456789012345678901234567890",
                amount="1000000000000000000",
            )
        
        with pytest.raises(ValidationError):
            TransferParameters(
                tokenAddress="0x1234567890123456789012345678901234567890",
                to="0xabcdef1234567890abcdef1234567890abcdef12",
            )
    
    def test_get_token_total_supply_parameters(self):
        """Test GetTokenTotalSupplyParameters validation."""
        # Valid parameters
        params = GetTokenTotalSupplyParameters(
            tokenAddress="0x1234567890123456789012345678901234567890",
        )
        assert params.tokenAddress == "0x1234567890123456789012345678901234567890"
        
        # Missing required field
        with pytest.raises(ValidationError):
            GetTokenTotalSupplyParameters()
    
    def test_get_token_allowance_parameters(self):
        """Test GetTokenAllowanceParameters validation."""
        # Valid parameters
        params = GetTokenAllowanceParameters(
            tokenAddress="0x1234567890123456789012345678901234567890",
            owner="0xabcdef1234567890abcdef1234567890abcdef12",
            spender="0x9876543210abcdef9876543210abcdef98765432",
        )
        assert params.tokenAddress == "0x1234567890123456789012345678901234567890"
        assert params.owner == "0xabcdef1234567890abcdef1234567890abcdef12"
        assert params.spender == "0x9876543210abcdef9876543210abcdef98765432"
        
        # Missing required fields
        with pytest.raises(ValidationError):
            GetTokenAllowanceParameters(
                owner="0xabcdef1234567890abcdef1234567890abcdef12",
                spender="0x9876543210abcdef9876543210abcdef98765432",
            )
        
        with pytest.raises(ValidationError):
            GetTokenAllowanceParameters(
                tokenAddress="0x1234567890123456789012345678901234567890",
                spender="0x9876543210abcdef9876543210abcdef98765432",
            )
        
        with pytest.raises(ValidationError):
            GetTokenAllowanceParameters(
                tokenAddress="0x1234567890123456789012345678901234567890",
                owner="0xabcdef1234567890abcdef1234567890abcdef12",
            )
    
    def test_approve_parameters(self):
        """Test ApproveParameters validation."""
        # Valid parameters
        params = ApproveParameters(
            tokenAddress="0x1234567890123456789012345678901234567890",
            spender="0xabcdef1234567890abcdef1234567890abcdef12",
            amount="1000000000000000000",
        )
        assert params.tokenAddress == "0x1234567890123456789012345678901234567890"
        assert params.spender == "0xabcdef1234567890abcdef1234567890abcdef12"
        assert params.amount == "1000000000000000000"
        
        # Missing required fields
        with pytest.raises(ValidationError):
            ApproveParameters(
                spender="0xabcdef1234567890abcdef1234567890abcdef12",
                amount="1000000000000000000",
            )
        
        with pytest.raises(ValidationError):
            ApproveParameters(
                tokenAddress="0x1234567890123456789012345678901234567890",
                amount="1000000000000000000",
            )
        
        with pytest.raises(ValidationError):
            ApproveParameters(
                tokenAddress="0x1234567890123456789012345678901234567890",
                spender="0xabcdef1234567890abcdef1234567890abcdef12",
            )
    
    def test_transfer_from_parameters(self):
        """Test TransferFromParameters validation."""
        # Valid parameters
        params = TransferFromParameters(
            tokenAddress="0x1234567890123456789012345678901234567890",
            **{"from": "0xabcdef1234567890abcdef1234567890abcdef12"},
            to="0x9876543210abcdef9876543210abcdef98765432",
            amount="1000000000000000000",
        )
        assert params.tokenAddress == "0x1234567890123456789012345678901234567890"
        assert params.from_ == "0xabcdef1234567890abcdef1234567890abcdef12"
        assert params.to == "0x9876543210abcdef9876543210abcdef98765432"
        assert params.amount == "1000000000000000000"
        
        # Test that the alias 'from' works
        params = TransferFromParameters(
            tokenAddress="0x1234567890123456789012345678901234567890",
            **{"from": "0xabcdef1234567890abcdef1234567890abcdef12"},
            to="0x9876543210abcdef9876543210abcdef98765432",
            amount="1000000000000000000",
        )
        assert params.from_ == "0xabcdef1234567890abcdef1234567890abcdef12"
        
        # Missing required fields
        with pytest.raises(ValidationError):
            TransferFromParameters(
                from_="0xabcdef1234567890abcdef1234567890abcdef12",
                to="0x9876543210abcdef9876543210abcdef98765432",
                amount="1000000000000000000",
            )
        
        with pytest.raises(ValidationError):
            TransferFromParameters(
                tokenAddress="0x1234567890123456789012345678901234567890",
                to="0x9876543210abcdef9876543210abcdef98765432",
                amount="1000000000000000000",
            )
    
    def test_convert_to_base_unit_parameters(self):
        """Test ConvertToBaseUnitParameters validation."""
        # Valid parameters
        params = ConvertToBaseUnitParameters(
            amount=1.5,
            decimals=18,
        )
        assert params.amount == 1.5
        assert params.decimals == 18
        
        # Missing required fields
        with pytest.raises(ValidationError):
            ConvertToBaseUnitParameters(amount=1.5)
        
        with pytest.raises(ValidationError):
            ConvertToBaseUnitParameters(decimals=18)
    
    def test_convert_from_base_unit_parameters(self):
        """Test ConvertFromBaseUnitParameters validation."""
        # Valid parameters
        params = ConvertFromBaseUnitParameters(
            amount=1500000000000000000,
            decimals=18,
        )
        assert params.amount == 1500000000000000000
        assert params.decimals == 18
        
        # Missing required fields
        with pytest.raises(ValidationError):
            ConvertFromBaseUnitParameters(amount=1500000000000000000)
        
        with pytest.raises(ValidationError):
            ConvertFromBaseUnitParameters(decimals=18)