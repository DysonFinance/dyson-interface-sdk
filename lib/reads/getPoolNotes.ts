import { flatten } from 'lodash-es'
import DYSON_POOL_ABI from '@/constants/abis/DysonSwapPair'
import { Address } from 'abitype'
import { PublicClient } from 'viem'
import { multicall } from 'viem/actions'
import { ReadContractParameters, readContractParameters } from '@/utils/viem'

type NotesData = {
  token0Amt: bigint
  token1Amt: bigint
  due: bigint
}

function noteInfoContract(pairAddress: Address, account: Address, noteIndex: number) {
  return {
    address: pairAddress,
    abi: DYSON_POOL_ABI,
    functionName: 'notes',
    args: [account, noteIndex],
  }
}

export async function getAccountNotes(
  client: PublicClient,
  args: ReadContractParameters<{
    account: Address
    noteCounts: number[]
    poolAddresses: Address[]
  }>,
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }

  const { account, noteCounts, poolAddresses } = args

  const noteContractMatrix = poolAddresses.map((poolAddress, index) => {
    const noteCount = noteCounts[index]
    const noteContractList = []
    if (noteCount > 0) {
      for (let i = 0; i < noteCount; i++) {
        noteContractList.push(noteInfoContract(poolAddress, account, i))
      }
    }

    return noteContractList
  })

  const poolNoteData = (await multicall(client, {
    ...readContractParameters(args),
    allowFailure: false,
    contracts: flatten(noteContractMatrix),
  })) as unknown as NotesData

  return {
    poolNoteData,
  }
}
