# Create an EKS cluster
cluster_name=ai-flash-cards
AWS_ACCOUNT_ID=$1
AWS_REGION=$2
# Min instance size is t3.medium
eksctl create cluster --name $cluster_name --region $AWS_REGION --nodegroup-name node-group --node-type t3.large --nodes 1 --nodes-min 1 --nodes-max 1 --managed

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
# install cert manager
kubectl apply \
    --validate=false \
    -f https://github.com/jetstack/cert-manager/releases/download/v1.13.5/cert-manager.yaml
# wait for cert manager resources to be available
sleep 120
# download controller spec
curl -Lo v2_7_2_full.yaml https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/download/v2.7.2/v2_7_2_full.yaml 
# modify the controller spec if downloaded v2_7_2
sed -i.bak -e "s|your-cluster-name|$cluster_name|" ./v2_7_2_full.yaml
# (optional) use privately uploaded aws-load-balancer-controller image
sed -i.bak -e "s|public.ecr.aws/eks/aws-load-balancer-controller|$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/eks/aws-load-balancer-controller|" ./v2_7_2_full.yaml

# install load balancer controller
kubectl apply -f v2_7_2_full.yaml

# install load balancer controller ingress class
curl -Lo v2_7_2_ingclass.yaml https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/download/v2.7.2/v2_7_2_ingclass.yaml
kubectl apply -f v2_7_2_ingclass.yaml

# create new ingress
kubectl apply -f ../kubernetes/eks/ing/main-ingress.yaml   

# Manually enable TLS
# 1. Get domain from AWS
# 2. If a public hosted zone wasn't automatically created, create it
# 3. Request an ACM cert for this domain
# 4. Use ACM to automatically update your hosted zone to use the certificate
# 5. Create an Alias A record that maps to the load balancer's DNS name
# 4. Uncomment TLS annotations on main-ingress.yaml and run `kubectl replace -f main-ingress.yaml`

# Uncomment to clean up downloaded manifests
# rm iam_policy.json v2_7_2_full.yaml v2_7_2_full.yaml.bak v2_7_2_ingclass.yaml aws-load-balancer-webhook-service.yaml aws-load-balancer-webhook-service.yaml.bak
