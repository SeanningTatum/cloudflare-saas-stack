# 🚀 Full-Stack Cloudflare SaaS Kit

**_Build and deploy scalable products on Cloudflare with ease._**

An opinionated, batteries-included starter kit for quickly building and deploying SaaS products on Cloudflare. This is a [Next.js](https://nextjs.org/) project bootstrapped with [`c3`](https://developers.cloudflare.com/pages/get-started/c3).

This is the same stack used to build [Supermemory.ai](https://Supermemory.ai) which is open source at [git.new/memory](https://git.new/memory)

Supermemory now has 20k+ users and it runs on $5/month. safe to say, it's _very_ effective.

## The stack includes:

- [Next.js](https://nextjs.org/) for frontend
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Drizzle ORM](https://orm.drizzle.team/) for database access
- [Better Auth](https://www.better-auth.com/) for authentication
- [Cloudflare D1](https://www.cloudflare.com/developer-platform/d1/) for serverless databases
- [Cloudflare Workers](https://workers.cloudflare.com/) for hosting (via OpenNext)
- [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) for file storage
- [ShadcnUI](https://shadcn.com/) as the component library

## Getting Started

### Quick Start (Recommended)

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/Dhravya/cloudflare-saas-stack
   cd cloudflare-saas-stack
   npm i -g bun
   bun install
   ```

2. Make sure you have [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#installupdate-wrangler) installed and logged in:
   ```bash
   wrangler login
   ```

3. Run the one-time setup script:
   ```bash
   bun run setup
   ```

   This single command will:
   - Prompt you for your project name (used to generate all resource names)
   - Create Cloudflare resources (D1 database, R2 bucket, optional KV namespace)
   - Build your `wrangler.toml` configuration file automatically
   - Configure authentication (Google OAuth)
   - Generate and apply database migrations
   - Optionally deploy secrets to production
   - Optionally build and deploy your worker to Cloudflare (if secrets were deployed)

4. Run the development server:
   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### What Happens During Setup?

When you run `bun run setup`, it:

1. Prompts for your project name (e.g., "my-saas-app")
2. Generates resource names:
   - Project: `my-saas-app`
   - Database: `my-saas-app-db`
   - Bucket: `my-saas-app-bucket`
3. Creates these resources in Cloudflare
4. **Builds your `wrangler.toml` file** from scratch with all the correct values
5. Updates `package.json` with your database name
6. Sets up authentication credentials in `.dev.vars`
7. Runs database migrations

After setup completes, your configuration files are ready to use with no manual editing required!

**Note**: The repository doesn't include a `wrangler.toml` file (it's in `.gitignore`). This means you can run `wrangler login` without any issues before running setup. The setup script will create your personalized `wrangler.toml` automatically.

**Pro Tip**: If you choose to deploy secrets during setup, you'll be prompted to also build and deploy your worker immediately. This means you can go from clone to deployed in just one command! 🚀

## Cloudflare Integration

The application uses [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) to deploy Next.js to Cloudflare Workers:
- `preview`: Build and locally preview your application using [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
- `deploy`: Build and deploy your application to Cloudflare Workers
- `cf-typegen`: Generate TypeScript types for Cloudflare bindings

> __Note:__ While the `dev` script is optimal for local development, you should preview your application periodically to ensure it works properly in the Cloudflare Workers environment.

## Deploying to Production

After completing the initial setup, deploying to production is straightforward:

1. If you skipped secret deployment during setup, you can deploy them anytime:
   
   The setup script already handled secret deployment if you confirmed during setup. If you need to update secrets later:
   
   - Modify your `.dev.vars` file
   - Use the secrets management tool: `bun run secrets`
   - Or manually deploy: `echo "YOUR_SECRET_VALUE" | wrangler secret put SECRET_NAME`

2. Deploy your application:
   ```bash
   bun run deploy
   ```

### What secrets are used?

Your application uses these secrets from `.dev.vars`:
- `AUTH_GOOGLE_ID`: Google OAuth Client ID
- `AUTH_GOOGLE_SECRET`: Google OAuth Client Secret
- `AUTH_SECRET`: Secure random string for auth (auto-generated during setup)
- `BETTER_AUTH_SECRET`: Another secure random string (auto-generated during setup)

These secrets are stored securely in Cloudflare Workers and are not visible in your `wrangler.toml` file.

For a detailed deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Managing Secrets

Use the interactive secrets management tool:

```bash
bun run secrets
```

This allows you to:
- List all deployed secrets
- Delete specific secrets
- Bulk delete all secrets (use with caution!)

## Bindings

Cloudflare [Bindings](https://developers.cloudflare.com/pages/functions/bindings/) allow you to interact with Cloudflare Platform resources. You can use bindings during development, local preview, and in the deployed application.

For detailed instructions on setting up bindings, refer to the Cloudflare documentation.

## Database Migrations
Quick explaination of D1 set up:
- D1 is a serverless database that follows SQLite convention.
- Within Cloudflare pages and workers, you can directly query d1 with [client api](https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/) exposed by bindings (eg. `env.BINDING`)
- You can also query d1 via [rest api](https://developers.cloudflare.com/api/operations/cloudflare-d1-create-database)
- Locally, wrangler auto generates sqlite files at `.wrangler/state/v3/d1` after `bun run dev`.
- Local dev environment (`bun run dev`) interact with [local d1 session](https://developers.cloudflare.com/d1/build-with-d1/local-development/#start-a-local-development-session), which is based on some SQlite files located at `.wrangler/state/v3/d1`.
- In dev mode (`bun run db:<migrate or studio>:dev`), Drizzle-kit (migrate and studio) directly modifies these files as regular SQlite db. While `bun run db:<migrate or studio>:prod` use d1-http driver to interact with remote d1 via rest api. Therefore we need to set env var at `.env.example`

To generate migrations files:
- `bun run db:generate`

To apply database migrations:
- For development: `bun run db:migrate:dev`
- For production: `bun run db:migrate:prd`

To inspect database:
- For local database `bun run db:studio:dev`
- For remote database `bun run db:studio:prod`

## Cloudflare R2 Bucket CORS / File Upload

Don't forget to add the CORS policy to the R2 bucket. The CORS policy should look like this:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-domain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT"
    ],
    "AllowedHeaders": [
      "Content-Type"
    ],
    "ExposeHeaders": [
      "ETag"
    ]
  }
]
```

You can now even set up object upload.

## Manual Setup

If you prefer manual setup:

1. Create a Cloudflare account and install Wrangler CLI.
2. Create a D1 database: `bunx wrangler d1 create ${dbName}`
3. Create a `.dev.vars` file in the project root with your Better Auth credentials and OAuth providers.
   1. `BETTER_AUTH_SECRET`, generate by command `openssl rand -base64 32`
   2. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google OAuth.
      1. First create [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent). Tips: no wait time if you skip logo upload.
      2. Create [credential](https://console.cloud.google.com/apis/credentials). Put `https://your-domain` and `http://localhost:3000` at "Authorized JavaScript origins". Put `https://your-domain/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google` at "Authorized redirect URIs".
4. Generate db migration files: `bun run db:generate`
5. Run local migration: `bunx wrangler d1 execute ${dbName} --local --file=migrations/0000_setup.sql` or using drizzle `bun run db:migrate:dev`
6. Run remote migration: `bunx wrangler d1 execute ${dbName} --remote --file=migrations/0000_setup.sql` or using drizzle `bun run db:migrate:prod`
7. Start development server: `bun run dev`
8. Deploy: `bun run deploy`

## The Beauty of This Stack

- Fully scalable and composable
- No environment variables needed (use `env.DB`, `env.KV`, `env.Queue`, `env.AI`, etc.)
- Powerful tools like Wrangler for database management and migrations
- Cost-effective scaling (e.g., $5/month for multiple high-traffic projects)

Just change your Cloudflare account ID in the project settings, and you're good to go!

## Quick Links

- 📋 [Commands Reference](./COMMANDS.md) - Complete list of all available commands
- 🚀 [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- 💡 [Main README](./README.md) - You are here!


# Todo
- Upgrade tailwind