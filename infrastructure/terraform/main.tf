# FinovaBank Infrastructure - Terraform Configuration
# This configuration implements a comprehensive, secure, and compliant infrastructure
# for financial services, adhering to industry standards and best practices.

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }

  # Backend configuration for state management with encryption
  backend "s3" {
    bucket         = "finovabank-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
    versioning     = true
  }
}

# Provider configuration with default tags for compliance
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project            = "FinovaBank"
      Environment        = var.environment
      Owner              = "Infrastructure Team"
      CostCenter         = "IT-Infrastructure"
      ComplianceLevel    = "Financial-Grade"
      DataClassification = "Confidential"
      BackupRequired     = "true"
      MonitoringRequired = "true"
      CreatedBy          = "Terraform"
      LastModified       = "managed-by-terraform"
    }
  }
}

# Random password generation for database credentials
resource "random_password" "db_password" {
  length  = 32
  special = true
  upper   = true
  lower   = true
  numeric = true
}

# Data sources for availability zones and AMI
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# KMS Key for encryption at rest
resource "aws_kms_key" "finova_kms" {
  description             = "FinovaBank KMS key for encryption at rest"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow CloudWatch Logs"
        Effect = "Allow"
        Principal = {
          Service = "logs.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name       = "FinovaBank-KMS-Key"
    Purpose    = "Encryption-at-Rest"
    Compliance = "GLBA-PCI-DSS"
  }
}

resource "aws_kms_alias" "finova_kms_alias" {
  name          = "alias/finovabank-encryption"
  target_key_id = aws_kms_key.finova_kms.key_id
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# VPC Configuration with proper CIDR segmentation
resource "aws_vpc" "finova_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name               = "FinovaBank-VPC"
    NetworkTier        = "Production"
    SecurityLevel      = "High"
    ComplianceRequired = "true"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "finova_igw" {
  vpc_id = aws_vpc.finova_vpc.id

  tags = {
    Name = "FinovaBank-IGW"
  }
}

# NAT Gateway for private subnet internet access
resource "aws_eip" "nat_eip" {
  count  = length(var.private_subnet_cidrs)
  domain = "vpc"

  depends_on = [aws_internet_gateway.finova_igw]

  tags = {
    Name = "FinovaBank-NAT-EIP-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "finova_nat" {
  count         = length(var.private_subnet_cidrs)
  allocation_id = aws_eip.nat_eip[count.index].id
  subnet_id     = aws_subnet.public_subnets[count.index].id

  depends_on = [aws_internet_gateway.finova_igw]

  tags = {
    Name = "FinovaBank-NAT-${count.index + 1}"
  }
}

# Public Subnets for load balancers and bastion hosts
resource "aws_subnet" "public_subnets" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.finova_vpc.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                     = "FinovaBank-Public-Subnet-${count.index + 1}"
    Type                     = "Public"
    "kubernetes.io/role/elb" = "1"
  }
}

# Private Subnets for application servers
resource "aws_subnet" "private_subnets" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.finova_vpc.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name                              = "FinovaBank-Private-Subnet-${count.index + 1}"
    Type                              = "Private"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# Database Subnets for RDS instances
resource "aws_subnet" "database_subnets" {
  count             = length(var.database_subnet_cidrs)
  vpc_id            = aws_vpc.finova_vpc.id
  cidr_block        = var.database_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "FinovaBank-Database-Subnet-${count.index + 1}"
    Type = "Database"
  }
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.finova_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.finova_igw.id
  }

  tags = {
    Name = "FinovaBank-Public-RT"
  }
}

resource "aws_route_table" "private_rt" {
  count  = length(var.private_subnet_cidrs)
  vpc_id = aws_vpc.finova_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.finova_nat[count.index].id
  }

  tags = {
    Name = "FinovaBank-Private-RT-${count.index + 1}"
  }
}

resource "aws_route_table" "database_rt" {
  vpc_id = aws_vpc.finova_vpc.id

  tags = {
    Name = "FinovaBank-Database-RT"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_rta" {
  count          = length(aws_subnet.public_subnets)
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_rta" {
  count          = length(aws_subnet.private_subnets)
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_rt[count.index].id
}

resource "aws_route_table_association" "database_rta" {
  count          = length(aws_subnet.database_subnets)
  subnet_id      = aws_subnet.database_subnets[count.index].id
  route_table_id = aws_route_table.database_rt.id
}

# Security Groups with financial-grade security rules
resource "aws_security_group" "alb_sg" {
  name_prefix = "finova-alb-sg"
  vpc_id      = aws_vpc.finova_vpc.id
  description = "Security group for Application Load Balancer"

  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP redirect to HTTPS"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "FinovaBank-ALB-SG"
    Purpose    = "Load-Balancer-Security"
    Compliance = "PCI-DSS"
  }
}

resource "aws_security_group" "app_sg" {
  name_prefix = "finova-app-sg"
  vpc_id      = aws_vpc.finova_vpc.id
  description = "Security group for application servers"

  ingress {
    description     = "HTTP from ALB"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    description     = "SSH from bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "FinovaBank-App-SG"
    Purpose    = "Application-Server-Security"
    Compliance = "PCI-DSS"
  }
}

resource "aws_security_group" "database_sg" {
  name_prefix = "finova-db-sg"
  vpc_id      = aws_vpc.finova_vpc.id
  description = "Security group for database servers"

  ingress {
    description     = "MySQL/Aurora from app servers"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }

  ingress {
    description     = "PostgreSQL from app servers"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "FinovaBank-DB-SG"
    Purpose    = "Database-Security"
    Compliance = "PCI-DSS-GLBA"
  }
}

resource "aws_security_group" "bastion_sg" {
  name_prefix = "finova-bastion-sg"
  vpc_id      = aws_vpc.finova_vpc.id
  description = "Security group for bastion host"

  ingress {
    description = "SSH from admin networks"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.admin_cidr_blocks
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "FinovaBank-Bastion-SG"
    Purpose    = "Bastion-Host-Security"
    Compliance = "Administrative-Access"
  }
}

# Database Subnet Group
resource "aws_db_subnet_group" "finova_db_subnet_group" {
  name       = "finova-db-subnet-group"
  subnet_ids = aws_subnet.database_subnets[*].id

  tags = {
    Name       = "FinovaBank-DB-Subnet-Group"
    Purpose    = "Database-Networking"
    Compliance = "Data-Isolation"
  }
}

# RDS Parameter Group for enhanced security
resource "aws_db_parameter_group" "finova_db_params" {
  family = "mysql8.0"
  name   = "finova-mysql-params"

  parameter {
    name  = "slow_query_log"
    value = "1"
  }

  parameter {
    name  = "log_queries_not_using_indexes"
    value = "1"
  }

  parameter {
    name  = "innodb_file_per_table"
    value = "1"
  }

  parameter {
    name  = "binlog_format"
    value = "ROW"
  }

  tags = {
    Name       = "FinovaBank-DB-Parameters"
    Purpose    = "Database-Security-Config"
    Compliance = "Audit-Logging"
  }
}

# RDS Instance with encryption and backup
resource "aws_db_instance" "finova_primary_db" {
  identifier     = "finovabank-primary-db"
  engine         = "mysql"
  engine_version = "8.0.35"
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.finova_kms.arn

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result

  vpc_security_group_ids = [aws_security_group.database_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.finova_db_subnet_group.name
  parameter_group_name   = aws_db_parameter_group.finova_db_params.name

  backup_retention_period = 30
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  skip_final_snapshot       = false
  final_snapshot_identifier = "finovabank-primary-db-final-snapshot"
  copy_tags_to_snapshot     = true

  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring_role.arn

  enabled_cloudwatch_logs_exports = ["error", "general", "slowquery"]

  deletion_protection = true

  tags = {
    Name            = "FinovaBank-Primary-Database"
    Purpose         = "Primary-Application-Database"
    Compliance      = "PCI-DSS-GLBA"
    BackupRequired  = "true"
    EncryptionLevel = "AES-256"
  }
}

# RDS Read Replica for performance and disaster recovery
resource "aws_db_instance" "finova_read_replica" {
  identifier          = "finovabank-read-replica"
  replicate_source_db = aws_db_instance.finova_primary_db.identifier
  instance_class      = var.db_replica_instance_class

  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring_role.arn

  tags = {
    Name       = "FinovaBank-Read-Replica"
    Purpose    = "Read-Performance-DR"
    Compliance = "High-Availability"
  }
}

# IAM Role for RDS Enhanced Monitoring
resource "aws_iam_role" "rds_monitoring_role" {
  name = "rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring_policy" {
  role       = aws_iam_role.rds_monitoring_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Application Load Balancer
resource "aws_lb" "finova_alb" {
  name               = "finovabank-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public_subnets[*].id

  enable_deletion_protection = true
  enable_http2               = true
  drop_invalid_header_fields = true

  access_logs {
    bucket  = aws_s3_bucket.finova_logs.bucket
    prefix  = "alb-access-logs"
    enabled = true
  }

  tags = {
    Name       = "FinovaBank-ALB"
    Purpose    = "Load-Balancing"
    Compliance = "High-Availability"
  }
}

# Target Group for application servers
resource "aws_lb_target_group" "finova_app_tg" {
  name     = "finovabank-app-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = aws_vpc.finova_vpc.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  tags = {
    Name       = "FinovaBank-App-TG"
    Purpose    = "Application-Target-Group"
    Compliance = "Load-Distribution"
  }
}

# ALB Listener for HTTPS
resource "aws_lb_listener" "finova_https_listener" {
  load_balancer_arn = aws_lb.finova_alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.finova_cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.finova_app_tg.arn
  }
}

# ALB Listener for HTTP redirect to HTTPS
resource "aws_lb_listener" "finova_http_listener" {
  load_balancer_arn = aws_lb.finova_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ACM Certificate for HTTPS
resource "aws_acm_certificate" "finova_cert" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name       = "FinovaBank-SSL-Certificate"
    Purpose    = "HTTPS-Encryption"
    Compliance = "Data-in-Transit-Protection"
  }
}

# S3 Bucket for logs with encryption and versioning
resource "aws_s3_bucket" "finova_logs" {
  bucket = "finovabank-logs-${random_id.bucket_suffix.hex}"

  tags = {
    Name       = "FinovaBank-Logs-Bucket"
    Purpose    = "Centralized-Logging"
    Compliance = "Audit-Trail"
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 8
}

resource "aws_s3_bucket_versioning" "finova_logs_versioning" {
  bucket = aws_s3_bucket.finova_logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "finova_logs_encryption" {
  bucket = aws_s3_bucket.finova_logs.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.finova_kms.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "finova_logs_pab" {
  bucket = aws_s3_bucket.finova_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "finova_logs_lifecycle" {
  bucket = aws_s3_bucket.finova_logs.id

  rule {
    id     = "log_retention"
    status = "Enabled"

    filter {
      prefix = ""
    }

    expiration {
      days = 2557  # ~7 years for financial compliance
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# CloudWatch Log Groups for centralized logging
resource "aws_cloudwatch_log_group" "finova_app_logs" {
  name              = "/aws/ec2/finovabank/application"
  retention_in_days = 2557  # ~7 years (closest valid value)
  kms_key_id        = aws_kms_key.finova_kms.arn

  tags = {
    Name       = "FinovaBank-Application-Logs"
    Purpose    = "Application-Logging"
    Compliance = "Audit-Trail"
  }
}

resource "aws_cloudwatch_log_group" "finova_security_logs" {
  name              = "/aws/ec2/finovabank/security"
  retention_in_days = 2557  # ~7 years (closest valid value)
  kms_key_id        = aws_kms_key.finova_kms.arn

  tags = {
    Name       = "FinovaBank-Security-Logs"
    Purpose    = "Security-Event-Logging"
    Compliance = "Security-Monitoring"
  }
}

# Launch Template for application servers
resource "aws_launch_template" "finova_app_lt" {
  name_prefix   = "finovabank-app-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.app_instance_type

  vpc_security_group_ids = [aws_security_group.app_sg.id]

  iam_instance_profile {
    name = aws_iam_instance_profile.finova_app_profile.name
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    cloudwatch_log_group = aws_cloudwatch_log_group.finova_app_logs.name
    region               = var.aws_region
  }))

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 20
      volume_type           = "gp3"
      encrypted             = true
      kms_key_id            = aws_kms_key.finova_kms.arn
      delete_on_termination = true
    }
  }

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name       = "FinovaBank-App-Server"
      Purpose    = "Application-Server"
      Compliance = "PCI-DSS"
    }
  }

  tags = {
    Name       = "FinovaBank-App-Launch-Template"
    Purpose    = "Auto-Scaling-Template"
    Compliance = "Standardized-Deployment"
  }
}

# Auto Scaling Group for application servers
resource "aws_autoscaling_group" "finova_app_asg" {
  name                      = "finovabank-app-asg"
  vpc_zone_identifier       = aws_subnet.private_subnets[*].id
  target_group_arns         = [aws_lb_target_group.finova_app_tg.arn]
  health_check_type         = "ELB"
  health_check_grace_period = 300

  min_size         = var.asg_min_size
  max_size         = var.asg_max_size
  desired_capacity = var.asg_desired_capacity

  launch_template {
    id      = aws_launch_template.finova_app_lt.id
    version = "$Latest"
  }

  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupTotalInstances"
  ]

  tag {
    key                 = "Name"
    value               = "FinovaBank-App-ASG"
    propagate_at_launch = true
  }

  tag {
    key                 = "Purpose"
    value               = "Auto-Scaling-Group"
    propagate_at_launch = true
  }

  tag {
    key                 = "Compliance"
    value               = "High-Availability"
    propagate_at_launch = true
  }
}

# IAM Role for EC2 instances
resource "aws_iam_role" "finova_app_role" {
  name = "finovabank-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_instance_profile" "finova_app_profile" {
  name = "finovabank-app-profile"
  role = aws_iam_role.finova_app_role.name
}

# IAM Policy for CloudWatch Logs
resource "aws_iam_role_policy" "finova_app_cloudwatch_policy" {
  name = "finovabank-app-cloudwatch-policy"
  role = aws_iam_role.finova_app_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = [
          aws_cloudwatch_log_group.finova_app_logs.arn,
          "${aws_cloudwatch_log_group.finova_app_logs.arn}:*",
          aws_cloudwatch_log_group.finova_security_logs.arn,
          "${aws_cloudwatch_log_group.finova_security_logs.arn}:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "ec2:DescribeVolumes",
          "ec2:DescribeTags"
        ]
        Resource = "*"
      }
    ]
  })
}

# Bastion Host for secure administrative access
resource "aws_instance" "finova_bastion" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public_subnets[0].id
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]
  key_name               = var.key_pair_name

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 10
    encrypted             = true
    kms_key_id            = aws_kms_key.finova_kms.arn
    delete_on_termination = true
  }

  user_data = base64encode(templatefile("${path.module}/bastion_user_data.sh", {
    cloudwatch_log_group = aws_cloudwatch_log_group.finova_security_logs.name
    region               = var.aws_region
  }))

  tags = {
    Name       = "FinovaBank-Bastion-Host"
    Purpose    = "Secure-Administrative-Access"
    Compliance = "Administrative-Controls"
  }
}

# CloudWatch Alarms for monitoring
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "finovabank-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ec2 cpu utilization"
  alarm_actions       = [aws_sns_topic.finova_alerts.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.finova_app_asg.name
  }

  tags = {
    Name       = "FinovaBank-High-CPU-Alarm"
    Purpose    = "Performance-Monitoring"
    Compliance = "Operational-Monitoring"
  }
}

resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  alarm_name          = "finovabank-database-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "120"
  statistic           = "Average"
  threshold           = "75"
  alarm_description   = "This metric monitors RDS cpu utilization"
  alarm_actions       = [aws_sns_topic.finova_alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.finova_primary_db.id
  }

  tags = {
    Name       = "FinovaBank-Database-CPU-Alarm"
    Purpose    = "Database-Performance-Monitoring"
    Compliance = "Database-Monitoring"
  }
}

# SNS Topic for alerts
resource "aws_sns_topic" "finova_alerts" {
  name              = "finovabank-alerts"
  kms_master_key_id = aws_kms_key.finova_kms.id

  tags = {
    Name       = "FinovaBank-Alerts-Topic"
    Purpose    = "Alert-Notifications"
    Compliance = "Incident-Response"
  }
}

# WAF Web ACL for application protection
resource "aws_wafv2_web_acl" "finova_waf" {
  name  = "finovabank-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "KnownBadInputsRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "SQLiRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "finovabankWAF"
    sampled_requests_enabled   = true
  }

  tags = {
    Name       = "FinovaBank-WAF"
    Purpose    = "Web-Application-Firewall"
    Compliance = "Security-Protection"
  }
}

# Associate WAF with ALB
resource "aws_wafv2_web_acl_association" "finova_waf_association" {
  resource_arn = aws_lb.finova_alb.arn
  web_acl_arn  = aws_wafv2_web_acl.finova_waf.arn
}

# Backup Vault for AWS Backup
resource "aws_backup_vault" "finova_backup_vault" {
  name        = "finovabank-backup-vault"
  kms_key_arn = aws_kms_key.finova_kms.arn

  tags = {
    Name       = "FinovaBank-Backup-Vault"
    Purpose    = "Data-Protection"
    Compliance = "Business-Continuity"
  }
}

# Backup Plan
resource "aws_backup_plan" "finova_backup_plan" {
  name = "finovabank-backup-plan"

  rule {
    rule_name         = "daily_backup"
    target_vault_name = aws_backup_vault.finova_backup_vault.name
    schedule          = "cron(0 5 ? * * *)" # Daily at 5 AM UTC

    start_window      = 480   # 8 hours
    completion_window = 10080 # 7 days

    lifecycle {
      cold_storage_after = 30
      delete_after       = 2555 # 7 years
    }

    recovery_point_tags = {
      BackupType = "Daily"
      Compliance = "Financial-Retention"
    }
  }

  rule {
    rule_name         = "weekly_backup"
    target_vault_name = aws_backup_vault.finova_backup_vault.name
    schedule          = "cron(0 5 ? * SUN *)" # Weekly on Sunday at 5 AM UTC

    start_window      = 480   # 8 hours
    completion_window = 10080 # 7 days

    lifecycle {
      cold_storage_after = 30
      delete_after       = 2555 # 7 years
    }

    recovery_point_tags = {
      BackupType = "Weekly"
      Compliance = "Financial-Retention"
    }
  }

  tags = {
    Name       = "FinovaBank-Backup-Plan"
    Purpose    = "Data-Protection-Strategy"
    Compliance = "Business-Continuity"
  }
}

# IAM Role for AWS Backup
resource "aws_iam_role" "finova_backup_role" {
  name = "finovabank-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "finova_backup_policy" {
  role       = aws_iam_role.finova_backup_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

# Backup Selection
resource "aws_backup_selection" "finova_backup_selection" {
  iam_role_arn = aws_iam_role.finova_backup_role.arn
  name         = "finovabank-backup-selection"
  plan_id      = aws_backup_plan.finova_backup_plan.id

  resources = [
    aws_db_instance.finova_primary_db.arn,
    aws_db_instance.finova_read_replica.arn
  ]

  condition {
    string_equals {
      key   = "aws:ResourceTag/BackupRequired"
      value = "true"
    }
  }
}
