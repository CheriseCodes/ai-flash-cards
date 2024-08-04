#!/bin/bash
# Install Kube Prometheus Stack (includes Prometheus, Grafana, and Alert Manager)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Using version 59.1.0 because it uses the same Grafana version as AWS
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack --version 59.1.0 --values ../helm/kube-prometheus-stack/shared-values.yaml --namespace monitoring --create-namespace

# # (Optional) Forward to local port as needed
# kubectl port-forward -n monitoring service/kube-prometheus-stack-grafana 3000:80
# kubectl port-forward -n monitoring service/prometheus-operated  9090:9090
# kubectl port-forward -n monitoring service/kube-prometheus-stack-prometheus-node-exporter  9100:9100
