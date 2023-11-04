import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { PlayerRepository } from './repositories/player.repository';
import { PlayerService } from './services/player.service';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  providers: [PlayerService, PlayerRepository],
  exports: [PlayerService],
})
export class PlayerModule {}
