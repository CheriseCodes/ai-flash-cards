#!/bin/bash
# Create an EKS cluster
CLUSTER_NAME=$1
AWS_ACCOUNT_ID=$2
AWS_REGION=$3

# install cert manager
kubectl apply \
    --validate=false \
    -f https://github.com/jetstack/cert-manager/releases/download/v1.13.5/cert-manager.yaml
# wait for cert manager resources to be available
sleep 120
# download controller spec
curl -Lo v2_7_2_full.yaml https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/download/v2.7.2/v2_7_2_full.yaml 
# modify the controller spec if downloaded v2_7_2
sed -i.bak -e "s|your-cluster-name|$CLUSTER_NAME|" ./v2_7_2_full.yaml
# (optional) use privately uploaded aws-load-balancer-controller image
sed -i.bak -e "s|public.ecr.aws/eks/aws-load-balancer-controller|$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/eks/aws-load-balancer-controller|" ./v2_7_2_full.yaml

# install load balancer controller
kubectl apply -f v2_7_2_full.yaml

# install load balancer controller ingress class
curl -Lo v2_7_2_ingclass.yaml https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/download/v2.7.2/v2_7_2_ingclass.yaml
kubectl apply -f v2_7_2_ingclass.yaml
kubectl wait -n kube-system --for=jsonpath='{.status.availableReplicas}=2' deploy/aws-load-balancer-controller 

# (Required) Manually enable TLS
# 1. Get domain from AWS
# 2. If a public hosted zone wasn't automatically created, create it
# 3. Request an ACM cert for this domain
# 4. Use ACM to automatically update your hosted zone to use the certificate
# 5. Create an Alias A record that maps to the load balancer's DNS name
# 4. Uncomment TLS annotations on main-ingress.yaml and run `kubectl replace -f main-ingress.yaml`