# Create an EKS cluster
cluster_name=ai-flash-cards-v2
# Min instance size is t3.medium
eksctl create cluster --name $cluster_name --region ca-central-1 --nodegroup-name node-group --node-type t3.medium --nodes 1 --nodes-min 1 --nodes-max 1 --managed

# Create config maps
kubectl apply -f ../kubernetes/eks/configmap/backend-config.yaml     
kubectl apply -f ../kubernetes/eks/configmap/frontend-config.yaml   

# Create secrets
kubectl apply -f ../kubernetes/eks/secrets/api-secret.yaml  

# Create deployments
kubectl apply -f ../kubernetes/eks/deploy/backend.yaml    
kubectl apply -f ../kubernetes/eks/deploy/frontend.yaml  

# Create services
kubectl apply -f ../kubernetes/eks/svc/backend.yaml    
kubectl apply -f ../kubernetes/eks/svc/frontend.yaml  

# Install AWS Load Balancer Controller add-on
# create new IAM OIDC provider
eksctl utils associate-iam-oidc-provider --cluster $cluster_name --approve 
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.4/docs/install/iam_policy.json # download policy template for controller
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
# instll cert manager
kubectl apply \
    --validate=false \
    -f https://github.com/jetstack/cert-manager/releases/download/v1.13.3/cert-manager.yaml
# wait for cert manager resources to be available
sleep 120
# download controller spec
curl -Lo v2_5_4_full.yaml https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/download/v2.5.4/v2_5_4_full.yaml 
# modify the controller spec if downloaded v2_5_4
sed -i.bak -e '596,604d' ./v2_5_4_full.yaml
# (optional) use privately uploaded aws-load-balancer-controller image
# sed -i.bak -e 's|public.ecr.aws/eks/aws-load-balancer-controller|$AWS_ACCOUNT_ID.dkr.ecr.region-code.amazonaws.com/eks/aws-load-balancer-controller|' ./v2_5_4_full.yaml

# install load balancer controller
kubectl apply -f v2_5_4_full.yaml

# install load balancer controller ingress class
curl -Lo v2_5_4_ingclass.yaml https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/download/v2.5.4/v2_5_4_ingclass.yaml
kubectl apply -f v2_5_4_ingclass.yaml

# TODO: Add script that automates this quick fix: https://github.com/kubernetes-sigs/aws-load-balancer-controller/issues/2289#issuecomment-1953389964k

# create new ingress
kubectl apply -f ../kubernetes/eks/ing/main-ingress.yaml   

rm iam_policy.json v2_5_4_full.yaml v2_5_4_full.yaml.bak v2_5_4_ingclass.yaml
