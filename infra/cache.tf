resource "cloudflare_ruleset" "static_assets" {
  zone_id     = data.cloudflare_zone.clzmj.id
  name        = "Static asset cache"
  description = "Make static extensions on the apex eligible for the free zone cache. HTML is excluded."
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules = [
    {
      ref         = "static-assets"
      action      = "set_cache_settings"
      description = "Cache static asset extensions and honor origin Cache-Control."
      enabled     = true
      expression  = "(http.host eq \"clzmj.dev\" and http.request.uri.path.extension in {\"avif\" \"css\" \"gif\" \"ico\" \"jpeg\" \"jpg\" \"js\" \"mjs\" \"png\" \"svg\" \"ttf\" \"webp\" \"woff\" \"woff2\" \"map\" \"webmanifest\"})"
      action_parameters = {
        cache = true
        edge_ttl = {
          mode = "respect_origin"
        }
        browser_ttl = {
          mode = "respect_origin"
        }
      }
    }
  ]
}
