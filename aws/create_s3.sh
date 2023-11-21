aws cloudformation create-stack --stack-name flash-card-app-s3 --template-body file://templates/s3.yaml \
    --parameters ParameterKey=BucketName,ParameterValue=$BUCKET_NAME \
    ParameterKey=DistributionId,ParameterValue=$DISTRIBUTION_ID