import { Module } from '@nestjs/common';
import { KeyManagementService } from './key-management.service';

@Module({
  providers: [KeyManagementService],
  exports: [KeyManagementService],
})
export class KeyManagementModule {}