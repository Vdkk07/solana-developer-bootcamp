import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey(
  "AvMEjc51yw2oEUHg5MWv4CrFwyEjwYSVWCpz59Sw8SNA"
);

console.log(`Creating NFT`);

const mint = generateSigner(umi);

const tx = await createNft(umi, {
  mint,
  name: "MY NFT",
  uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-offchain-data.json",
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionAddress,
    verified: false,
  },
});

await tx.sendAndConfirm(umi);

// Add a delay to allow the network to process the account, if i didn't do this i got the AccountNotFoundError
await new Promise((resolve) => setTimeout(resolve, 10000));

const createNFT = await fetchDigitalAsset(umi, mint.publicKey);

console.log(
  `Created NFT! Address is ${getExplorerLink(
    "address",
    createNFT.mint.publicKey,
    "devnet"
  )}`
);
