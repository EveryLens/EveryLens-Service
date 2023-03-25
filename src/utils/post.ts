import { lensClient, wallet } from '../app.service';
import {
  PublicationMetadataDisplayTypes,
  PublicationMetadataV2Input,
  PublicationMainFocus,
  isRelayerResult,
} from '@lens-protocol/client';
import { Utils } from 'alchemy-sdk';
import { uploadIpfsGetPath } from './Storage';
import { lensHub } from './lens-hub';
const uuid = require('uuid');

export const metadataTemplate: PublicationMetadataV2Input = {
  appId: 'lenster',
  attributes: [
    {
      displayType: PublicationMetadataDisplayTypes.String,
      traitType: 'Created with',
      value: 'LensClient SDK',
    },
  ],
  locale: 'en-US',
  mainContentFocus: PublicationMainFocus.TextOnly,
  metadata_id: uuid.v4(),
  name: 'Post created with LensClient SDK',
  content: 'Post created with LensClient SDK',
  description: 'Description of the post created with LensClient SDK',
  tags: ['lens-sdk'],
  version: '2.0.0',
};

export const createPostTypedData = async (
  metadata: PublicationMetadataV2Input,
) => {
  const validateResult = await lensClient.publication.validateMetadata(
    metadata,
  );
  if (!validateResult.valid) {
    throw new Error(`Metadata is not valid.`);
  }

  const cid = await uploadIpfsGetPath(metadata);
  const contentURI = `https://${cid}.ipfs.dweb.link`;
  // const contentURI =
  //   'ipfs://bafybeihbmh7gv4a3bolabg6igcgf762r7czbce6uajezb6joutu4a5zj2a';
  const typedDataResult = await lensClient.publication.createPostTypedData({
    profileId: '0x7271',
    contentURI,
    collectModule: {
      revertCollectModule: true, // collect disabled
    },
    referenceModule: {
      followerOnlyReferenceModule: false, // anybody can comment or mirror
    },
  });

  return typedDataResult;
};

export const broadcastTransaction = async (
  typedDataResult: Awaited<ReturnType<typeof createPostTypedData>>,
) => {
  const data = typedDataResult.unwrap();
  const typedData = data.typedData;

  // sign with the wallet
  const signedTypedData = await wallet.signTypedData(
    data.typedData.domain,
    data.typedData.types,
    data.typedData.value,
  );

  // broadcast
  const broadcastResult = await lensClient.transaction.broadcast({
    id: data.id,
    signature: signedTypedData,
  });

  // broadcastResult is a Result object
  const broadcastResultValue = broadcastResult.unwrap();

  if (!isRelayerResult(broadcastResultValue)) {
    console.log(`Something went wrong`, broadcastResultValue);
    return;
  }
  return broadcastResultValue.txId;
};

export const indexPost = async (txId: string) => {
  await lensClient.transaction.waitForIsIndexed(txId);
  let res = lensClient.transaction.wasIndexed(txId);
  return res;
};

// createPostTypedData(metadataTemplate).then((typedDataResult) => (broadcastTransaction(typedDataResult)));
