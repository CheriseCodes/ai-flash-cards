# Create a standard cluster with all required components
eksctl create cluster --name ai-flash-cards-cluster --region ca-central-1 --fargate
eksctl create iamidentitymapping \
    --cluster ai-flash-cards-cluster \
    --region ca-central-1 \
    --arn $CLI_ROLE_ARN \
    --group system:masters \
    --no-duplicate-arns \
    --username admin-user1
aws eks update-kubeconfig --region ca-central-1 --name ai-flash-cards-cluster          