API Gateway for Demo Project on Portfolio Site

## What It Does

This project returns:

```json
{ "message": "Hello World!" }
```

when `/` is requested.

It also acts as a gateway with this route format:

`/{project}/{rest-of-url}`

`project` is looked up from the hardcoded `PROJECT_BACKENDS` map in `src/consts/project-backends.js`, and then the request is forwarded to that backend with:

- same method
- same query string
- incoming headers (except hop-by-hop headers)
- raw request body

Example:

- inbound: `/portfolio/api/users?id=42`
- mapping: `portfolio -> https://portfolio-backend.example.com`
- forwarded to: `https://portfolio-backend.example.com/api/users?id=42`

The path `/{project}` (with no extra segments) is also supported and forwards to the project base URL.

## Project Mapping

Edit `PROJECT_BACKENDS` in `src/consts/project-backends.js`:

```json
{
  "portfolio": "https://portfolio-backend.example.com",
  "blog": "https://blog-backend.example.com"
}
```

## Local Development

Install dependencies and run the Express server:

```bash
npm install
npm start
```

The local Express app will listen on `http://localhost:3000`.

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
- entrypoints: `src/app.js`, `src/worker.js`, `src/local.js`
