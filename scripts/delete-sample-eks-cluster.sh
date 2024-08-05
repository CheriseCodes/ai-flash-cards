EKS_MANIFEST_PATH=$1
AWS_REGION=$2

if [[ -z $EKS_MANIFEST_PATH ]]
then
    echo "[ERROR] Path to EKS manifest name is undefined"
    exit 1
fi

if [[ -z $AWS_REGION ]]
then
    echo "[ERROR] AWS_REGION undefined"
    exit 1
else
    echo "[INFO] Deleting AI Flashcards app in region $AWS_REGION"
fi

helm uninstall kube-prometheus-stack -n monitoring
helm uninstall ai-flash-cards -n ai-flash-cards
helm uninstall aws-load-balancer-controller -n kube-system
kubectl delete serviceaccount aws-load-balancer-controller -n kube-system

CLUSTER_NAME=$(cat $EKS_MANIFEST_PATH | yq .metadata.name)
echo "Deleting stack eksctl-$CLUSTER_NAME-addon-iamserviceaccount-kube-system-aws-load-balancer-controller..." 
aws cloudformation delete-stack --stack-name "eksctl-$CLUSTER_NAME-addon-iamserviceaccount-kube-system-aws-load-balancer-controller" --region $AWS_REGION
sleep 30
echo "Deleting stack eksctl-$CLUSTER_NAME-nodegroup-node-group..."
aws cloudformation delete-stack --stack-name "eksctl-$CLUSTER_NAME-nodegroup-node-group" --region $AWS_REGION
sleep 270
echo "Deleting stack eksctl-$CLUSTER_NAME-addon-vpc-cni.." 
aws cloudformation delete-stack --stack-name "eksctl-$CLUSTER_NAME-addon-vpc-cni" --region $AWS_REGION
sleep 30
echo "Deleting stack eksctl-$CLUSTER_NAME-cluster..."
aws cloudformation delete-stack --stack-name "eksctl-$CLUSTER_NAME-cluster" --region $AWS_REGION