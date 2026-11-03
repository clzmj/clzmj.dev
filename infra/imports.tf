import {
  to = cloudflare_dns_record.www_aaaa
  id = "${var.cloudflare_zone_id}/${local.dns_record_ids.www_aaaa}"
}

import {
  to = cloudflare_dns_record.mx
  id = "${var.cloudflare_zone_id}/${local.dns_record_ids.mx}"
}

import {
  to = cloudflare_dns_record.google_site_verification
  id = "${var.cloudflare_zone_id}/${local.dns_record_ids.google_site_verification}"
}

import {
  to = cloudflare_dns_record.spf
  id = "${var.cloudflare_zone_id}/${local.dns_record_ids.spf}"
}

import {
  to = cloudflare_dns_record.dmarc
  id = "${var.cloudflare_zone_id}/${local.dns_record_ids.dmarc}"
}

import {
  to = cloudflare_dns_record.dkim
  id = "${var.cloudflare_zone_id}/${local.dns_record_ids.dkim}"
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
