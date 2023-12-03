provider "aws" {
  region = "us-east-1"
}

locals {
  mime_type_mappings = {
    "css"  = "text/css"
    "html" = "text/html"
    "ico"  = "image/vnd.microsoft.icon"
    "js"   = "application/javascript"
    "json" = "application/json"
    "map"  = "application/json"
    "png"  = "image/png"
    "svg"  = "image/svg+xml"
    "txt"  = "text/plain"
  }
}

###########
# Backend configuration
###########
terraform {
  backend "s3" {
    key            = "cert-conv-frontend/backend/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
  }
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "bucket" {
  bucket = "cert-conv-frontend"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

###########
# Upload files to S3
###########
resource "aws_s3_bucket_object" "dist" {
  for_each = fileset("../build/", "**/*")

  bucket = aws_s3_bucket.bucket.id
  key    = each.value
  source = "../build/${each.value}"
  # etag makes the file update when it changes; see https://stackoverflow.com/questions/56107258/terraform-upload-file-to-s3-on-every-apply
  etag   = filemd5("../build/${each.value}")
  content_type = lookup(local.mime_type_mappings, concat(regexall("\\.([^\\.]*)$", each.value), [[""]])[0][0], "application/octet-stream")
}



resource "aws_s3_bucket_policy" "react_app_bucket_policy" {
  bucket = aws_s3_bucket.bucket.id
  policy = <<EOF
{ 
    "Version": "2012-10-17", 
    "Statement": [ 
        { 
        "Sid": "PublicReadGetObject", 
        "Effect": "Allow", 
        "Principal": "*", 
        "Action": "s3:GetObject", 
        "Resource": "arn:aws:s3:::${aws_s3_bucket.bucket.id}/*" 
        } 
    ] 
    }
EOF
}

resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI para o site estático"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.bucket.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.bucket.id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Distribuição para o site estático"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.bucket.id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
