# Create an EKS cluster
cluster_name=ai-flash-cards
AWS_ACCOUNT_ID=$1
AWS_REGION=$2
# Min instance size is t3.medium
eksctl create cluster --name $cluster_name --region $AWS_REGION --nodegroup-name node-group --node-type t3.large --nodes 1 --nodes-min 1 --nodes-max 1 --managed

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


# Start ArgoCD config
# TODO: Check if argocd cli is installed, if not install it

# install argocd
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# create loadbalancer to expose the argocd server
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# enable access through https://localhost:8080
# TODO: Make output go to the background so script can continue
kubectl port-forward svc/argocd-server -n argocd 8080:443

# set namespace to argocd for using argocd cli
kubectl config set-context --current --namespace=argocd
PASSWORD=$(argocd admin initial-password -n argocd | head -n 1)
argocd login localhost:8080 --username admin --password $PASSWORD --insecure # TODO: Add ACM config so don't need to use insecure
kubectl create ns ai-flash-cards
argocd app create -f application.yaml
argocd app sync ai-flash-cards