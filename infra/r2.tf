resource "cloudflare_r2_bucket" "media" {
  account_id    = var.cloudflare_account_id
  name          = "clzmj-dev-media"
  jurisdiction  = "default"
  location      = "WNAM"
  storage_class = "Standard"

  lifecycle {
    prevent_destroy = true
  }
}
