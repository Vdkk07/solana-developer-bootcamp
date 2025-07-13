import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Votingdapp } from '../target/types/votingdapp'
import { PublicKey } from '@solana/web3.js'
import IDL from '../target/idl/votingdapp.json'

const votingAddress = new PublicKey('JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H')

describe('voting', () => {
  let context
  let provider
  let votingProgram

  beforeAll(async () => {
    context = await startAnchor(
      '',
      [
        {
          name: 'votingdapp',
          programId: votingAddress,
        },
      ],
      [],
    )

    provider = new BankrunProvider(context)

    votingProgram = new Program<Votingdapp>(IDL, provider)
  })

  it('initializes poll', async () => {
    const pollId = new anchor.BN(1)
    const pollStart = new anchor.BN(0)
    const pollEnd = new anchor.BN(1782385873)
    const description = 'what is your favourite peanut butter?'

    await votingProgram.methods.initializePoll(pollId, description, pollStart, pollEnd).rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress)

    console.log(poll)
    expect(poll.pollId.toNumber()).toEqual(1)
    expect(poll.description).toEqual('what is your favourite peanut butter?')
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
  })

  it('initialize candidate', async () => {
    await votingProgram.methods.initializeCandidate('Smooth', new anchor.BN(1)).rpc()

    await votingProgram.methods.initializeCandidate('Crunchy', new anchor.BN(1)).rpc()

    const [cruchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Crunchy')],
      votingAddress,
    )

    const crunchyCandidate = await votingProgram.account.candidate.fetch(cruchyAddress)

    console.log(crunchyCandidate)
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0)

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Smooth')],
      votingAddress,
    )

    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress)

    console.log(smoothCandidate)
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0)
  })

  it('vote candidate', async () => {
    await votingProgram.methods.vote('Crunchy', new anchor.BN(1)).rpc()
    await votingProgram.methods.vote('Crunchy', new anchor.BN(1)).rpc()
    await votingProgram.methods.vote('Crunchy', new anchor.BN(1)).rpc()
    await votingProgram.methods.vote('Crunchy', new anchor.BN(1)).rpc()
    await votingProgram.methods.vote('Crunchy', new anchor.BN(1)).rpc()

    await votingProgram.methods.vote('Smooth', new anchor.BN(1)).rpc()
    await votingProgram.methods.vote('Smooth', new anchor.BN(1)).rpc()
    await votingProgram.methods.vote('Smooth', new anchor.BN(1)).rpc()

    const [cruchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Crunchy')],
      votingAddress,
    )

    const crunchyCandidate = await votingProgram.account.candidate.fetch(cruchyAddress)

    console.log(crunchyCandidate)
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(5)

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Smooth')],
      votingAddress,
    )

    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress)

    console.log(smoothCandidate)
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(3)
  })
})
