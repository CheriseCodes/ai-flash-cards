#!/bin/bash
INGRESS_HOST=$1

if [[ -z $INGRESS_HOST ]]
then
    echo "[ERROR] Ingress hostname undefined. Please pass it as the first parameter."
    exit 1
else
    echo "[INFO] Creating AI Flashcards app at https://$INGRESS_HOST"
fi

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
    echo "[INFO] One of $INGRESS_KEY_FILE or $INGRESS_CRT_FILE doesn't exist"
    echo "[INFO] Creating new $INGRESS_KEY_FILE and $INGRESS_CRT_FILE files to create new nginx-ingress-cert secret"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $INGRESS_KEY_FILE -out $INGRESS_CRT_FILE -subj "/CN=$INGRESS_HOST/O=$INGRESS_HOST" -addext "subjectAltName = DNS:$INGRESS_HOST"
    kubectl create secret tls nginx-ingress-cert --key $INGRESS_KEY_FILE --cert $INGRESS_CRT_FILE -n ai-flash-cards 
else
	echo "[WARNING] Won't create TLS secrets because $INGRESS_KEY_FILE and $INGRESS_CRT_FILE files exist"
fi

helm upgrade  --install ai-flash-cards ./ai-flash-cards --timeout 3600s  --namespace ai-flash-cards --create-namespace --values ./ai-flash-cards/docker-desktop-values.yaml

# (Optional) Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Using version 59.1.0 because it uses the same Grafana version as AWS
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack --version 59.1.0 --values ./kube-prometheus-stack/shared-values.yaml --namespace monitoring --create-namespace

# # (Optional) Forward to local port as needed
# kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80
# kubectl port-forward -n monitoring service/kube-prometheus-stack-grafana 3000:80
# kubectl port-forward -n monitoring service/prometheus-operated  9090:9090
# kubectl port-forward -n monitoring service/kube-prometheus-stack-prometheus-node-exporter  9100:9100