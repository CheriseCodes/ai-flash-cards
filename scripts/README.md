# Automatically create and provision the cluster

This directory holds scripts that automatically create (if needed) and provisions a Kubernetes cluster running the AI Flashcards app. For now, the scripts only support creating a cluster on Docker Desktop Kubernetes or EKS (Amazon Elastic Kubernetes Service).

The `common` folder contains scripts that can be resued to build different kinds of clusters. The number at the beginning indicates the order that the scripts should be run in. For example, every script that starts with `1-` should be ran after any script starting with `0-`.

Scripts that aren't in the `common` folder and don't start with a number provide examples of how to use the common scripts to create Kubernetes clusters.

Sensitive data is left undefined to follow Git best-practices. However, the following configuration files should be filled in before running the scripts.

## EKS 

For scripts that run on Amazon EKS, make sure that the following configuration files are configured correctly:

1. (Required) `../kubernetes/eks/cluster/cluster.yaml`: EKSCTL.io configuration of a EKS cluster
2. (Optional) `../helm/ai-flash-cards/eks-values.yaml`: Helm configuration of the AI Flashcards app.
3. (Optional) `../argocd/application.yaml`: Installs AI Flashcards as a ArgoCD application using Helm
4. (Optional) `../kubernetes/eks/**`: Kubernetes manifest configuration of the AI Flashcards app
4. (Optional) `../helm/kube-prometheus-stack/shared-values.yaml`: Helm configuration for installing Prometheus, Grafana, and Alert Manager

## Docker Desktop

For scripts that run on Docker Desktop, make sure that the following configuration files are configured correctly:

1. (Optional) `../helm/ai-flash-cards/docker-desktop-values.yaml`: Helm configuration of the AI Flashcards app
2. (Optional) `../kubernetes/docker-desktop/**`: Kubernetes manifest configuration of the AI Flashcards app
3. (Optional) `../argocd/application.yaml`: Installs AI Flashcards as a ArgoCD application using Helm
4. (Optional) `../helm/kube-prometheus-stack/shared-values.yaml`: Helm configuration for installing Prometheus, Grafana, and Alert Manager