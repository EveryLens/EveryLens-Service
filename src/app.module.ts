import { Module } from '@nestjs/common';
import { SignInController, ClaimController, VerifierController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [SignInController, ClaimController, VerifierController],
  providers: [AppService],
})
export class AppModule {}
