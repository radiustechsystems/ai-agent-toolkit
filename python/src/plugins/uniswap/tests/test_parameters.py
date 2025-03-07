import pytest
from pydantic import ValidationError
from radius_plugins.uniswap.parameters import (
    SwapType,
    Protocol,
    Routing,
    CheckApprovalParameters,
    GetQuoteParameters
)


class TestParameters:
    """Test suite for Uniswap parameters validation."""

    def test_swap_type_enum(self):
        """Test the SwapType enum values."""
        assert SwapType.EXACT_INPUT == "EXACT_INPUT"
        assert SwapType.EXACT_OUTPUT == "EXACT_OUTPUT"
        
        # Test validation with enum
        assert SwapType("EXACT_INPUT") == SwapType.EXACT_INPUT
        assert SwapType("EXACT_OUTPUT") == SwapType.EXACT_OUTPUT
        
        # Test invalid enum value
        with pytest.raises(ValueError):
            SwapType("INVALID_VALUE")

    def test_protocol_enum(self):
        """Test the Protocol enum values."""
        assert Protocol.V2 == "V2"
        assert Protocol.V3 == "V3"
        
        # Test validation with enum
        assert Protocol("V2") == Protocol.V2
        assert Protocol("V3") == Protocol.V3
        
        # Test invalid enum value
        with pytest.raises(ValueError):
            Protocol("V4")

    def test_routing_enum(self):
        """Test the Routing enum values."""
        assert Routing.CLASSIC == "CLASSIC"
        assert Routing.UNISWAPX == "UNISWAPX"
        assert Routing.UNISWAPX_V2 == "UNISWAPX_V2"
        assert Routing.V3_ONLY == "V3_ONLY"
        assert Routing.V2_ONLY == "V2_ONLY"
        assert Routing.BEST_PRICE == "BEST_PRICE"
        assert Routing.BEST_PRICE_V2 == "BEST_PRICE_V2"
        assert Routing.FASTEST == "FASTEST"
        
        # Test validation with enum
        assert Routing("CLASSIC") == Routing.CLASSIC
        assert Routing("UNISWAPX") == Routing.UNISWAPX
        
        # Test invalid enum value
        with pytest.raises(ValueError):
            Routing("INVALID_ROUTING")

    def test_check_approval_parameters(self):
        """Test CheckApprovalParameters validation."""
        # Valid parameters
        params = CheckApprovalParameters(
            token="0x1234567890123456789012345678901234567890",
            amount="1000000000000000000",
            walletAddress="0xabcdef1234567890abcdef1234567890abcdef12"
        )
        
        assert params.token == "0x1234567890123456789012345678901234567890"
        assert params.amount == "1000000000000000000"
        assert params.walletAddress == "0xabcdef1234567890abcdef1234567890abcdef12"
        
        # Missing required fields
        with pytest.raises(ValidationError):
            CheckApprovalParameters(
                amount="1000000000000000000",
                walletAddress="0xabcdef1234567890abcdef1234567890abcdef12"
            )
        
        with pytest.raises(ValidationError):
            CheckApprovalParameters(
                token="0x1234567890123456789012345678901234567890",
                walletAddress="0xabcdef1234567890abcdef1234567890abcdef12"
            )
        
        with pytest.raises(ValidationError):
            CheckApprovalParameters(
                token="0x1234567890123456789012345678901234567890",
                amount="1000000000000000000"
            )

    def test_get_quote_parameters(self):
        """Test GetQuoteParameters validation."""
        # Valid parameters with minimum required fields
        params = GetQuoteParameters(
            tokenIn="0x1234567890123456789012345678901234567890",
            tokenOut="0xabcdef1234567890abcdef1234567890abcdef12",
            amount="1000000000000000000",
            protocols=[Protocol.V3]
        )
        
        assert params.tokenIn == "0x1234567890123456789012345678901234567890"
        assert params.tokenOut == "0xabcdef1234567890abcdef1234567890abcdef12"
        assert params.amount == "1000000000000000000"
        assert params.protocols == [Protocol.V3]
        assert params.type == SwapType.EXACT_INPUT  # Default value
        assert params.routingPreference == Routing.CLASSIC  # Default value
        assert params.tokenOutChainId is None  # Optional field
        
        # Full parameters with all fields
        params = GetQuoteParameters(
            tokenIn="0x1234567890123456789012345678901234567890",
            tokenOut="0xabcdef1234567890abcdef1234567890abcdef12",
            tokenOutChainId=1,
            amount="1000000000000000000",
            type=SwapType.EXACT_OUTPUT,
            protocols=[Protocol.V2, Protocol.V3],
            routingPreference=Routing.BEST_PRICE
        )
        
        assert params.tokenIn == "0x1234567890123456789012345678901234567890"
        assert params.tokenOut == "0xabcdef1234567890abcdef1234567890abcdef12"
        assert params.tokenOutChainId == 1
        assert params.amount == "1000000000000000000"
        assert params.type == SwapType.EXACT_OUTPUT
        assert params.protocols == [Protocol.V2, Protocol.V3]
        assert params.routingPreference == Routing.BEST_PRICE
        
        # Missing required fields
        with pytest.raises(ValidationError):
            GetQuoteParameters(
                tokenOut="0xabcdef1234567890abcdef1234567890abcdef12",
                amount="1000000000000000000",
                protocols=[Protocol.V3]
            )
        
        with pytest.raises(ValidationError):
            GetQuoteParameters(
                tokenIn="0x1234567890123456789012345678901234567890",
                amount="1000000000000000000",
                protocols=[Protocol.V3]
            )
        
        with pytest.raises(ValidationError):
            GetQuoteParameters(
                tokenIn="0x1234567890123456789012345678901234567890",
                tokenOut="0xabcdef1234567890abcdef1234567890abcdef12",
                protocols=[Protocol.V3]
            )
        
        with pytest.raises(ValidationError):
            GetQuoteParameters(
                tokenIn="0x1234567890123456789012345678901234567890",
                tokenOut="0xabcdef1234567890abcdef1234567890abcdef12",
                amount="1000000000000000000"
            )