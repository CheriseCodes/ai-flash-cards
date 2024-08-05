#!/bin/bash
ENV=$1

# Delete config and secrets
kubectl delete -f "../kubernetes/$ENV/configmap/frontend-config.yaml"
kubectl delete -f "../kubernetes/$ENV/configmap/backend-config.yaml"
kubectl delete -f "../kubernetes/$ENV/secrets/api-secret.yaml"

kubectl delete -f "../kubernetes/$ENV/deploy/frontend.yaml"
kubectl delete -f "../kubernetes/$ENV/deploy/backend.yaml"
kubectl delete -f "../kubernetes/$ENV/svc/frontend.yaml"
kubectl delete -f "../kubernetes/$ENV/svc/backend.yaml"

# Delete ingress
kubectl delete -f "../kubernetes/$ENV/ing/main-ingress.yaml"
