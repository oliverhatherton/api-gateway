API Gateway for Demo Project on Portfolio Site

## What It Does

This project returns:

```json
{ "message": "Hello World!" }
```

when `/` is requested.

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
