#!/bin/bash

helm uninstall ai-flash-cards -n ai-flash-cards
# sh ./common/uninstall-ai-flash-cards-with-manifests.sh "docker-desktop"

helm uninstall kube-prometheus-stack -n monitoring
helm uninstall argocd -n argocd

# Delete ingress controller
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=delete pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Delete TLS secret
kubectl delete secret nginx-ingress-cert

# Delete namespaces
kubectl delete ns ai-flash-cards
kubectl delete ns monitoring  