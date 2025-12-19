import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientsModule } from './ingredients/ingredients.module';
import { RecipesModule } from './recipes/recipes.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'recipe_management',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    IngredientsModule,
    RecipesModule,
    RecommendationsModule,
    CacheModule,
  ],
})
export class AppModule {}
