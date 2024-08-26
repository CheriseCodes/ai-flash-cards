import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";
import { dynamoDb, s3 } from "../classes/aws";

export const s3Client: s3 = new s3(new S3Client({
    credentials: fromEnv(),
    region: "ca-central-1",
}));
  
export const dynamoDbClient: dynamoDb = new dynamoDb(new DynamoDBClient({
    credentials: fromEnv(),
    region: "ca-central-1",
}));


