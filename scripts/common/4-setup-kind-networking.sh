kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8443:443 2>&1 > /dev/null &
echo "The application is now available at https://demo.localdev.me:8443/"