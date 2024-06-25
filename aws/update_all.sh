#!/bin/bash
sh deploy_dynamodb.sh
sh deploy_s3.sh
sh deploy_cloudfront.sh
sh deploy_ecr.sh