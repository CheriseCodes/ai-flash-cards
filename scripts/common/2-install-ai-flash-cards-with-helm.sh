#!/bin/bash
# install ai-flash-cards app
helm upgrade  --install ai-flash-cards ../helm/ai-flash-cards --timeout 3600s  --namespace ai-flash-cards --create-namespace --values ../helm/ai-flash-cards/eks-values.yaml
