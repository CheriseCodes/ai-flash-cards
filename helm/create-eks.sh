#!/bin/bash
# Create an EKS cluster
cluster_name=$(cat ../kubernetes/eks/cluster/cluster.yaml | yq .metadata.name)
AWS_ACCOUNT_ID=$1
AWS_REGION=$2

if [[ "$cluster_name" == "null" ]]
then
    echo "[ERROR] Cluster name is undefined"
    exit 1
else
    echo "[INFO] Installing cluster with name: $cluster_name"
fi

if [[ -z $AWS_ACCOUNT_ID ]]
then
    echo "[ERROR] Ingress AWS_ACCOUNT_ID undefined. Please pass it as the first parameter."
    exit 1
else
    echo "[INFO] Deploying AI Flashcards app to AWS account $AWS_ACCOUNT_ID"
fi

if [[ -z $AWS_REGION ]]
then
    echo "[ERROR] Ingress AWS_REGION undefined. Please pass it as the second parameter."
    exit 1
else
    echo "[INFO] Deploying AI Flashcards app to region $AWS_REGION"
fi

# Min instance size is t3.small
eksctl create cluster -f ../kubernetes/eks/cluster/cluster.yaml

# Check if cluster successfully created
# TODO: Find another way to check if cluster created successfully
if [[ $? -ne 0 ]]
then
    echo "[ERROR] Cluster creation failed"
    exit 1
fi

# IRSA has been deprecated; the recommended way to provide IAM permissions for "vpc-cni" addon is via pod identity associations
eksctl utils migrate-to-pod-identity --cluster $cluster_name --approve

# Enable more pods per node
kubectl set env daemonset aws-node -n kube-system ENABLE_PREFIX_DELEGATION=true
kubectl set env daemonset aws-node -n kube-system WARM_PREFIX_TARGET=1

# Install AWS Load Balancer Controller add-on
# create new IAM OIDC provider
# TODO: Install load balancer controller with helm: https://docs.aws.amazon.com/eks/latest/userguide/lbc-helm.html
eksctl utils associate-iam-oidc-provider --cluster $cluster_name --approve 
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.2/docs/install/iam_policy.json # download policy template for controller
# create the policy using downloaded template
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json 
# create eks service account
eksctl create iamserviceaccount \
  --cluster=$cluster_name \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::$AWS_ACCOUNT_ID:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve 
# install load balancer controller
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=$cluster_name \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller 

# wait for load balancer controller service to be ready
sleep 30

# install ai-flash-cards app
helm upgrade  --install ai-flash-cards ./ai-flash-cards --timeout 3600s  --namespace ai-flash-cards --create-namespace --values ./ai-flash-cards/eks-values.yaml

# # (Optional) Install Prometheus
# helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
# helm repo update

# # Using version 59.1.0 because it uses the same Grafana version as AWS
# helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack --version 59.1.0 --values ./kube-prometheus-stack/shared-values.yaml --namespace monitoring --create-namespace

# # (Optional) install argocd
# kubectl create namespace argocd
# kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# # create loadbalancer to expose the argocd server
# kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# # (Optional) Forward to local port as needed
# kubectl port-forward -n monitoring service/kube-prometheus-stack-grafana 3000:80
# kubectl port-forward -n monitoring service/prometheus-operated  9090:9090
# kubectl port-forward -n monitoring service/kube-prometheus-stack-prometheus-node-exporter  9100:9100