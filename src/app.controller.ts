import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';

function isValidEthAddress(str: string): boolean {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(str);
}

@Controller('claim')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async claim(@Query() query: { address: string }): Promise<any> {
    if (!isValidEthAddress(query.address)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Not a valid ethereum address',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!(await this.appService.queryHasLens(query.address))) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Address does not have a Lens profile',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    return '123';
  }
}
