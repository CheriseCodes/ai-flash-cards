#!/bin/bash
# Create an EKS cluster
KIND_MANIFEST_PATH=$1
BACKEND_IMG_TAG=$2
FRONTEND_IMG_TAG=$2

CLUSTER_NAME=$(cat $KIND_MANIFEST_PATH | yq .name)

if [[ -z $CLUSTER_NAME ]]
then
    echo "[ERROR] Path to kind cluster config is undefine"
    exit 1
else
    echo "[INFO] Creating cluster with name: $CLUSTER_NAME"
fi
kind create cluster --config $KIND_MANIFEST_PATH
kind load docker-image ai-flash-cards-backend:$BACKEND_IMG_TAG ai-flash-cards-frontend:$FRONTEND_IMG_TAG -n $CLUSTER_NAME