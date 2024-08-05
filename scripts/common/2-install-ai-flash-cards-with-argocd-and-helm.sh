#!/bin/bash
# Install argocd
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Set namespace to argocd for using argocd cli
kubectl config set-context --current --namespace=argocd
PASSWORD=$(argocd admin initial-password -n argocd | head -n 1)
argocd login localhost:8080 --username admin --password $PASSWORD --insecure # TODO: Add ACM config so don't need to use insecure
kubectl create ns ai-flash-cards
argocd app create -f ../argocd/application.yaml
argocd app sync ai-flash-cards

# # (Optional) Forward to local port as needed
# kubectl port-forward -n argocd service/argocd-server -n argocd 8080:443