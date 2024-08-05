#!/bin/bash
# NOTE: This is meant to be used with local clusters created with Docker not EKS

INGRESS_HOST=$1

# Install ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Set up TLS
# Create self-signed certificate
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

# Forward to local port as needed
# (Optional) kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8080:80