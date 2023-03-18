import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import fetch from 'node-fetch';
import { checkIsValidEthAddress, waitAsyncResult } from '../utils';

// @ts-ignore
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

@Controller('sign-in')
export class IssueController {
  constructor() {}

  @Get()
  async signIn(@Query() query: { address: string }): Promise<any> {
    checkIsValidEthAddress(query.address);

    const response = await (
      await fetch(
        'https://self-hosted-demo-backend-platform.polygonid.me/api/sign-in',
      )
    ).json();

    const callbackUrl = response?.body?.callbackUrl;
    const [waitPromise, stop] = waitAsyncResult(() => fetch(callbackUrl), 100, 3);
    waitPromise.then(res => console.log(res));
    return response;
  }
}
