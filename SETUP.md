# 🚀 Setup Guide

This guide explains how the one-time setup process works and how `wrangler.toml` is generated automatically.

## Quick Setup

After cloning the repository, run:

```bash
bun install
wrangler login  # No wrangler.toml needed for this step!
bun run setup
```

That's it! The setup script will handle everything else.

## How It Works

This starter kit **does not include a `wrangler.toml` file** in the repository (it's in `.gitignore`). Instead, the setup script **builds it from scratch** based on your inputs. This allows you to:

1. Run `wrangler login` without any configuration issues
2. Clone the repo and have a clean slate
3. Let the setup script create a perfectly configured `wrangler.toml` for your project

### Setup Flow

```
┌─────────────────────────────────────────────────────┐
│  1. Clone Repository & Install Dependencies         │
│     bun install                                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  2. Run Setup Script                                │
│     bun run setup                                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  3. Authentication Check                             │
│     ✓ Verify wrangler login                         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  4. Project Configuration                            │
│     • Enter project name                             │
│     • Generate resource names                        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  5. Create Cloudflare Resources                      │
│     • D1 Database                                    │
│     • R2 Bucket                                      │
│     • KV Namespace (optional)                        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  6. Setup Authentication                             │
│     • Google OAuth (optional)                        │
│     • Generate secure secrets                        │
│     • Create .dev.vars                               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  7. Build Configuration Files                        │
│     • Create wrangler.toml from scratch              │
│     • Update package.json with database name         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  8. Database Migrations                              │
│     • Generate schema                                │
│     • Apply local migrations                         │
│     • Apply remote migrations                        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  9. Deploy Secrets? (Optional)                       │
│     Yes → Upload to Cloudflare Workers               │
│     No  → Skip (can deploy later)                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼ (if secrets deployed)
┌─────────────────────────────────────────────────────┐
│  10. Build & Deploy Worker? (Optional)               │
│      Yes → bun run build + bun run deploy            │
│      No  → Skip (can deploy later)                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  ✅ Setup Complete!                                  │
│     • bun run dev (local development)                │
│     • bun run deploy (deploy to production)          │
│     • App is live! (if deployed)                     │
└─────────────────────────────────────────────────────┘
```

### Configuration File Generation

The setup script creates and configures files as follows:

1. **`wrangler.toml`** (generated from scratch):
   - Project name
   - D1 database configuration (name and ID)
   - R2 bucket configuration
   - AI binding
   - Better Auth secret
   - Observability settings

2. **`package.json`** (updated):
   - Database migration commands use your actual database name
   - Handlebars placeholder `{{dbName}}` is replaced

3. **`wrangler.toml.example`** (reference only):
   - Example configuration showing the structure
   - Not used by the setup script or wrangler

### Setup Process Flow

When you run `bun run setup`, the script:

1. **Authentication Check**
   - Verifies you're logged in with `wrangler login`

2. **Project Configuration**
   - Prompts for your project name (e.g., "my-awesome-saas")
   - Generates resource names:
     - Project: `my-awesome-saas`
     - Database: `my-awesome-saas-db`
     - Bucket: `my-awesome-saas-bucket`

3. **Resource Creation**
   - Creates D1 database in Cloudflare
   - Creates R2 bucket in Cloudflare
   - Optionally creates KV namespace

4. **Configuration Generation**
   - Creates `wrangler.toml` from scratch with all correct values
   - Updates `package.json` with actual database name
   - No template replacements needed - everything is built fresh

5. **Authentication Setup**
   - Prompts for Google OAuth credentials (optional)
   - Generates secure random secrets for authentication
   - Creates `.dev.vars` file with credentials

6. **Database Migrations**
   - Generates initial database schema
   - Applies migrations to local database
   - Applies migrations to remote database

7. **Optional Production Deployment**
   - Prompts to deploy secrets to Cloudflare Workers
   - Uploads sensitive credentials securely
   - If secrets are deployed, prompts to build and deploy the worker
   - Runs `bun run build` to build the application
   - Runs `bun run deploy` to deploy to Cloudflare Workers

## What Gets Created

### Cloudflare Resources

- **D1 Database**: Serverless SQLite database
- **R2 Bucket**: Object storage for files
- **KV Namespace** (optional): Key-value storage

### Local Files

- **`.dev.vars`**: Development environment variables (not committed to git)
- **`wrangler.toml`**: Updated with your project configuration
- **`package.json`**: Updated with your database name
- **`drizzle/`**: Database migration files

## After Setup

Once setup is complete, you can:

### Zero to Deployed in One Command 🚀

If you choose to deploy secrets **and** deploy the worker during setup, you can go from a fresh clone to a live production deployment in a single `bun run setup` command! The script will:

1. Create all Cloudflare resources
2. Configure everything automatically
3. Deploy your secrets
4. Build your application
5. Deploy to Cloudflare Workers

**Your app will be live immediately after setup completes!**

### Local Development
```bash
bun run dev
```

### Database Management
```bash
# Generate new migrations
bun run db:generate

# Apply migrations locally
bun run db:migrate:local

# Apply migrations remotely
bun run db:migrate:remote

# Open database studio
bun run db:studio:dev    # Local
bun run db:studio:prod   # Remote
```

### Secrets Management
```bash
# Interactive secrets manager
bun run secrets
```

### Deploy to Production
```bash
bun run deploy
```

## Manual Configuration (Advanced)

If you need to manually configure resources or reset the setup:

1. **Delete Generated Files**
   ```bash
   rm wrangler.toml
   ```

2. **Reset package.json** (if needed)
   
   Restore the handlebars placeholder in `package.json`:
   ```json
   {
     "scripts": {
       "db:migrate:local": "wrangler d1 migrations apply \"{{dbName}}\" --local",
       "db:migrate:remote": "wrangler d1 migrations apply \"{{dbName}}\" --remote"
     }
   }
   ```

3. **Run Setup Again**
   ```bash
   bun run setup
   ```

The setup script will create a fresh `wrangler.toml` with your new configuration.

## Troubleshooting

### "Not authenticated" Error
Run `wrangler login` and try again.

### "Database already exists" Error
The script will automatically detect existing resources and use them.

### "Account ID not found" Error
The script will prompt you to select an account if you have multiple Cloudflare accounts.

### Need to Change Project Name?
1. Delete the created resources in Cloudflare Dashboard
2. Delete `wrangler.toml` from your local directory
3. Run `bun run setup` again with new name

## Security Notes

- **Never commit `.dev.vars`** to version control (it's in `.gitignore`)
- **Never commit `wrangler.toml`** to version control (it's in `.gitignore`)
- Secrets uploaded to Cloudflare Workers are encrypted and secure
- The `wrangler.toml.example` file is safe to commit as a reference
- Your actual `wrangler.toml` is generated locally and contains your real resource IDs

## Environment Variables

### Development (`.dev.vars`)
- `AUTH_GOOGLE_ID` - Google OAuth Client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth Client Secret
- `AUTH_SECRET` - Random secret for auth (auto-generated)
- `BETTER_AUTH_SECRET` - Random secret for Better Auth (auto-generated)

### Production (`wrangler.toml` and Cloudflare Secrets)
- Public vars in `wrangler.toml` under `[vars]` section
- Sensitive secrets uploaded via `wrangler secret put`

## Next Steps

After setup is complete:

1. **Configure OAuth Providers**
   - Update OAuth redirect URIs in Google Console
   - Add your production URL to authorized origins

2. **Configure R2 CORS**
   - Add CORS policy to R2 bucket for your domain

3. **Deploy**
   ```bash
   bun run deploy
   ```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

