#!/bin/bash
ENV=$1

# Install AI Flashcards app
# Create config maps
kubectl apply -f "../kubernetes/$ENV/configmap/backend-config.yaml"     
kubectl apply -f "../kubernetes/$ENV/configmap/frontend-config.yaml"   

# Create secrets
kubectl apply -f "../kubernetes/$ENV/secrets/api-secret.yaml"  

# Create deployments
kubectl apply -f "../kubernetes/$ENV/deploy/backend.yaml"    
kubectl apply -f "../kubernetes/$ENV/deploy/frontend.yaml"  

# Create services
kubectl apply -f "../kubernetes/$ENV/svc/backend.yaml"    
kubectl apply -f "../kubernetes/$ENV/svc/frontend.yaml"  
# Create new ingress
kubectl apply -f "../kubernetes/$ENV/ing/main-ingress.yaml"   
