# install ingress controller
INGRESS_HOST=$1

# Install ingress controller
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx --create-namespace
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Set up TLS
# Create self-signed certificate
# WARNING: Will give the error NET::ERR_CERT_AUTHORITY_INVALID but is sufficient for development purposes
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx-ingress.key -out nginx-ingress.crt -subj "/CN=$INGRESS_HOST/O=$INGRESS_HOST" -addext "subjectAltName = DNS:$INGRESS_HOST"
kubectl  -n ai-flash-cards create secret tls nginx-ingress-cert --key nginx-ingress.key --cert nginx-ingress.crt

# set namespace for argocd
kubectl config set-context --current --namespace=argocd
argocd login localhost:8080 --username admin --password PASSWORD
argocd app create -f application.yaml
argocd app sync ai-flash-cards
