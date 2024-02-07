# Running minikube application

## MacOS

1. Deploy all kubernetes resources
2. Expose frontend service `minikube service frontend-service --url`
3. Expose backend service `minikube service backend-service --url`
4. Create tunnel for ingress `minikube tunnel`
5. Add `127.0.0.1    ai-flash-cards-feb-4-2024.info` to `/etc/hosts` file
6. Visit website at `https://ai-flash-cards-feb-4-2024.info` (HTTPS is required)