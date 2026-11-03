locals {
  worker_name   = "clzmj-dev"
  apex_hostname = "clzmj.dev"

  dns_record_ids = {
    www_aaaa                 = "67b4c2dcef74b13e0639f1b0707b02ad"
    mx                       = "67e233fe5ba9b62e90dc91e1a930ac16"
    google_site_verification = "ed4e8c04139b256e42afbd1a699e078a"
    spf                      = "0a048cb850cf5878afa152d747b32a46"
    dmarc                    = "071a5cd9df35b007b04dbd780f958c0c"
    dkim                     = "5753df33af9ff066595dcb5907bf1c9b"
  }

  redirect_ruleset_id = "2d05ee15bce848eba2b90feb8b05e387"
}
