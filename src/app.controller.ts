import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { checkIsValidEthAddress } from './utils';

@Controller('claim')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async claim(@Query() query: { address: string }): Promise<any> {
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

    return '123';
  }
}
