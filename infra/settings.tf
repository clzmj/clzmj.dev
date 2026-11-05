resource "cloudflare_zone_setting" "always_use_https" {
  zone_id    = data.cloudflare_zone.clzmj.id
  setting_id = "always_use_https"
  value      = "on"
}

resource "cloudflare_zone_setting" "min_tls_version" {
  zone_id    = data.cloudflare_zone.clzmj.id
  setting_id = "min_tls_version"
  value      = "1.2"
}

resource "cloudflare_zone_setting" "security_header" {
  zone_id    = data.cloudflare_zone.clzmj.id
  setting_id = "security_header"
  value = {
    strict_transport_security = {
      enabled            = true
      include_subdomains = true
      max_age            = 31536000
      nosniff            = true
      preload            = false
    }
  }
}
