import {
  Abi,
  Account,
  Chain,
  ContractFunctionArgs,
  ContractFunctionName,
  SimulateContractParameters,
} from 'viem'

export type ContractFunctionConfig = SimulateContractParameters<
  Abi,
  ContractFunctionName<Abi, 'nonpayable' | 'payable'>,
  ContractFunctionArgs<
    Abi,
    'nonpayable' | 'payable',
    ContractFunctionName<Abi, 'nonpayable' | 'payable'>
  >,
  Chain,
  Chain,
  Account
>
