"""
Tests for utility functions in the Radius AI Agent SDK.
"""
from radius.utils.snake_case import snake_case


def test_snake_case_conversion():
    """Test the snake_case conversion utility."""
    # Test camelCase to snake_case
    assert snake_case("camelCase") == "camel_case"
    assert snake_case("anotherCamelCase") == "another_camel_case"
    
    # Test PascalCase to snake_case
    assert snake_case("PascalCase") == "pascal_case"
    
    # Test already_snake_case (should remain unchanged)
    assert snake_case("already_snake_case") == "already_snake_case"
    
    # Test mixed cases
    assert snake_case("mixedCASE") == "mixed_case"
    
    # Test single word
    assert snake_case("word") == "word"
    
    # Test empty string
    assert snake_case("") == ""
    
    # Test with numbers
    assert snake_case("item1Price") == "item1_price"
    
    # Test with multiple consecutive uppercase letters
    assert snake_case("getHTTPResponse") == "get_http_response"
    
    # Test with special characters (should remain unchanged)
    assert snake_case("special_case-with-hyphens") == "special_case-with-hyphens"