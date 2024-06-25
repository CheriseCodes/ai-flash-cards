#!/bin/bash
# Uninstall apps before deleting namespaces to prevent namespace deletion getting stuck
helm uninstall -n monitoring kube-prometheus-stack
helm uninstall -n ai-flash-cards ai-flash-cards
helm uninstall aws-load-balancer-controller
helm plugin uninstall diff

# Delete resources created outside of helm
kubectl delete -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Delete namespaces
kubectl delete ns monitoring 
kubectl delete ns ingress-nginx
kubectl delete ns ai-flash-cards
kubectl delete ns argocd
