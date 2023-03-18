import { Injectable } from '@nestjs/common';
import LensClient, { mumbai } from '@lens-protocol/client';

const lensClient = new LensClient({
  environment: mumbai,
});

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
