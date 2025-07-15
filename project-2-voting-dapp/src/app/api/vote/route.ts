import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from '@solana/actions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { BN, Program } from '@coral-xyz/anchor'
import IDL from '@/../anchor/target/idl/votingdapp.json'
import { Votingdapp } from '@/../anchor/target/types/votingdapp'

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: ACTIONS_CORS_HEADERS,
  })
}

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: 'https://imgs.search.brave.com/uTiULzd13jq99kB3qHjAm-vgHOpQYvM7_6ekS2BO6gc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNDcv/MTQwLzU4NS9zbWFs/bC9wZWFudXQtYnV0/dGVyLWFuZC1wZWFu/dXQtYnV0dGVyLXNw/cmVhZC1vbi1hLXdo/aXRlLWJhY2tncm91/bmQtZnJlZS1waG90/by5qcGc',
    title: 'Vote for your favorite type of peanut butter!',
    description: 'Vote between crunchy and smooth peanut butter.',
    label: 'Vote',
    links: {
      actions: [
        {
          type: 'message',
          href: 'api/vote?candidate=crunchy',
          label: 'Vote for crunchy',
        },
        {
          type: 'message',
          href: 'api/vote?candidate=smooth',
          label: 'Vote for smooth',
        },
      ],
    },
  }
  return Response.json(actionMetadata, {
    headers: ACTIONS_CORS_HEADERS,
  })
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const candidate = url.searchParams.get('candidate')

  if (candidate != 'Crunchy' && candidate != 'Smooth') {
    return new Response('Invalid Candiate', {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    })
  }

  const connection = new Connection('http://127.0.0.1:8899', 'confirmed')
  const program: Program<Votingdapp> = new Program(IDL, connection)

  const body: ActionPostRequest = await request.json()
  let voter
  try {
    voter = new PublicKey(body.account)
  } catch {
    return new Response('Invalid Candiate', {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    })
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({
      signer: voter,
    })
    .instruction()

  const recentBlockhash = await connection.getLatestBlockhash()

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: recentBlockhash.blockhash,
    lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
  }).add(instruction)

  const response = await createPostResponse({
    fields: {
      type: 'transaction',
      transaction: transaction,
    },
  })

  return Response.json(response, {
    headers: ACTIONS_CORS_HEADERS,
  })
}
