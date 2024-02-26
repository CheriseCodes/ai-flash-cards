# Running minikube application

## MacOS

1. Deploy all kubernetes resources. The preferred order is ConfigMaps, Secrets, Deployments, Services, then Ingress.
2. Create tunnel for ingress `minikube tunnel`
3. Add `127.0.0.1    ai-flash-cards-feb-4-2024.info` to `/etc/hosts` file
4. Visit website at `https://ai-flash-cards-feb-4-2024.info` (HTTPS is required)

## Linux

TODO

## Windows

TODO