resource "cloudflare_dns_record" "www_aaaa" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "www.clzmj.dev"
  type    = "AAAA"
  ttl     = 1
  content = "100::"
  proxied = true
  comment = "Placeholder so Cloudflare can redirect www to the root domain"
}

# Preserve the existing apex TXT values, including Cloudflare's literal quotes.
resource "cloudflare_dns_record" "google_site_verification" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = local.apex_hostname
  type    = "TXT"
  ttl     = 3600
  content = "\"google-site-verification=Vdl0IvMnI5rJmFG20YCG4ck5AKwOddBJ5kTtflD3zfM\""

  lifecycle {
    prevent_destroy = true
  }
}

resource "cloudflare_dns_record" "google_workspace_verification" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = local.apex_hostname
  type    = "TXT"
  ttl     = 60
  content = "\"google-site-verification=RrFlAVnFkcaqEbI3PbETZRbqqPUbkUxc-WXfir61ux0\""
  comment = "Google Workspace - domain ownership verification"

  lifecycle {
    prevent_destroy = true
  }
}

resource "cloudflare_dns_record" "spf" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = local.apex_hostname
  type    = "TXT"
  ttl     = 60
  content = "\"v=spf1 include:_spf.google.com ~all\""
  comment = "Google Workspace - authorized mail senders (SPF)"

  lifecycle {
    prevent_destroy = true
  }
}
