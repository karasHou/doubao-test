import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Document } from "./entities/document.entity";
import { DocumentVersion } from "./entities/document-version.entity";
import { User } from "../user/entities/user.entity";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { UpdateDocumentDto } from "./dto/update-document.dto";
import { CreateDocumentVersionDto } from "./dto/create-document-version.dto";
import * as Y from "yjs";

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document) private documentRepository: Repository&lt;Document&gt;,
    @InjectRepository(DocumentVersion) private versionRepository: Repository&lt;DocumentVersion&gt;,
    @InjectRepository(User) private userRepository: Repository&lt;User&gt;
  ) {}

  async create(createDocumentDto: CreateDocumentDto, userId: string): Promise&lt;Document&gt; {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (\!user) {
      throw new NotFoundException("User not found");
    }

    // Create initial Yjs document
    let initialContent: Buffer | null = null;
    if (createDocumentDto.initialContent) {
      const ydoc = new Y.Doc();
      const ytext = ydoc.getText("text");
      ytext.insert(0, createDocumentDto.initialContent);
      const update = Y.encodeStateAsUpdate(ydoc);
      initialContent = Buffer.from(update);
    }

    const document = this.documentRepository.create({
      title: createDocumentDto.title,
      content: initialContent,
      created_by: user,
    });

    const savedDoc = await this.documentRepository.save(document);

    // Create initial version
    if (initialContent) {
      await this.createVersion(savedDoc.id, userId, { changeLog: "Initial version" });
    }

    return savedDoc;
  }

  async findAllByUser(userId: string): Promise&lt;Document[]&gt; {
    return this.documentRepository.find({
      where: { created_by: { id: userId }, is_deleted: false },
      relations: ["created_by"],
    });
  }

  async findOneById(id: string, userId: string): Promise&lt;Document&gt; {
    const document = await this.documentRepository.findOne({
      where: { id, is_deleted: false },
      relations: ["created_by"],
    });

    if (\!document) {
      throw new NotFoundException("Document not found");
    }

    // Check if user has access
    if (document.created_by.id \!== userId) {
      // TODO: Add collaborator check
      throw new NotFoundException("Document not found");
    }

    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto, userId: string): Promise&lt;Document&gt; {
    const document = await this.findOneById(id, userId);

    if (updateDocumentDto.title) {
      document.title = updateDocumentDto.title;
    }

    return this.documentRepository.save(document);
  }

  async remove(id: string, userId: string): Promise&lt;void&gt; {
    const document = await this.findOneById(id, userId);
    document.is_deleted = true;
    await this.documentRepository.save(document);
  }

  async saveContent(id: string, content: Buffer, userId: string): Promise&lt;Document&gt; {
    const document = await this.findOneById(id, userId);
    document.content = content;
    return this.documentRepository.save(document);
  }

  async createVersion(documentId: string, userId: string, createVersionDto: CreateDocumentVersionDto): Promise&lt;DocumentVersion&gt; {
    const document = await this.findOneById(documentId, userId);
    const user = await this.userRepository.findOneBy({ id: userId });

    if (\!document.content) {
      throw new NotFoundException("Document has no content");
    }

    // Get latest version number
    const latestVersion = await this.versionRepository.findOne({
      where: { document: { id: documentId } },
      order: { version_number: "DESC" },
    });

    const versionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

    const version = this.versionRepository.create({
      document,
      version_number: versionNumber,
      content: document.content,
      change_log: createVersionDto.changeLog || "Auto-save",
      created_by: user,
    });

    return this.versionRepository.save(version);
  }

  async findAllVersions(documentId: string, userId: string): Promise&lt;DocumentVersion[]&gt; {
    await this.findOneById(documentId, userId);

    return this.versionRepository.find({
      where: { document: { id: documentId } },
      relations: ["created_by"],
      order: { version_number: "DESC" },
    });
  }

  async findOneVersion(documentId: string, versionNumber: number, userId: string): Promise&lt;DocumentVersion&gt; {
    await this.findOneById(documentId, userId);

    const version = await this.versionRepository.findOne({
      where: { document: { id: documentId }, version_number: versionNumber },
      relations: ["created_by", "document"],
    });

    if (\!version) {
      throw new NotFoundException("Version not found");
    }

    return version;
  }

  async restoreVersion(documentId: string, versionNumber: number, userId: string, changeLog?: string): Promise&lt;DocumentVersion&gt; {
    const version = await this.findOneVersion(documentId, versionNumber, userId);
    const document = await this.findOneById(documentId, userId);

    // Restore content
    document.content = version.content;
    await this.documentRepository.save(document);

    // Create new version for the restore
    return this.createVersion(documentId, userId, {
      changeLog: changeLog || `Restored to version ${versionNumber}`,
    });
  }
}