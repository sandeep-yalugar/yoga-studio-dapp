// the below script code is convention in web3 in forming the communication with Web

const contracts = {
    payment : {
        ABI : [
            {
                "inputs": [],
                "name": "deposit",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAddress",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getBalance",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address payable",
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_amount",
                        "type": "uint256"
                    }
                ],
                "name": "withdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ],
        Address : "0x47faE9616aa8A9bCE77E0D31F7927fe94fC52FF6"
    },
    appointment : {
        ABI : [
            {
                "inputs": [],
                "name": "deposit",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAddress",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getBalance",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address payable",
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_amount",
                        "type": "uint256"
                    }
                ],
                "name": "withdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ],
        Address : "0x47faE9616aa8A9bCE77E0D31F7927fe94fC52FF6"
    }
}

const connectMetamask = async () => {
    let account;
    console.log(window.ethereum);
    if(window.ethereum !== "undefined") {
        const accounts = await ethereum.request({method: "eth_requestAccounts"});
        account = accounts[0];
        document.getElementById("userArea").innerHTML = `User Account: ${account}`;
    }
    return account
}

const connectContract = async (isPayment=true) => {
    const ABI = isPayment?contracts.payment.ABI:contracts.appointment.ABI;
    const Address = isPayment?contracts.payment.Address:contracts.appointment.Address; // Taking Address from Remix 
    try{
        window.web3 = await new Web3(window.ethereum);
        window.contract = await new window.web3.eth.Contract(ABI, Address);
        return true;
    }catch(err){
        console.log(err);
        return false;
    }
}

const getContractAccount = async (isPayment=true) => {
    const connection = await connectContract(isPayment);
    if(!connection) throw Error("Error connecting to contract");
    const contract_address = await window.contract.methods.getAddress().call();
    return contract_address
}

const getContractBalance = async () => {
    const contract_balanace = await window.contract.methods.getBalance().call();
    return contract_balanace
}

const depositContract = async (account,amount,message=null,isPayment=true) => {
    let transactionHash;
    let transactionReceipt;
    await window.contract.methods.deposit().send({
            from: account,
            value: amount,
        })
        .on('transactionHash', function(hash){
            transactionHash = hash;
            console.log("Transaction Hash:", hash);
        })
        .on('receipt', function(receipt){
            transactionReceipt = receipt;
            console.log("Transaction Receipt:", receipt);

            data = {
                address : account,
                data : {
                    amount : amount,
                    transactionHash : transactionHash,
                    transactionReceipt : transactionReceipt
                }
            }
            data.data.message = message
            if(!isPayment){
                fetch("/appointment", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                    })
                    .then((response)=>{
                        return response.json();
                    })
                    .then(data => {
                        console.log("Appointment added");
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }else{
                fetch("/enroll", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                    })
                    .then((response)=>{
                        return response.json();
                    })
                    .then(data => {
                        console.log("Enrolled to the course");
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        })
        .on('confirmation', function(confirmationNumber, receipt){
        })
        .on('error', console.error);
}


const withdraw = async (address,amount) => {
    await window.contract.methods.withdraw(address, amount).send({from: account});
    return true;
}
