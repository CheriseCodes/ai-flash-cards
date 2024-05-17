INGRESS_HOST=$1

# Deploy config and secrets
kubectl create -f configmap/frontend-config.yaml
kubectl create -f configmap/backend-config.yaml
kubectl create -f secrets/api-secret.yaml

kubectl create -f deploy/frontend.yaml
kubectl create -f deploy/backend.yaml
kubectl create -f svc/frontend.yaml
kubectl create -f svc/backend.yaml
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
kubectl create secret tls nginx-ingress-cert --key nginx-ingress.key --cert nginx-ingress.crt 

# Deploy ingress
kubectl create -f ing/main-ingress.yaml

# Forward to local port as needed
# (Optional) kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8080:80
