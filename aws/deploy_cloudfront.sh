#!/bin/bash
echo "Going to deploy a CloudFront resource with the following configurations:"
echo "  BucketDomain=\"$1.s3.ca-central-1.amazonaws.com\""
echo "  LogBucketName=\"$2\""

aws cloudformation deploy --stack-name flash-card-app-cloudfront --template-file templates/cloudfront.yaml \
    --parameter-overrides BucketDomain="$1.s3.ca-central-1.amazonaws.com" LogBucketName=$2