aws cloudformation deploy --stack-name flash-card-app-s3 --template-file templates/s3.yaml \
    --parameter-overrides BucketName=$BUCKET_NAME DistributionId=$DISTRIBUTION_ID