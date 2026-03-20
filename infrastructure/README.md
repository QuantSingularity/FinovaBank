# FinovaBank Infrastructure

## Overview

This directory contains the comprehensive infrastructure configuration for FinovaBank, a financial services platform designed to meet the highest standards of security, compliance, and reliability. The infrastructure implements financial-grade security controls and complies with industry regulations including PCI-DSS, GLBA, SOX, and GDPR.

## Directory Structure

```
infrastructure/
├── README.md                 # This file
├── terraform/                # Infrastructure as Code
│   ├── main.tf               # Main Terraform configuration
│   ├── variables.tf          # Variable definitions
│   ├── outputs.tf            # Output definitions
│   ├── terraform.tfvars.example  # Example variables file
│   ├── backend.tf.example    # Backend configuration example
│   ├── user_data.sh          # Application server setup script
│   └── bastion_user_data.sh  # Bastion host setup script
├── ansible/                  # Configuration Management
│   ├── playbook.yml          # Main Ansible playbook
│   ├── inventory.yml         # Inventory configuration (update with actual IPs)
│   ├── inventory.example.yml # Example inventory
│   ├── ansible.cfg           # Ansible configuration
│   └── .vault_pass.example   # Ansible Vault example
├── kubernetes/               # Kubernetes/Helm Configuration
│   ├── Chart.yaml            # Helm chart definition
│   ├── values.yaml           # Default values
│   ├── templates/            # Kubernetes manifest templates
│   │   ├── deployment.yaml   # Deployment resources
│   │   ├── service.yaml      # Service resources
│   │   ├── secret.example.yaml  # Secret template (DO NOT commit actual secrets)
│   │   ├── _helpers.tpl      # Template helpers
│   │   └── tests/            # Helm tests
│   └── README.md             # Kubernetes deployment guide
├── ci-cd/                    # CI/CD Pipelines
│   ├── complete-workflow.yml   # GitHub Actions main workflow
│   ├── backend-workflow.yml    # Backend deployment
│   ├── frontend-workflow.yml   # Frontend deployment
│   ├── scripts/deploy.sh       # Deployment scripts
│   └── README.md               # CI/CD setup guide
├── security/                 # Security Policies
├── compliance/               # Compliance Framework
├── monitoring/               # Monitoring Configuration
├── secrets/                  # Secrets Management Config
└── validation_logs/          # Validation outputs (generated)
```

## Prerequisites

### Required Tools

- **Terraform** >= 1.9.0 ([Install](https://www.terraform.io/downloads.html))
- **Ansible** >= 2.9 ([Install](https://docs.ansible.com/ansible/latest/installation_guide/index.html))
- **AWS CLI** >= 2.0 ([Install](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html))
- **kubectl** >= 1.20 ([Install](https://kubernetes.io/docs/tasks/tools/))
- **Helm** >= 3.0 ([Install](https://helm.sh/docs/intro/install/))
- **yamllint** ([Install](https://yamllint.readthedocs.io/))
- **tflint** ([Install](https://github.com/terraform-linters/tflint)) (optional but recommended)

### AWS Setup

1. **AWS Credentials**: Configure AWS credentials

   ```bash
   aws configure
   # Or use environment variables:
   export AWS_ACCESS_KEY_ID="your-access-key"
   export AWS_SECRET_ACCESS_KEY="your-secret-key"
   export AWS_DEFAULT_REGION="us-west-2"
   ```

2. **EC2 Key Pair**: Create an EC2 key pair in AWS Console

   ```bash
   # Or create via CLI:
   aws ec2 create-key-pair --key-name finovabank-keypair \
     --query 'KeyMaterial' --output text > ~/.ssh/finovabank-keypair.pem
   chmod 400 ~/.ssh/finovabank-keypair.pem
   ```

3. **Required AWS Permissions**: Ensure your IAM user/role has:
   - EC2 full access
   - VPC full access
   - RDS full access
   - S3 full access
   - IAM full access
   - CloudWatch full access
   - KMS full access

## Quick Start

### 1. Terraform - Infrastructure Deployment

```bash
# Navigate to terraform directory
cd terraform/

# Copy and edit variables file
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your actual values:
# - Update admin_cidr_blocks with your IP
# - Update domain_name with your actual domain
# - Update notification emails
nano terraform.tfvars

# Initialize Terraform (for local development - no remote backend)
terraform init -backend=false

# Format and validate configuration
terraform fmt -recursive
terraform validate

# Plan the deployment (review changes)
terraform plan -out=plan.out

# Apply the configuration (WARNING: This creates real AWS resources!)
terraform apply plan.out

# Note the outputs (save these - you'll need them for Ansible)
terraform output
```

### 2. Ansible - Server Configuration

```bash
# Navigate to ansible directory
cd ../ansible/

# Update inventory with actual server IPs from Terraform output
cp inventory.example.yml inventory.yml
# Edit inventory.yml and replace placeholder IPs
nano inventory.yml

# Test connectivity
ansible all -i inventory.yml -m ping

# Run the playbook (dry-run first)
ansible-playbook -i inventory.yml playbook.yml --check

# Apply configuration
ansible-playbook -i inventory.yml playbook.yml
```

### 3. Kubernetes - Application Deployment

```bash
# Navigate to kubernetes directory
cd ../kubernetes/

# Review and customize values
nano values.yaml

# Install/upgrade with Helm
helm install finovabank . --namespace finovabank --create-namespace

# Or upgrade existing deployment
helm upgrade finovabank . --namespace finovabank

# Check deployment status
kubectl get deployments -n finovabank
kubectl get pods -n finovabank
kubectl get services -n finovabank
```

## Validation and Testing

### Terraform Validation

```bash
cd terraform/

# Format check
terraform fmt -check -recursive

# Initialize (local backend)
terraform init -backend=false

# Validate configuration
terraform validate

# Plan with example variables
terraform plan -var-file=terraform.tfvars.example
```

### Ansible Validation

```bash
cd ansible/

# Syntax check
ansible-playbook -i inventory.yml playbook.yml --syntax-check

# Lint playbook
ansible-lint playbook.yml

# YAML lint
yamllint playbook.yml inventory.yml
```

### Kubernetes Validation

```bash
cd kubernetes/

# Lint Helm chart
helm lint .

# Dry-run deployment
helm install finovabank . --dry-run --debug

# Template and validate
helm template finovabank . | kubectl apply --dry-run=client -f -

# YAML lint
yamllint values.yaml templates/
```

### CI/CD Validation

```bash
cd ci-cd/

# YAML lint workflows
yamllint *.yml

# Test with act (GitHub Actions locally)
act -n  # Dry run
```

## Security Best Practices

### Secret Management

1. **Terraform Secrets**:
   - NEVER commit `terraform.tfvars` to version control
   - Use AWS Secrets Manager or Parameter Store for sensitive values
   - Consider using `terraform.tfvars.json` with `.gitignore`

2. **Ansible Secrets**:
   - Use Ansible Vault for encrypting sensitive data
   - Store vault password securely (not in repo)
   - Example: `ansible-vault encrypt_string 'secret' --name 'var_name'`

3. **Kubernetes Secrets**:
   - NEVER commit `secret.yaml` files
   - Use external secret management (AWS Secrets Manager, Vault)
   - Consider using sealed-secrets or external-secrets operator

4. **CI/CD Secrets**:
   - Use GitHub Secrets for sensitive environment variables
   - Rotate credentials regularly
   - Mask secrets in logs

### Network Security

- Bastion host is the only entry point for SSH access
- Application servers are in private subnets
- Database is in isolated database subnets
- Security groups follow principle of least privilege
- WAF protects public-facing load balancer

## Monitoring and Logging

### CloudWatch Integration

- All resources send logs to CloudWatch
- Custom metrics for application monitoring
- Alarms configured for critical thresholds
- Log retention: ~7 years (2557 days) for compliance

### Access Logs

- ALB access logs → S3
- VPC Flow Logs → CloudWatch
- Application logs → CloudWatch
- Audit logs → CloudWatch (encrypted)

## Backup and Disaster Recovery

### Automated Backups

- RDS: 30-day backup retention
- EBS volumes: Daily snapshots via AWS Backup
- S3 logs: Versioned with lifecycle policies
- Backup retention: ~7 years (2557 days)

### Disaster Recovery

- Multi-AZ deployment for high availability
- Read replica for RDS
- Regular backup testing (monthly)
- RTO: 4 hours, RPO: 1 hour

## Compliance

### Regulatory Requirements

- **PCI-DSS v4.0**: Payment card data protection
- **GLBA**: Customer information protection
- **SOX**: IT general controls
- **GDPR**: Data protection principles

### Audit Trail

- All administrative actions logged
- Immutable audit logs
- 7-year retention period
- Regular compliance assessments

## Troubleshooting

### Common Issues

1. **Terraform State Lock**:

   ```bash
   # If using remote backend with DynamoDB locking
   terraform force-unlock <LOCK_ID>
   ```

2. **Ansible Connection Refused**:

   ```bash
   # Test SSH connectivity
   ssh -i ~/.ssh/finovabank-keypair.pem ubuntu@<instance-ip>

   # Check security groups allow SSH from bastion
   ```

3. **Kubernetes Pod CrashLoopBackOff**:

   ```bash
   # Check logs
   kubectl logs <pod-name> -n finovabank

   # Describe pod for events
   kubectl describe pod <pod-name> -n finovabank
   ```

4. **RDS Connection Timeout**:
   - Verify security groups allow connection from app servers
   - Check VPC routing tables
   - Verify RDS is in correct subnet group

### Log Locations

- **Terraform**: `./terraform/.terraform/`
- **Ansible**: `/var/log/ansible.log` (if writable)
- **CloudWatch**: AWS Console → CloudWatch → Log Groups
- **Application**: `/var/log/finovabank/`

## Cleanup

### Destroy Infrastructure

**WARNING**: This will delete all resources and data!

```bash
# Terraform destroy
cd terraform/
terraform destroy

# Clean up Kubernetes resources
helm uninstall finovabank -n finovabank
kubectl delete namespace finovabank

# Clean up S3 buckets (if not emptied automatically)
aws s3 rm s3://finovabank-logs-<suffix> --recursive
aws s3 rb s3://finovabank-logs-<suffix>
```

## License

See LICENSE file in repository root.
