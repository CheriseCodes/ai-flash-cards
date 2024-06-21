#!/bin/bash
# Uninstall apps before deleting namespaces to prevent namespace deletion getting stuck
helm uninstall -n monitoring kube-prometheus-stack
helm uninstall -n ai-flash-cards ai-flash-cards
helm uninstall -n ingress-nginx ingress-nginx
helm plugin uninstall diff

# Delete resources created outside of helm
kubectl delete -n ai-flash-card secret nginx-ingress-cert

# Delete namespaces
kubectl delete ns monitoring 
kubectl delete ns ingress-nginx
kubectl delete ns ai-flash-cards