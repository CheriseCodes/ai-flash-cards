INGRESS_HOST=$1

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
kubectl -n ai-flash-cards create secret tls nginx-ingress-cert --key nginx-ingress.key --cert nginx-ingress.crt 

helm -n ai-flash-cards  upgrade -i ai-flash-cards ../../helm/ai-flash-cards -f ../../helm/ai-flash-cards/self-hosted-k8s-values.yaml --create-namespace

# (Optional) Install Prometheus
# helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
# helm repo update
# Using version 59.1.0 because it uses the same Grafana version as AWS
# helm -n monitoring upgrade -i kube-prometheus-stack prometheus-community/kube-prometheus-stack --version 59.1.0 --values ../../helm/kube-prometheus-stack/docker-desktop-values.yaml  --create-namespace

# (Optional) Forward to local port as needed
# kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80
# kubectl port-forward -n monitoring service/kube-prometheus-stack-grafana 3000:80 
# kubectl port-forward -n monitoring service/prometheus-operated  9090:9090


