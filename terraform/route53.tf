resource "aws_route53_zone" "main" {
  name = "mamud.cloud"
}

resource "aws_route53_record" "subdominio" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "pfxtopem.mamud.cloud"
  type    = "CNAME"
  ttl     = "300"
  records = ["${aws_cloudfront_distribution.cf_distribution.domain_name}"]
}
