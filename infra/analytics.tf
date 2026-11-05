resource "cloudflare_web_analytics_site" "apex" {
  account_id   = var.cloudflare_account_id
  zone_tag     = data.cloudflare_zone.clzmj.id
  auto_install = true
  enabled      = true
}
