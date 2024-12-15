import { DynamoDBClient, PutItemCommandOutput, GetItemCommandInput, GetItemCommandOutput, QueryCommandOutput, UpdateItemCommandOutput, DeleteItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { PutObjectCommandInput, PutObjectCommandOutput, PutObjectCommand, DeleteObjectCommand, DeleteObjectCommandInput, DeleteObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";

import {
  GetItemCommand,
  QueryCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  PutItemCommandInput,
  UpdateItemCommandInput,
  QueryCommandInput,
  DeleteItemCommandInput,
} from "@aws-sdk/client-dynamodb";

export class dynamoDb {
  client: DynamoDBClient;
  constructor(client: DynamoDBClient) {
    this.client = client;
  }
  async putItem(input: PutItemCommandInput): Promise<PutItemCommandOutput> {
    return await this.client.send(new PutItemCommand(input));
  }
  async updateItem(input: UpdateItemCommandInput): Promise<UpdateItemCommandOutput> {
    return await this.client.send(new UpdateItemCommand(input));
  }
  async query(input: QueryCommandInput): Promise<QueryCommandOutput> {
    return await this.client.send(new QueryCommand(input));
  }
  async getItem(input: GetItemCommandInput): Promise<GetItemCommandOutput> {
    return await this.client.send(new GetItemCommand(input));
  }
  async deleteItem(input: DeleteItemCommandInput): Promise<DeleteItemCommandOutput> {
    return await this.client.send(new DeleteItemCommand(input))
  }
}

export class s3 {
  client: S3Client;
  constructor(client: S3Client) {
    this.client = client;
  }
  async putObject(input: PutObjectCommandInput): Promise<PutObjectCommandOutput> {
    return await this.client.send(new PutObjectCommand(input));
  }
  async deleteObject(input: DeleteObjectCommandInput): Promise<DeleteObjectCommandOutput> {
    return await this.client.send(new DeleteObjectCommand(input));
  }
}
