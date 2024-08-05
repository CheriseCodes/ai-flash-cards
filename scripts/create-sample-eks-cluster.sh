#!/bin/bash

EKS_MANIFEST_PATH=$1
AWS_ACCOUNT_ID=$2
AWS_REGION=$3
INGRESS_HOST=$4

if [[ -z $EKS_MANIFEST_PATH ]]
then
    echo "[ERROR] Path to EKS manifest name is undefined"
    exit 1
fi

if [[ -z $AWS_ACCOUNT_ID ]]
then
    echo "[ERROR] AWS_ACCOUNT_ID undefined"
    exit 1
else
    echo "[INFO] Deploying AI Flashcards app to AWS account $AWS_ACCOUNT_ID"
fi

if [[ -z $AWS_REGION ]]
then
    echo "[ERROR] AWS_REGION undefined"
    exit 1
else
    echo "[INFO] Deploying AI Flashcards app to region $AWS_REGION"
fi

if [[ -z $INGRESS_HOST ]]
then
    echo "[ERROR] Ingress hostname undefined"
    exit 1
else
    echo "[INFO] Creating AI Flashcards app at https://$INGRESS_HOST"
fi

sh ./common/0-create-eks-cluster.sh $EKS_MANIFEST_PATH $AWS_ACCOUNT_ID $AWS_REGION

CLUSTER_NAME=$(cat $EKS_MANIFEST_PATH | yq .metadata.name)

sh ./common/1-install-aws-lbc-with-helm.sh $CLUSTER_NAME $AWS_ACCOUNT_ID
# sh ./common/1-install-aws-lbc-with-manifests.sh $CLUSTER_NAME $AWS_ACCOUNT_ID $AWS_REGION

sh ./common/2-install-ai-flash-cards-with-helm.sh 
# sh ./common/2-install-ai-flash-cards-with-argocd-and-helm.sh 
# sh ./common/2-install-ai-flash-cards-with-manifests.sh "eks"

sh ./common/3-install-kube-prometheus-stack.sh 
