output "apex_hostname" {
  description = "Hostname routed to the clzmj-dev Worker."
  value       = cloudflare_workers_custom_domain.apex.hostname
}

output "worker_name" {
  description = "Worker targeted by the apex custom domain. Wrangler deploys its script and assets."
  value       = local.worker_name
}

output "media_bucket_name" {
  description = "Private R2 bucket holding the Elsewhere photos."
  value       = cloudflare_r2_bucket.media.name
}
