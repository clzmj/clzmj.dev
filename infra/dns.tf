resource "cloudflare_dns_record" "www_aaaa" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "www.clzmj.dev"
  type    = "AAAA"
  ttl     = 1
  content = "100::"
  proxied = true
}

resource "cloudflare_dns_record" "mx" {
  zone_id  = data.cloudflare_zone.clzmj.id
  name     = "clzmj.dev"
  type     = "MX"
  ttl      = 60
  content  = "smtp.google.com"
  priority = 1
  proxied  = false
}

resource "cloudflare_dns_record" "google_site_verification" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "clzmj.dev"
  type    = "TXT"
  ttl     = 60
  content = "google-site-verification=RrFlAVnFkcaqEbI3PbETZRbqqPUbkUxc-WXfir61ux0"
  proxied = false
}

resource "cloudflare_dns_record" "spf" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "clzmj.dev"
  type    = "TXT"
  ttl     = 60
  content = "v=spf1 include:_spf.google.com ~all"
  proxied = false
}

resource "cloudflare_dns_record" "dmarc" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "_dmarc.clzmj.dev"
  type    = "TXT"
  ttl     = 60
  content = "v=DMARC1; p=none; adkim=r; aspf=r"
  proxied = false
}

data "cloudflare_dns_record" "dkim" {
  zone_id       = var.cloudflare_zone_id
  dns_record_id = local.dns_record_ids.dkim
}

resource "cloudflare_dns_record" "dkim" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = data.cloudflare_dns_record.dkim.name
  type    = data.cloudflare_dns_record.dkim.type
  ttl     = data.cloudflare_dns_record.dkim.ttl
  content = data.cloudflare_dns_record.dkim.content
  proxied = data.cloudflare_dns_record.dkim.proxied
}
