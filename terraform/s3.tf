###########
# S3 bucket creation
###########
resource "aws_s3_bucket" "bucket" {
  bucket = "cert-conv-frontend"
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
# Upload files to S3
###########
resource "aws_s3_bucket_object" "dist" {
  for_each = fileset("../build/", "**/*")

  bucket = aws_s3_bucket.bucket.id
  key    = each.value
  source = "../build/${each.value}"

  etag   = filemd5("../build/${each.value}")
  content_type = lookup(local.mime_type_mappings, concat(regexall("\\.([^\\.]*)$", each.value), [[""]])[0][0], "application/octet-stream")
}

###########
# Access control policy for the bucket
###########
data "aws_iam_policy_document" "react_app_s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "react_app_bucket_policy" {
  bucket = aws_s3_bucket.bucket.id
  policy = data.aws_iam_policy_document.react_app_s3_policy.json
}