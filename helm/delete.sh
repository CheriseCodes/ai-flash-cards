#!/bin/bash
# Uninstall apps before deleting namespaces to prevent namespace deletion getting stuck
helm uninstall -n monitoring kube-prometheus-stack
helm uninstall -n ai-flash-cards
helm uninstall -n ingress-nginx ingress-nginx
helm plugin uninstall diff

# Delete namespaces
kubectl delete ns monitoring 
kubectl delete ns ingress-nginx
kubectl delete ns ai-flash-cards