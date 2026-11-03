resource "cloudflare_dns_record" "www_aaaa" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "www.clzmj.dev"
  type    = "AAAA"
  ttl     = 1
  content = "100::"
  proxied = true
  comment = "Placeholder so Cloudflare can redirect www to the root domain"
}

resource "cloudflare_dns_record" "mx" {
  zone_id  = data.cloudflare_zone.clzmj.id
  name     = "clzmj.dev"
  type     = "MX"
  ttl      = 60
  content  = "smtp.google.com"
  priority = 1
  proxied  = false
  comment  = "Google Workspace - inbound mail (MX)"
}

resource "cloudflare_dns_record" "google_site_verification" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "clzmj.dev"
  type    = "TXT"
  ttl     = 60
  content = "\"google-site-verification=RrFlAVnFkcaqEbI3PbETZRbqqPUbkUxc-WXfir61ux0\""
  proxied = false
  comment = "Google Workspace - domain ownership verification"
}

resource "cloudflare_dns_record" "spf" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "clzmj.dev"
  type    = "TXT"
  ttl     = 60
  content = "\"v=spf1 include:_spf.google.com ~all\""
  proxied = false
  comment = "Google Workspace - authorized mail senders (SPF)"
}

resource "cloudflare_dns_record" "dmarc" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "_dmarc.clzmj.dev"
  type    = "TXT"
  ttl     = 60
  content = "\"v=DMARC1; p=none; adkim=r; aspf=r\""
  proxied = false
  comment = "Email authentication - DMARC initial policy (p=none)"
}

resource "cloudflare_dns_record" "dkim" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "google._domainkey.clzmj.dev"
  type    = "TXT"
  ttl     = 60
  content = "\"v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArKyyHefrb9/VMXLFk10dul3IllZP0raUC8Zl7tRJRKbpc/8sHzeljaInl+y6cGOKWHk8O4PXWb1C7jqMfk8oZtBZntiVUy38uMBVvp60ViPbtmAEMM7iL7rUNDSvG/Xw/VGrnq/sLcp+zeexHvnZnxS4+mKT9wulUnch7pZWbkTVcYqk/NYF5x7RK8v6VBl8Olt\" \"TbZsG2Zw3PeTUjkv28NYirAC8t5X4MDiDi2IebLhJa97BVTSVEwCWhwURhlWaEgAe6CLcoXx0snMGr69F2YeSTTdEDsyn/yzOpLaPEm73gY2M2VwSN9MDyhnH5aGWyAObpTz3lUkSoinnF2tYMQIDAQAB\""
  proxied = false
  comment = "Google Workspace - outgoing mail signing (DKIM, 2048-bit)"
}
