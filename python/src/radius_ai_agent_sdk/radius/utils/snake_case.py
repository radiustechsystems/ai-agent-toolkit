import re

def snake_case(string: str) -> str:
    """
    Convert a string from camelCase or PascalCase to snake_case.
    Handles special cases including:
    - Numbers: 'item1Price' becomes 'item1_price'
    - Acronyms: 'getHTTPResponse' becomes 'get_http_response'
    """
    # Handle acronyms by inserting an underscore before runs of uppercase letters
    # that are followed by a lowercase letter
    s1 = re.sub(r'([A-Z])([A-Z][a-z])', r'\1_\2', string)
    
    # Insert an underscore before any uppercase letter that follows a lowercase letter or number
    s2 = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', s1)
    
    return s2.lower()
