API Gateway for Demo Project on Portfolio Site

## What It Does

This project returns:

```json
{ "message": "Hello World!" }
```

when `/` is requested.

It also acts as a gateway with this route format:

`/{project}/{rest-of-url}`

`project` is looked up from the `PROJECT_BACKENDS` map (see [Project Mapping](#project-mapping) below), and then the request is forwarded to that backend with:

- same method
- same query string
- incoming headers (except hop-by-hop headers)
- raw request body

Example:

- inbound: `/portfolio/api/users?id=42`
- mapping: `portfolio -> https://portfolio-backend.example.com`
- forwarded to: `https://portfolio-backend.example.com/api/users?id=42`

The path `/{project}` (with no extra segments) is also supported and forwards to the project base URL.

For Cloudflare Worker deployments, WebSocket upgrade requests are also proxied through `/{project}/{rest-of-url}`.

## Project Mapping

The real project → backend URL map is kept out of source on purpose — the
whole point of this gateway is to avoid exposing actual backend hostnames.
It's set as a Worker secret, `PROJECT_BACKENDS`, holding a JSON string:

```bash
echo '{"portfolio":"https://portfolio-backend.example.com","blog":"https://blog-backend.example.com"}' | npx wrangler secret put PROJECT_BACKENDS
```

Locally, `wrangler dev` reads the same secret from `.dev.vars` (gitignored):

```
PROJECT_BACKENDS={"portfolio":"https://portfolio-backend.example.com"}
```

## Cloudflare Workers

Deploy the Worker with Wrangler:

```bash
npm install
npm run deploy
```

Then point `api.oliverhatherton.com` at the deployed Worker in Cloudflare so visiting the subdomain hits the JSON response.

## Structure

- constants: `src/consts`
- controllers: `src/controllers`
- services: `src/services`
- utilities: `src/utils`
- entrypoint: `src/worker.js`
