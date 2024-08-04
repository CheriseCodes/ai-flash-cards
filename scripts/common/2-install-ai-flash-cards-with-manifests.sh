#!/bin/bash
# Install AI Flashcards app
# Create config maps
kubectl apply -f ../kubernetes/eks/configmap/backend-config.yaml     
kubectl apply -f ../kubernetes/eks/configmap/frontend-config.yaml   

# Create secrets
kubectl apply -f ../kubernetes/eks/secrets/api-secret.yaml  

# Create deployments
kubectl apply -f ../kubernetes/eks/deploy/backend.yaml    
kubectl apply -f ../kubernetes/eks/deploy/frontend.yaml  

# Create services
kubectl apply -f ../kubernetes/eks/svc/backend.yaml    
kubectl apply -f ../kubernetes/eks/svc/frontend.yaml  
# Create new ingress
kubectl apply -f ../kubernetes/eks/ing/main-ingress.yaml   
