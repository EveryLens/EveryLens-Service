import { Module } from '@nestjs/common';
import { SignInController, ClaimController, VerifierController, PostController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [SignInController, ClaimController, VerifierController, PostController],
  providers: [AppService],
})
export class AppModule {}
