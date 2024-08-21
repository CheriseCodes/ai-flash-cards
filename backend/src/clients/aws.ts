import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";

export const s3Client: S3Client = new S3Client({
    credentials: fromEnv(),
    region: "ca-central-1",
});
  
export const dynamoDbClient: DynamoDBClient = new DynamoDBClient({
    credentials: fromEnv(),
    region: "ca-central-1",
});


