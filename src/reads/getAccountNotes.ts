import { flatten } from 'lodash-es'
import type { Address } from 'viem'
import { PublicClient } from 'viem'
import { multicall } from 'viem/actions'

import DYSON_PAIR_ABI from '@/constants/abis/DysonSwapPair'
import { IDysonPairNotes } from '@/entities/pairNote'
import { ReadContractParameters, readContractParameters } from '@/utils/viem'

function noteInfoContract(pairAddress: Address, account: Address, noteIndex: number) {
  return {
    address: pairAddress,
    abi: DYSON_PAIR_ABI,
    functionName: 'notes',
    args: [account, noteIndex],
  }
}

export async function getAccountNotes(
  client: PublicClient,
  args: ReadContractParameters<{
    account: Address
    noteCounts: number[]
    pairAddresses: Address[]
  }>,
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }

  const { account, noteCounts, pairAddresses } = args

  const noteContractMatrix = pairAddresses.map((pairAddress, index) => {
    const noteCount = noteCounts[index]
    const noteContractList = []
    if (noteCount > 0) {
      for (let i = 0; i < noteCount; i++) {
        noteContractList.push(noteInfoContract(pairAddress, account, i))
      }
    }

    return noteContractList
  })

  const pairsNoteData = (await multicall(client, {
    ...readContractParameters(args),
    allowFailure: false,
    contracts: flatten(noteContractMatrix),
  })) as any[]
  const dysonPairNotes: IDysonPairNotes = {}

  for (let i = 0; i < pairAddresses.length; i++) {
    const noteCount = noteCounts[i]
    if (noteCount === undefined || noteCount <= 0) {
      continue
    }
    const notesData = pairsNoteData.splice(0, noteCount)

    const pairAddress = pairAddresses[i]
    dysonPairNotes[pairAddress] = {}
    notesData.forEach((dataArray, index) => {
      const [token0Amt, token1Amt, due] = dataArray as any
      const token0AmtBigNumber = token0Amt as bigint
      const token1AmtBigNumber = token1Amt as bigint
      if (token0AmtBigNumber < 0) {
        return
      }
      dysonPairNotes[pairAddress][index] = {
        token0Amount: token0AmtBigNumber,
        token1Amount: token1AmtBigNumber,
        due: Number(due as bigint),
        noteIndex: index,
      }
    })
  }

  return dysonPairNotes
}
