resource "cloudflare_workers_custom_domain" "apex" {
  account_id = var.cloudflare_account_id
  zone_id    = data.cloudflare_zone.clzmj.id
  hostname   = local.apex_hostname
  service    = local.worker_name
}
