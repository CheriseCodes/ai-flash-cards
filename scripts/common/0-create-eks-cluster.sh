#!/bin/bash
# Create an EKS cluster
EKS_MANIFEST_PATH=$1
AWS_ACCOUNT_ID=$2
AWS_REGION=$3

CLUSTER_NAME=$(cat $EKS_MANIFEST_PATH | yq .metadata.name)

if [[ -z $CLUSTER_NAME ]]
then
    echo "[ERROR] Cluster name is undefined"
    exit 1
else
    echo "[INFO] Creating cluster with name: $CLUSTER_NAME"
fi

# Min instance size is t3.small
eksctl create cluster -f $EKS_MANIFEST_PATH

# Provide IAM permissions for "vpc-cni" addon via pod identity associations
eksctl utils migrate-to-pod-identity --cluster $CLUSTER_NAME --approve

# Enable more pods per node
kubectl set env daemonset aws-node -n kube-system ENABLE_PREFIX_DELEGATION=true
kubectl set env daemonset aws-node -n kube-system WARM_PREFIX_TARGET=1
