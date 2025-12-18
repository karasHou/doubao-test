import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchService } from './elasticsearch.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: ElasticsearchService,
      useFactory: (configService: ConfigService) => {
        return new ElasticsearchService({
          node: configService.get('ELASTICSEARCH_NODE'),
          auth: {
            username: configService.get('ELASTICSEARCH_USERNAME'),
            password: configService.get('ELASTICSEARCH_PASSWORD'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
