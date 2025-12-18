export declare class ElasticsearchService {
    private client;
    constructor(options: any);
    createIndex(index: string): Promise<void>;
    indexDocument(index: string, id: string, document: any): Promise<import("@elastic/elasticsearch/lib/api/types").WriteResponseBase>;
    searchDocuments(index: string, query: any): Promise<import("@elastic/elasticsearch/lib/api/types").SearchResponse<unknown, Record<string, import("@elastic/elasticsearch/lib/api/types").AggregationsAggregate>>>;
    deleteDocument(index: string, id: string): Promise<import("@elastic/elasticsearch/lib/api/types").WriteResponseBase>;
    updateDocument(index: string, id: string, document: any): Promise<import("@elastic/elasticsearch/lib/api/types").UpdateResponse<unknown>>;
}
