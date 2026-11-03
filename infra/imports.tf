import {
  to = cloudflare_dns_record.www_aaaa
  id = "${var.cloudflare_zone_id}/${local.dns_record_ids.www_aaaa}"
}

import {
  to = cloudflare_ruleset.www_redirect
  id = "zones/${var.cloudflare_zone_id}/${local.redirect_ruleset_id}"
}

import {
  to = cloudflare_zone_setting.always_use_https
  id = "${var.cloudflare_zone_id}/always_use_https"
}

import {
  to = cloudflare_zone_setting.min_tls_version
  id = "${var.cloudflare_zone_id}/min_tls_version"
}

import {
  to = cloudflare_zone_setting.security_header
  id = "${var.cloudflare_zone_id}/security_header"
}

import {
  to = cloudflare_r2_bucket.media
  id = "${var.cloudflare_account_id}/clzmj-dev-media/default"
}
