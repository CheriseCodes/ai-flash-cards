#!/bin/bash
# Create an EKS cluster
CLUSTER_NAME=$1
AWS_ACCOUNT_ID=$2

curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.2/docs/install/iam_policy.json

aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json

eksctl create iamserviceaccount \
  --cluster=$CLUSTER_NAME \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn="arn:aws:iam::$AWS_ACCOUNT_ID:policy/AWSLoadBalancerControllerIAMPolicy" \
  --approve

# install load balancer controller
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks
helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=$CLUSTER_NAME \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller 
kubectl wait -n kube-system --for=jsonpath='{.status.availableReplicas}=2' deploy/aws-load-balancer-controller 


# (Required) Manually enable TLS
# 1. Get domain from AWS
# 2. If a public hosted zone wasn't automatically created, create it
# 3. Request an ACM cert for this domain
# 4. Use ACM to automatically update your hosted zone to use the certificate
# 5. Create an Alias A record that maps to the load balancer's DNS name
# 4. Uncomment TLS annotations on main-ingress.yaml and run `kubectl replace -f main-ingress.yaml`
