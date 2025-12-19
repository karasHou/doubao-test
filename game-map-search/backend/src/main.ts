import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 CORS
  app.enableCors({
    origin: '*', // 在生产环境中应设置为具体的前端域名
    credentials: true,
  });

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 配置 Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('游戏资源地图查询系统 API')
    .setDescription('API 文档描述游戏资源地图查询系统的所有接口')
    .setVersion('1.0')
    .addTag('resources', '资源点相关接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 启动应用
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 应用已启动在: http://localhost:${port}`);
  console.log(`📚 Swagger 文档地址: http://localhost:${port}/api-docs`);
}
bootstrap();
