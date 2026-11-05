data "cloudflare_zone" "clzmj" {
  zone_id = var.cloudflare_zone_id

  lifecycle {
    postcondition {
      condition     = self.name == "clzmj.dev"
      error_message = "CLOUDFLARE_ZONE_ID is not the clzmj.dev zone."
    }
  }
}
