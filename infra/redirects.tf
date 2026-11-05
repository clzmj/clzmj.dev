resource "cloudflare_ruleset" "www_redirect" {
  zone_id = data.cloudflare_zone.clzmj.id
  name    = "default"
  kind    = "zone"
  phase   = "http_request_dynamic_redirect"

  rules = [
    {
      ref         = "d3fb8f3957134315824c9d97ccb4efc3"
      action      = "redirect"
      expression  = "(http.host eq \"www.clzmj.dev\")"
      description = "Redirect www to clzmj.dev"
      enabled     = true
      action_parameters = {
        from_value = {
          status_code           = 301
          preserve_query_string = true
          target_url = {
            expression = "concat(\"https://clzmj.dev\", http.request.uri.path)"
          }
        }
      }
    }
  ]
}
