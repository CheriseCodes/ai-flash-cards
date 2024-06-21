INGRESS_HOST=$1

# Install helm-diff plugin
helm plugin install https://github.com/databus23/helm-diff

# Install ingress controller
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx --create-namespace
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Set up TLS
# Only create self-signed certificate if it doesn't exist

INGRESS_KEY_FILE="nginx-ingress.key"
INGRESS_CRT_FILE="nginx-ingress.crt"

if [[ ! -f "$INGRESS_KEY_FILE" ]] && [[ ! -f "$INGRESS_CRT_FILE" ]]
then
    # WARNING: Will give the error NET::ERR_CERT_AUTHORITY_INVALID but is sufficient for development purposes
    echo "[INFO] $FILE1 and $INGRESS_CRT_FILE files don't exist"
    echo "[INFO] Creating new $FILE1 and $INGRESS_CRT_FILE files to create new nginx-ingress-cert secret"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $INGRESS_KEY_FILE -out $INGRESS_CRT_FILE -subj "/CN=$INGRESS_HOST/O=$INGRESS_HOST" -addext "subjectAltName = DNS:$INGRESS_HOST"
    kubectl create secret tls nginx-ingress-cert --key $INGRESS_KEY_FILE --cert $INGRESS_CRT_FILE -n ai-flash-cards 
else
		echo "[WARNING] Won't create TLS secrets because $FILE1 and $INGRESS_CRT_FILE files exist"
fi

helm upgrade  --install ai-flash-cards ./ai-flash-cards --timeout 3600s  --namespace ai-flash-cards --create-namespace

# (Optional) Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
# Using version 59.1.0 because it uses the same Grafana version as AWS
helm -n monitoring upgrade -i kube-prometheus-stack prometheus-community/kube-prometheus-stack --version 59.1.0 --values ./kube-prometheus-stack/docker-desktop-values.yaml  --create-namespace

# # (Optional) Forward to local port as needed
# kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80
# kubectl port-forward -n monitoring service/kube-prometheus-stack-grafana 3000:80
# kubectl port-forward -n monitoring service/prometheus-operated  9090:9090
# kubectl port-forward -n monitoring service/kube-prometheus-stack-prometheus-node-exporter  9100:9100