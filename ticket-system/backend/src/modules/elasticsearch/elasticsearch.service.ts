import { Client } from '@elastic/elasticsearch';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ElasticsearchService {
  private client: Client;

  constructor(options: any) {
    this.client = new Client(options);
  }

  async createIndex(index: string) {
    const exists = await this.client.indices.exists({ index });
    if (!exists) {
      await this.client.indices.create({ index });
    }
  }

  async indexDocument(index: string, id: string, document: any) {
    await this.createIndex(index);
    return this.client.index({
      index,
      id,
      document,
    });
  }

  async searchDocuments(index: string, query: any) {
    return this.client.search({
      index,
      body: {
        query,
      },
    });
  }

  async deleteDocument(index: string, id: string) {
    return this.client.delete({
      index,
      id,
    });
  }

  async updateDocument(index: string, id: string, document: any) {
    return this.client.update({
      index,
      id,
      doc: document,
    });
  }
}
