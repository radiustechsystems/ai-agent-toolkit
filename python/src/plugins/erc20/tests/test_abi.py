from radius_plugins.erc20.abi import ERC20_ABI


class TestAbi:
    def test_erc20_abi_structure(self):
        """Test that the ERC20_ABI contains all the required functions."""
        # Check that the ABI is a list
        assert isinstance(ERC20_ABI, list)
        
        # Function names that should be in the ABI
        required_functions = [
            "transfer",
            "balanceOf",
            "totalSupply",
            "allowance",
            "approve",
            "transferFrom",
        ]
        
        # Get all function names from the ABI
        function_names = [
            item["name"] for item in ERC20_ABI if item["type"] == "function"
        ]
        
        # Check that all required functions are in the ABI
        for func_name in required_functions:
            assert func_name in function_names, f"Missing '{func_name}' function in ERC20_ABI"
    
    def test_transfer_function(self):
        """Test the structure of the transfer function in the ABI."""
        transfer_func = next(
            (item for item in ERC20_ABI if item["type"] == "function" and item["name"] == "transfer"), 
            None
        )
        
        assert transfer_func is not None
        assert len(transfer_func["inputs"]) == 2
        assert transfer_func["inputs"][0]["name"] == "to"
        assert transfer_func["inputs"][0]["type"] == "address"
        assert transfer_func["inputs"][1]["name"] == "amount"
        assert transfer_func["inputs"][1]["type"] == "uint256"
        assert len(transfer_func["outputs"]) == 1
        assert transfer_func["outputs"][0]["type"] == "bool"
        assert transfer_func["stateMutability"] == "nonpayable"
    
    def test_balance_of_function(self):
        """Test the structure of the balanceOf function in the ABI."""
        balance_of_func = next(
            (item for item in ERC20_ABI if item["type"] == "function" and item["name"] == "balanceOf"),
            None
        )
        
        assert balance_of_func is not None
        assert len(balance_of_func["inputs"]) == 1
        assert balance_of_func["inputs"][0]["name"] == "account"
        assert balance_of_func["inputs"][0]["type"] == "address"
        assert len(balance_of_func["outputs"]) == 1
        assert balance_of_func["outputs"][0]["type"] == "uint256"
        assert balance_of_func["stateMutability"] == "view"
    
    def test_total_supply_function(self):
        """Test the structure of the totalSupply function in the ABI."""
        total_supply_func = next(
            (item for item in ERC20_ABI if item["type"] == "function" and item["name"] == "totalSupply"),
            None
        )
        
        assert total_supply_func is not None
        assert len(total_supply_func["inputs"]) == 0
        assert len(total_supply_func["outputs"]) == 1
        assert total_supply_func["outputs"][0]["type"] == "uint256"
        assert total_supply_func["stateMutability"] == "view"
    
    def test_allowance_function(self):
        """Test the structure of the allowance function in the ABI."""
        allowance_func = next(
            (item for item in ERC20_ABI if item["type"] == "function" and item["name"] == "allowance"),
            None
        )
        
        assert allowance_func is not None
        assert len(allowance_func["inputs"]) == 2
        assert allowance_func["inputs"][0]["name"] == "owner"
        assert allowance_func["inputs"][0]["type"] == "address"
        assert allowance_func["inputs"][1]["name"] == "spender"
        assert allowance_func["inputs"][1]["type"] == "address"
        assert len(allowance_func["outputs"]) == 1
        assert allowance_func["outputs"][0]["type"] == "uint256"
        assert allowance_func["stateMutability"] == "view"
    
    def test_approve_function(self):
        """Test the structure of the approve function in the ABI."""
        approve_func = next(
            (item for item in ERC20_ABI if item["type"] == "function" and item["name"] == "approve"),
            None
        )
        
        assert approve_func is not None
        assert len(approve_func["inputs"]) == 2
        assert approve_func["inputs"][0]["name"] == "spender"
        assert approve_func["inputs"][0]["type"] == "address"
        assert approve_func["inputs"][1]["name"] == "amount"
        assert approve_func["inputs"][1]["type"] == "uint256"
        assert len(approve_func["outputs"]) == 1
        assert approve_func["outputs"][0]["type"] == "bool"
        assert approve_func["stateMutability"] == "nonpayable"
    
    def test_transfer_from_function(self):
        """Test the structure of the transferFrom function in the ABI."""
        transfer_from_func = next(
            (item for item in ERC20_ABI if item["type"] == "function" and item["name"] == "transferFrom"),
            None
        )
        
        assert transfer_from_func is not None
        assert len(transfer_from_func["inputs"]) == 3
        assert transfer_from_func["inputs"][0]["name"] == "from"
        assert transfer_from_func["inputs"][0]["type"] == "address"
        assert transfer_from_func["inputs"][1]["name"] == "to"
        assert transfer_from_func["inputs"][1]["type"] == "address"
        assert transfer_from_func["inputs"][2]["name"] == "amount"
        assert transfer_from_func["inputs"][2]["type"] == "uint256"
        assert len(transfer_from_func["outputs"]) == 1
        assert transfer_from_func["outputs"][0]["type"] == "bool"
        assert transfer_from_func["stateMutability"] == "nonpayable"