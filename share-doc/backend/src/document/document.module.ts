import { Module } from "@nestjs/common";import { TypeOrmModule } from "@nestjs/typeorm";import { DocumentService } from "./document.service";import { DocumentController } from "./document.controller";import { DocumentGateway } from "./document.gateway";import { Document } from "./entities/document.entity";import { DocumentVersion } from "./entities/document-version.entity";import { UserModule } from "../user/user.module";@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentVersion]),
    UserModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentGateway],
  exports: [DocumentService],
})
export class DocumentModule {}