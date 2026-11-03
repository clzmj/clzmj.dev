# Events

Each event is one Markdown file in `content/events/`. The filename becomes the slug (`example-evening.md` → `/events/example-evening`).

## Front matter

```yaml
title: Example evening
start: "2026-12-04T19:00:00"
end: "2026-12-04T21:00:00"
timezone: America/Mexico_City
location: Mexico City
url: https://clzmj.dev/events/example-evening
status: upcoming
example: false
```

- `start` and `end` are local wall times in `timezone`. Quote them so they stay strings.
- `status` is `upcoming` or `past`. The page trusts this field.
- `example: true` shows an Example tag. The shipped file uses that tag so the list is obviously a sample.
- The body is ordinary Markdown and shows on the event page.

`bun run build` writes `public/events/<slug>.ics` (and copies it to `out/`) with a `VTIMEZONE` for `America/Mexico_City`. Mexico City is CST (UTC−6) all year. The event page links to that file.

## Later

RSVPs are not built. When they are, a Worker route in front of this static site will accept them and store the responses in Cloudflare D1. The Markdown files stay the public listing. Terraform in `infra/` would own the route and the database. This repository does not create that Worker.
