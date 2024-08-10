import web3
import json
import os

ETH_WALLET_PRIVATE_KEY = os.environ["ETH_WALLET_PRIVATE_KEY"]
INFURA_API_KEY = os.environ["INFURA_API_KEY"]
SOLIDITY_FILE_NAME = os.environ["SOLIDITY_FILE_NAME"]

def deploy_contract():
    # Connect to Ethereum node
    w3 = web3.Web3(web3.Web3.HTTPProvider('https://sepolia.infura.io/v3/'+INFURA_API_KEY))

    # assert True is w3.is_connected()
    # Load the contract bytecode and ABI from files
    with open(f"remix/{SOLIDITY_FILE_NAME}.bin", "r") as f:
        bytecode = f.readlines()[-1][:-1]
    with open(f"remix/{SOLIDITY_FILE_NAME}.abi", "r") as f:
        abi = f.readlines()[-1][:-1]

    # Deploy the contract
    account = w3.eth.account.from_key(ETH_WALLET_PRIVATE_KEY)
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    tx_data = contract.constructor().build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 1728712,
        'gasPrice': w3.to_wei('21', 'gwei')
    })

    signed_tx = w3.eth.account.sign_transaction(tx_data, ETH_WALLET_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    contract_address = tx_receipt.get("contractAddress")

    print(f"Contract deployed at address: {contract_address}")

    contract_details = {
        "abi" : abi,
        "bin" : bytecode,
        "address" : tx_receipt.contractAddress
    }
    with open(f'remix/{SOLIDITY_FILE_NAME}.json', 'w') as details:
        json.dump(contract_details, details, indent=4)

deploy_contract()