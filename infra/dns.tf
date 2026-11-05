resource "cloudflare_dns_record" "www_aaaa" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "www.clzmj.dev"
  type    = "AAAA"
  ttl     = 1
  content = "100::"
  proxied = true
  comment = "Placeholder so Cloudflare can redirect www to the root domain"
}
