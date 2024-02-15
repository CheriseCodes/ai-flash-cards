# Create an EKS cluster
eksctl create cluster --name ai-flash-cards --region ca-central-1 --nodegroup-name node-group --node-type t3.small --nodes 1 --nodes-min 1 --nodes-max 1 --managed

# Create config maps
kubectl apply -f ../kubernetes/eks/configmap/backend-config.yaml     

# Create secrets
kubectl apply -f ../kubernetes/eks/secrets/api-secret.yaml  

# Create deployments
kubectl apply -f ../kubernetes/eks/deploy/backend.yaml    
kubectl apply -f ../kubernetes/eks/deploy/frontend.yaml  

# Create services
kubectl apply -f ../kubernetes/eks/svc/backend.yaml    
kubectl apply -f ../kubernetes/eks/svc/frontend.yaml  

# Create nginx ingress
# TODO: Try AWS native load balancer https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/examples/echo_server/
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml
kubectl apply -f ../kubernetes/eks/ing/main-ingress.yaml   
