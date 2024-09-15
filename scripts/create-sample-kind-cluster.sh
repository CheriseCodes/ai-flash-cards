#!/bin/bash

sh ./common/0-create-kind-cluster.sh ../kubernetes/kind/cluster.yaml latest latest
sh ./common/1-install-ingress-nginx-with-helm.sh "demo.localdev.me"
# sh ./common/1-install-ingress-nginx-with-manifests.sh "demo.localdev.me"

sh ./common/2-install-ai-flash-cards-with-helm.sh "docker-desktop"
# sh ./common/2-install-ai-flash-cards-with-argocd-and-helm.sh
# sh ./common/2-install-ai-flash-cards-with-manifests.sh "docker-desktop"

sh ./common/3-install-kube-prometheus-stack.sh 
sh ./common/4-setup-kind-networking.sh