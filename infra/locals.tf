locals {
  worker_name   = "clzmj-dev"
  apex_hostname = "clzmj.dev"

  dns_record_ids = {
    www_aaaa                      = "67b4c2dcef74b13e0639f1b0707b02ad"
    google_site_verification      = "265a856f145390b3c9f5efbb2e1c6c7c"
    google_workspace_verification = "ed4e8c04139b256e42afbd1a699e078a"
    spf                           = "0a048cb850cf5878afa152d747b32a46"
  }

  redirect_ruleset_id = "2d05ee15bce848eba2b90feb8b05e387"
}
