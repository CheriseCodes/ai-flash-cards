INGRESS_HOST=$1

# Deploy config and secrets
kubectl apply -f configmap/frontend-config.yaml -n ai-flash-cards
kubectl apply -f configmap/backend-config.yaml -n ai-flash-cards
kubectl apply -f secrets/api-secret.yaml -n ai-flash-cards

kubectl apply -f deploy/frontend.yaml -n ai-flash-cards
kubectl apply -f deploy/backend.yaml -n ai-flash-cards
kubectl apply -f svc/frontend.yaml -n ai-flash-cards
kubectl apply -f svc/backend.yaml -n ai-flash-cards
# Install ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Set up TLS
# Create self-signed certificate
# WARNING: Will give the error NET::ERR_CERT_AUTHORITY_INVALID but is sufficient for development purposes
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx-ingress.key -out nginx-ingress.crt -subj "/CN=$INGRESS_HOST/O=$INGRESS_HOST" -addext "subjectAltName = DNS:$INGRESS_HOST"
kubectl create secret tls nginx-ingress-cert --key nginx-ingress.key --cert nginx-ingress.crt -n ai-flash-cards 

# Deploy ingress
kubectl apply -f ing/main-ingress.yaml -n ai-flash-cards

# Forward to local port as needed
# (Optional) kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8080:80
