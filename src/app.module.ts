import { Module } from '@nestjs/common';
import { SignInController, ClaimController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [SignInController, ClaimController],
  providers: [AppService],
})
export class AppModule {}
