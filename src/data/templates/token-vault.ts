import { ContractTemplate } from '@/types/contract-templates'

// Complete TokenVault ABI from TokenVault.json
const TOKEN_VAULT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_tokenName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_tokenSymbol",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_stakeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_rewardToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_rewardPerSecond",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_rewardStartTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_rewardEndTimestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "DuplicatePool",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "HigherMultiplier",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidMultiplier",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidPid",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRewardTokenDecimal",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidStake",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTimestamp",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "LengthMismatch",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "LongerPeriod",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NonTransferable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TooEarly",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VaultHasStarted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroAddress",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "multiplier",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "lockPeriod",
        "type": "uint256"
      }
    ],
    "name": "AddPool",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pid",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "stakeId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "weightedAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "unlockTimestamp",
        "type": "uint256"
      }
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "stakeId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "newPid",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newWeightedAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newUnlockTimestamp",
        "type": "uint256"
      }
    ],
    "name": "Upgrade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "stakeId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "weightedAmount",
        "type": "uint256"
      }
    ],
    "name": "Withdraw",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "PRECISION",
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
    "inputs": [],
    "name": "accTokenPerShare",
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
        "internalType": "uint256",
        "name": "_multiplier",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_lockPeriod",
        "type": "uint256"
      }
    ],
    "name": "add",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "activePoolMap",
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
        "internalType": "uint256[]",
        "name": "_stakeIds",
        "type": "uint256[]"
      }
    ],
    "name": "batchWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "_stakeIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_newPids",
        "type": "uint256[]"
      }
    ],
    "name": "batchUpgrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_pid",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "poolId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "weightedAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "stakeTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "unlockTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct TokenVault.Stake[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_stakeId",
        "type": "uint256"
      }
    ],
    "name": "getUserStake",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "poolId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "weightedAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "stakeTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "unlockTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct TokenVault.Stake",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastRewardTimeStamp",
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
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "pendingReward",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "poolInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "multiplier",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lockPeriod",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolLength",
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
    "inputs": [],
    "name": "rewardEndTimestamp",
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
    "inputs": [],
    "name": "rewardPerSecond",
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
    "inputs": [],
    "name": "rewardStartTimestamp",
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
    "inputs": [],
    "name": "rewardToken",
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_pid",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_multiplier",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_lockPeriod",
        "type": "uint256"
      }
    ],
    "name": "set",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_rewardEndTimestamp",
        "type": "uint256"
      }
    ],
    "name": "setRewardEndTimestamp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_rewardPerSecond",
        "type": "uint256"
      }
    ],
    "name": "setRewardPerSecond",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_rewardStartTimestamp",
        "type": "uint256"
      }
    ],
    "name": "setRewardStartTimestamp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stakeToken",
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
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_stakeId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_newPid",
        "type": "uint256"
      }
    ],
    "name": "upgrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalWeightedAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rewardDebt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalClaimed",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_stakeId",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

// TokenVault Contract Bytecode (from TokenVault_creation_bytecode.txt)
const TOKEN_VAULT_BYTECODE = "0x60e06040523480156200001157600080fd5b506040516200313a3803806200313a8339810160408190526200003491620002fd565b8686600362000044838262000441565b50600462000053828262000441565b50506001600555506006805460ff191690556200007033620001c2565b6001600160a01b03851615806200008e57506001600160a01b038416155b15620000ad5760405163d92e233d60e01b815260040160405180910390fd5b808210620000ce5760405163b7d0949760e01b815260040160405180910390fd5b6001600160a01b0380861660c052841660a081905260078490556009839055600a8290556040805163313ce56760e01b815290516000929163313ce5679160048083019260209291908290030181865afa15801562000131573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200015791906200050d565b60ff169050602481106200017e57604051635fd5a78560e11b815260040160405180910390fd5b6200018b8160246200054f565b6200019890600a62000668565b6080526009544211620001ae57600954620001b0565b425b600b5550620006769650505050505050565b600680546001600160a01b03838116610100818102610100600160a81b031985161790945560405193909204169182907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200024457600080fd5b81516001600160401b03808211156200026157620002616200021c565b604051601f8301601f19908116603f011681019082821181831017156200028c576200028c6200021c565b8160405283815260209250866020858801011115620002aa57600080fd5b600091505b83821015620002ce5785820183015181830184015290820190620002af565b6000602085830101528094505050505092915050565b6001600160a01b0381168114620002fa57600080fd5b50565b600080600080600080600060e0888a0312156200031957600080fd5b87516001600160401b03808211156200033157600080fd5b6200033f8b838c0162000232565b985060208a01519150808211156200035657600080fd5b50620003658a828b0162000232565b96505060408801516200037881620002e4565b60608901519095506200038b81620002e4565b809450506080880151925060a0880151915060c0880151905092959891949750929550565b600181811c90821680620003c557607f821691505b602082108103620003e657634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200043c576000816000526020600020601f850160051c81016020861015620004175750805b601f850160051c820191505b81811015620004385782815560010162000423565b5050505b505050565b81516001600160401b038111156200045d576200045d6200021c565b62000475816200046e8454620003b0565b84620003ec565b602080601f831160018114620004ad5760008415620004945750858301515b600019600386901b1c1916600185901b17855562000438565b600085815260208120601f198616915b82811015620004de57888601518255948401946001909101908401620004bd565b5085821015620004fd5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6000602082840312156200052057600080fd5b815160ff811681146200053257600080fd5b9392505050565b634e487b7160e01b600052601160045260246000fd5b8181038181111562000565576200056562000539565b92915050565b600181815b80851115620005ac57816000190482111562000590576200059062000539565b808516156200059e57918102915b93841c939080029062000570565b509250929050565b600082620005c55750600162000565565b81620005d45750600062000565565b8160018114620005ed5760028114620005f85762000618565b600191505062000565565b60ff8411156200060c576200060c62000539565b50506001821b62000565565b5060208310610133831016604e8410600b84101617156200063d575081810a62000565565b6200064983836200056b565b806000190482111562000660576200066062000539565b029392505050565b6000620005328383620005b4565b60805160a05160c051612a3262000708600039600081816103da0152818161091601526116bd0152600081816105d20152818161087501528181610d7c015261155601526000818161052c015281816108010152818161094e01528181610d0801528181610e69015281816114e2015281816117510152818161193f015281816119840152611e7b0152612a326000f3fe608060405234801561001057600080fd5b506004361061025e5760003560e01c806372e5539911610146578063a9059cbb116100c3578063f2fde38b11610087578063f2fde38b14610594578063f40f0f52146105a7578063f577988e146105ba578063f7c618c1146105cd578063f9586e3f146105f4578063fcb685bc1461061f57600080fd5b8063a9059cbb14610514578063aaf5eb6814610527578063cec695fa1461054e578063dd62ed3e1461056e578063e2bbb1581461058157600080fd5b80638da5cb5b1161010a5780638da5cb5b146104d15780638f10369a146104e75780638f662915146104f057806395d89b41146104f9578063a457c2d71461050157600080fd5b806372e5539914610487578063771602f71461049a578063823c27ff146104ad5780638456cb59146104c05780638bc1d8c0146104c857600080fd5b806339509351116101df57806351ed6a30116101a357806351ed6a30146103d55780635c975abb146104145780636386c1c71461041f57806366da58151461044357806370a0823114610456578063715018a61461047f57600080fd5b806339509351146103815780633c011b5f146103945780633f4ba83a146103a757806343b0e8df146103af578063451450ec146103c257600080fd5b80631959a002116102265780631959a002146102ec57806323b872dd146103415780632e1a7d4d14610354578063313ce56714610369578063356c72841461037857600080fd5b806306fdde0314610263578063081e3eda14610281578063095ea7b3146102935780631526fe27146102b657806318160ddd146102e4575b600080fd5b61026b610628565b60405161027891906125aa565b60405180910390f35b600e545b604051908152602001610278565b6102a66102a13660046125f9565b6106ba565b6040519015158152602001610278565b6102c96102c4366004612623565b6106d4565b60408051938452602084019290925290820152606001610278565b600254610285565b6103216102fa36600461263c565b600c6020526000908152604090208054600182015460028301546003909301549192909184565b604080519485526020850193909352918301526060820152608001610278565b6102a661034f366004612657565b610707565b610367610362366004612623565b61072b565b005b60405160128152602001610278565b610285600b5481565b6102a661038f3660046125f9565b6109f6565b6103676103a23660046126df565b610a18565b610367610a8f565b6103676103bd36600461274b565b610aa1565b6103676103d0366004612777565b610bc3565b6103fc7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b039091168152602001610278565b60065460ff166102a6565b61043261042d36600461263c565b610f0d565b604051610278959493929190612799565b610367610451366004612623565b611031565b61028561046436600461263c565b6001600160a01b031660009081526020819052604090205490565b61036761107d565b61036761049536600461283f565b61108f565b6103676104a8366004612777565b6110c8565b6103676104bb366004612623565b61122f565b6103676112bc565b610285600a5481565b60065461010090046001600160a01b03166103fc565b61028560075481565b61028560085481565b61026b6112cc565b6102a661050f3660046125f9565b6112db565b6102a66105223660046125f9565b61135b565b6102857f000000000000000000000000000000000000000000000000000000000000000081565b61056161055c3660046125f9565b611369565b6040516102789190612881565b61028561057c3660046128c6565b611433565b61036761058f366004612777565b61145e565b6103676105a236600461263c565b61179d565b6102856105b536600461263c565b611813565b6103676105c8366004612623565b6119cf565b6103fc7f000000000000000000000000000000000000000000000000000000000000000081565b610285610602366004612777565b600d60209081526000928352604080842090915290825290205481565b61028560095481565b"

export const tokenVaultTemplate: ContractTemplate = {
  id: 'token-vault',
  name: 'Token Vault',
  description: 'Deploy a token staking vault with multiple pools, reward distribution, and boost tokens',
  category: 'vault',
  version: '1.0.0',
  enabled: true,
  sourceCode: '', // Will be populated when needed - references public/contracts/staking/TokenVault.sol
  abi: TOKEN_VAULT_ABI,
  bytecode: TOKEN_VAULT_BYTECODE,
  parameters: [
    {
      id: 'tokenName',
      name: '_tokenName',
      type: 'string',
      description: 'Name for the boost token (e.g., "Boost Token")',
      required: true,
      validation: {
        pattern: '^[a-zA-Z0-9\\s]+$'
      }
    },
    {
      id: 'tokenSymbol',
      name: '_tokenSymbol',
      type: 'string',
      description: 'Symbol for the boost token (e.g., "BOOST")',
      required: true,
      validation: {
        pattern: '^[A-Z0-9]+$'
      }
    },
    {
      id: 'stakeToken',
      name: '_stakeToken',
      type: 'address',
      description: 'Address of the token that users will stake',
      required: true,
      validation: {
        pattern: '^0x[a-fA-F0-9]{40}$'
      }
    },
    {
      id: 'rewardToken',
      name: '_rewardToken',
      type: 'address',
      description: 'Address of the token used for rewards',
      required: true,
      validation: {
        pattern: '^0x[a-fA-F0-9]{40}$'
      }
    },
    {
      id: 'rewardPerSecond',
      name: '_rewardPerSecond',
      type: 'number',
      description: 'Amount of reward tokens distributed per second (in wei)',
      required: true,
      validation: {
        min: 1
      }
    },
    {
      id: 'rewardStartTimestamp',
      name: '_rewardStartTimestamp',
      type: 'number',
      description: 'Unix timestamp when rewards start',
      required: true,
      validation: {
        min: 1
      }
    },
    {
      id: 'rewardEndTimestamp',
      name: '_rewardEndTimestamp',
      type: 'number',
      description: 'Unix timestamp when rewards end',
      required: true,
      validation: {
        min: 1
      }
    }
  ],
  createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
  updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any
}