import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { UpdateDocumentDto } from "./dto/update-document.dto";
import { CreateDocumentVersionDto } from "./dto/create-document-version.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("documents")
@UseGuards(AuthGuard("jwt"))
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  async create(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    return this.documentService.create(createDocumentDto, req.user.userId);
  }

  @Get()
  async findAll(@Request() req) {
    return this.documentService.findAllByUser(req.user.userId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req) {
    return this.documentService.findOneById(id, req.user.userId);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateDocumentDto: UpdateDocumentDto, @Request() req) {
    return this.documentService.update(id, updateDocumentDto, req.user.userId);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Request() req) {
    await this.documentService.remove(id, req.user.userId);
    return { message: "Document deleted successfully" };
  }

  @Post(":id/versions")
  async createVersion(@Param("id") id: string, @Body() createVersionDto: CreateDocumentVersionDto, @Request() req) {
    return this.documentService.createVersion(id, req.user.userId, createVersionDto);
  }

  @Get(":id/versions")
  async findAllVersions(@Param("id") id: string, @Request() req) {
    return this.documentService.findAllVersions(id, req.user.userId);
  }

  @Get(":id/versions/:versionNumber")
  async findOneVersion(@Param("id") id: string, @Param("versionNumber") versionNumber: number, @Request() req) {
    return this.documentService.findOneVersion(id, versionNumber, req.user.userId);
  }

  @Post(":id/versions/:versionNumber/restore")
  async restoreVersion(@Param("id") id: string, @Param("versionNumber") versionNumber: number, @Body() body: { changeLog?: string }, @Request() req) {
    return this.documentService.restoreVersion(id, versionNumber, req.user.userId, body.changeLog);
  }
}