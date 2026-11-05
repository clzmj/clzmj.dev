terraform {
  backend "s3" {
    bucket         = "clzmj-dev-tfstate"
    key            = "clzmj.dev/terraform.tfstate"
    region         = "auto"
    use_lockfile   = true
    use_path_style = true

    endpoints = {
      s3 = "https://51d0a4728b8e02a6abfa1e2560252613.r2.cloudflarestorage.com"
    }

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }
}
