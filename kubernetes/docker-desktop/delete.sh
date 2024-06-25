#!/bin/bash
INGRESS_HOST=$1

# Delete config and secrets
kubectl delete -f configmap/frontend-config.yaml
kubectl delete -f configmap/backend-config.yaml
kubectl delete -f secrets/api-secret.yaml

kubectl delete -f deploy/frontend.yaml
kubectl delete -f deploy/backend.yaml
kubectl delete -f svc/frontend.yaml
kubectl delete -f svc/backend.yaml

# Delete ingress
kubectl delete -f ing/main-ingress.yaml

# Delete ingress controller
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=delete pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Delete TLS
kubectl delete secret tls nginx-ingress-cert --key nginx-ingress.key --cert nginx-ingress.crt 
