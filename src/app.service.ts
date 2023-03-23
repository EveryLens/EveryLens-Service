import { Injectable } from '@nestjs/common';
import LensClient, { mumbai } from '@lens-protocol/client';
import { ethers } from 'ethers';

export const lensClient = new LensClient({
  environment: mumbai,
});
export const wallet = new ethers.Wallet('e7bb7af8f27881806ecdfa8eb2884151b06054b37da47686e3c3be0f39356427');

(async function () {
  const address = await wallet.getAddress();

  const challenge = await lensClient.authentication.generateChallenge(address);
  const signature = await wallet.signMessage(challenge);

  await lensClient.authentication.authenticate(address, signature);

  // check the state with
  await lensClient.authentication.isAuthenticated();
})();


@Injectable()
export class AppService {
  async queryHasLens(address: string): Promise<boolean> {
    const allOwnedProfiles = await lensClient.profile.fetchAll({
      ownedBy: [address],
      limit: 1,
    });
    const defaultProfile = allOwnedProfiles.items[0];

    return !!defaultProfile;
  }
}
