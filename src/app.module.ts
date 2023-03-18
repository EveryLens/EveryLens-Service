import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IssueController } from './issuer/controller';

@Module({
  imports: [],
  controllers: [AppController, IssueController],
  providers: [AppService],
})
export class AppModule {}
