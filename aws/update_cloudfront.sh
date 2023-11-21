aws cloudformation update-stack --stack-name flash-card-app-cloudfront --template-body file://templates/cloudfront.yaml \
    --parameters ParameterKey=BucketDomain,ParameterValue="$BUCKET_NAME.s3.ca-central-1.amazonaws.com" \
    ParameterKey=LogBucketName,ParameterValue=$LOG_BUCKET_NAME