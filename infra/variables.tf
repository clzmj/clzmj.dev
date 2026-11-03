variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account id from TF_VAR_cloudflare_account_id. Supplied by the GitHub environment, which Doppler syncs."
  nullable    = false

  validation {
    condition     = length(var.cloudflare_account_id) > 0
    error_message = "cloudflare_account_id must be set."
  }
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Zone id for clzmj.dev from TF_VAR_cloudflare_zone_id. Supplied by the GitHub environment, which Doppler syncs."
  nullable    = false

  validation {
    condition     = length(var.cloudflare_zone_id) > 0
    error_message = "cloudflare_zone_id must be set."
  }
}
