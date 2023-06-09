import {
  Controller,
  Get,
  Post,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { checkIsValidEthAddress, waitAsyncResult } from './utils';
import fetch from 'node-fetch';
import {
  createPostTypedData,
  broadcastTransaction,
  metadataTemplate,
  indexPost,
} from './utils/post';

const didIdMap = new Map<string, string>();

@Controller('sign-in')
export class SignInController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async signIn(@Query() query: { address: string }): Promise<any> {
    checkIsValidEthAddress(query.address);

    if (!(await this.appService.queryHasLens(query.address))) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Address does not have a Lens profile',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await fetch(
      'https://self-hosted-demo-backend-platform.polygonid.me/api/sign-in',
    ).then((res) => res.json());

    const statusQueryUrl = response?.body?.callbackUrl
      ?.replace(/callback/g, 'status')
      .replace(/sessionId/g, 'id');
    const [authSignInPromise] = waitAsyncResult(
      () => fetch(statusQueryUrl),
      100,
      3,
    );

    authSignInPromise
      .then((res) => res.json())
      .then((res) => {
        didIdMap.set(query.address, res?.id);
      })
      .catch((err) => console.log(err));

    return {
      ...response,
      statusQueryUrl,
    };
  }
}

@Controller('claim')
export class ClaimController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async Claim(@Query() query: { address: string }): Promise<any> {
    checkIsValidEthAddress(query.address);

    if (!(await this.appService.queryHasLens(query.address))) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Address does not have a Lens profile',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const didId = didIdMap.get(query.address);
    if (!didId) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Address has not signed in',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const claimId = await fetch(
      `https://self-hosted-demo-backend-platform.polygonid.me/api/claim?id=${didId}&schema=HasLensCredential`,
      {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://raw.githubusercontent.com/EveryLens/EveryLens-Service/main/src/claim-schemas/json/HasLensCredential.json',
          type: 'HasLensCredential',
          data: {
            test: 1,
          },
          schema: 'Custom',
          expiration: 1893456000,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ).then((res) => res.json());

    const VCinfo = await fetch(
      `https://self-hosted-demo-backend-platform.polygonid.me/api/offer?id=${claimId?.id}&schema=HasLensCredential`,
    ).then((res) => res.json());

    return VCinfo;
  }
}

@Controller('verify')
export class VerifierController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async verify(): Promise<any> {
    const response = await fetch(
      `https://self-hosted-demo-backend-platform.polygonid.me/api/sign-in?type=custom`,
      {
        method: 'POST',
        body: JSON.stringify({
          circuitId: 'credentialAtomicQuerySigV2',
          requestID: 1,
          query: {
            type: 'HasLensCredential',
            allowedIssuers: ['*'],
            context:
              'https://raw.githubusercontent.com/EveryLens/EveryLens-Service/main/src/claim-schemas/json-ld/hasLens.json-ld',
            credentialSubject: {
              test: {
                $eq: 1,
              },
            },
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ).then((res) => res.json());

    const statusQueryUrl = response?.body?.callbackUrl
      ?.replace(/callback/g, 'status')
      .replace(/sessionId/g, 'id');
    const [authSignInPromise] = waitAsyncResult(
      () => fetch(statusQueryUrl),
      100,
      3,
    );

    authSignInPromise
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));

    return {
      ...response,
      statusQueryUrl,
    };
  }
}

@Controller('post')
export class PostController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async post(
    @Query() query: { name: string; content: string; description: string },
  ): Promise<any> {
    const metadata = {
      ...metadataTemplate,
      name: query.name,
      description: query.description,
      content: query.content,
    };
    const typedDataResult = await createPostTypedData(metadata);
    const txId = await broadcastTransaction(typedDataResult);
    if (!txId) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to broadcast transaction',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    let res = await indexPost(txId);

    return res;
  }
}
