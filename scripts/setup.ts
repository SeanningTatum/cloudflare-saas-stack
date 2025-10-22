import { execSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import { default as fs } from "node:fs";
import os from "node:os";
import { default as path } from "node:path";
import { cancel, intro, outro, select, spinner, text } from "@clack/prompts";
import { default as toml } from "@iarna/toml";

// Function to execute shell commands
function executeCommand(command: string) {
  console.log(`\x1b[33m${command}\x1b[0m`);
  try {
    return execSync(command, { encoding: "utf-8" });
  } catch (error: any) {
    return { error: true, message: error.stdout || error.stderr };
  }
}

// Function to prompt user for input without readline-sync
async function prompt(message: string, defaultValue: string): Promise<string> {
  return (await text({
    message: `${message} (${defaultValue}):`,
    placeholder: defaultValue,
    defaultValue,
  })) as string;
}

// Function to extract account IDs from `wrangler whoami` output
function extractAccountDetails(output: string): { name: string; id: string }[] {
  const lines = output.split("\n");
  const accountDetails: { name: string; id: string }[] = [];

  for (const line of lines) {
    const isValidLine =
      line.trim().startsWith("│ ") && line.trim().endsWith(" │");

    if (isValidLine) {
      const regex = /\b[a-f0-9]{32}\b/g;
      const matches = line.match(regex);

      if (matches && matches.length === 1) {
        const accountName = line.split("│ ")[1]?.trim();
        const accountId = matches[0].replace("│ ", "").replace(" │", "");
        if (accountName === undefined || accountId === undefined) {
          console.error(
            "\x1b[31mError extracting account details from wrangler whoami output.\x1b[0m"
          );
          cancel("Operation cancelled.");
          process.exit(1);
        }
        accountDetails.push({ name: accountName, id: accountId });
      }
    }
  }

  return accountDetails;
}

// Function to prompt for account ID if there are multiple accounts
async function promptForAccountId(
  accounts: { name: string; id: string }[]
): Promise<string> {
  if (accounts.length === 1) {
    if (!accounts[0]) {
      console.error(
        "\x1b[31mNo accounts found. Please run `wrangler login`.\x1b[0m"
      );
      cancel("Operation cancelled.");
      process.exit(1);
    }
    if (!accounts[0].id) {
      console.error(
        "\x1b[31mNo accounts found. Please run `wrangler login`.\x1b[0m"
      );
      cancel("Operation cancelled.");
      process.exit(1);
    }
    return accounts[0].id;
  } else if (accounts.length > 1) {
    const options = accounts.map((account) => ({
      value: account.id,
      label: account.name,
    }));
    const selectedAccountId = await select({
      message: "Select an account to use:",
      options,
    });

    return selectedAccountId as string;
  } else {
    console.error(
      "\x1b[31mNo accounts found. Please run `wrangler login`.\x1b[0m"
    );
    cancel("Operation cancelled.");
    process.exit(1);
  }
}

let bucketR2Name: string;
let dbName: string;
let kvNamespaceName: string;

// Function to create database and update wrangler.toml
async function createDatabaseAndConfigure() {
  intro(`Let's set up your database...`);
  const defaultDBName = `${path.basename(process.cwd())}-db`;
  dbName = await prompt("Enter the name of your database", defaultDBName);

  let databaseID: string;

  const wranglerTomlPath = path.join(__dirname, "..", "wrangler.toml");
  let wranglerToml: toml.JsonMap;

  try {
    const wranglerTomlContent = fs.readFileSync(wranglerTomlPath, "utf-8");
    wranglerToml = toml.parse(wranglerTomlContent);
  } catch (error) {
    console.error("\x1b[31mError reading wrangler.toml:", error, "\x1b[0m");
    cancel("Operation cancelled.");
  }

  // Run command to create a new database
  const creationOutput = executeCommand(`bunx wrangler d1 create ${dbName}`);

  if (creationOutput === undefined || typeof creationOutput !== "string") {
    console.log(
      "\x1b[33mDatabase creation failed, maybe you have already created a database with that name. I'll try to find the database ID for you.\x1b[0m"
    );
    const dbInfoOutput = executeCommand(`bunx wrangler d1 info ${dbName}`);
    const getInfo = (dbInfoOutput as string).match(
      /│ [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12} │/i
    );
    if (getInfo && getInfo.length === 1) {
      console.log(
        "\x1b[33mFound it! The database ID is: ",
        getInfo[0],
        "\x1b[0m"
      );
      databaseID = getInfo[0].replace("│ ", "").replace(" │", "");
    } else {
      console.error(
        "\x1b[31mSomething went wrong when initialising the database. Please try again.\x1b[0m"
      );
      cancel("Operation cancelled.");
    }
  } else {
    // Extract database ID from the output
    const matchResult = (creationOutput as string).match(
      /database_id = "(.*)"/
    );
    if (matchResult && matchResult.length === 2 && matchResult !== undefined) {
      databaseID = matchResult[1]!;
    } else {
      console.error("Failed to extract database ID from the output.");
      cancel("Operation cancelled.");
    }
  }

  // Update wrangler.toml with database configuration
  wranglerToml = {
    ...wranglerToml!,
    d1_databases: [
      {
        binding: "DATABASE",
        database_name: dbName,
        database_id: databaseID!,
        migrations_dir: "./drizzle",
      },
    ],
  };

  try {
    const updatedToml = toml.stringify(wranglerToml);
    fs.writeFileSync(wranglerTomlPath, updatedToml);
    console.log(
      "\x1b[33mDatabase configuration updated in wrangler.toml\x1b[0m"
    );
  } catch (error) {
    console.error("\x1b[31mError updating wrangler.toml:", error, "\x1b[0m");
    cancel("Operation cancelled.");
  }

  outro("Database configuration completed.");
}

async function createBucketR2() {
  const wranglerTomlPath = path.join(__dirname, "..", "wrangler.toml");
  let wranglerToml: toml.JsonMap;

  try {
    const wranglerTomlContent = fs.readFileSync(wranglerTomlPath, "utf-8");
    wranglerToml = toml.parse(wranglerTomlContent);
  } catch (error) {
    console.error("\x1b[31mError reading wrangler.toml:", error, "\x1b[0m");
    cancel("Operation cancelled.");
  }

  const bucketR2Spinner = spinner();
  const defaultBucketName = `${path.basename(process.cwd())}-bucket`;
  bucketR2Name = await prompt(
    "Enter the name of your bucket",
    defaultBucketName
  );
  bucketR2Spinner.start("Creating bucket...");
  executeCommand(`wrangler r2 bucket create ${bucketR2Name}`);
  bucketR2Spinner.stop("Bucket created.");

  // Update wrangler.toml with bucket configuration
  wranglerToml = {
    ...wranglerToml!,
    r2_buckets: [
      {
        binding: "BUCKET",
        bucket_name: bucketR2Name,
      },
    ],
  };

  try {
    const updatedToml = toml.stringify(wranglerToml);
    fs.writeFileSync(wranglerTomlPath, updatedToml);
    console.log("\x1b[33mBucket configuration updated in wrangler.toml\x1b[0m");
  } catch (error) {
    console.error("\x1b[31mError updating wrangler.toml:", error, "\x1b[0m");
    cancel("Operation cancelled.");
  }

  outro("Bucket configuration completed.");
}

async function createKVNamespace() {
  const wranglerTomlPath = path.join(__dirname, "..", "wrangler.toml");
  let wranglerToml: toml.JsonMap;

  try {
    const wranglerTomlContent = fs.readFileSync(wranglerTomlPath, "utf-8");
    wranglerToml = toml.parse(wranglerTomlContent);
  } catch (error) {
    console.error("\x1b[31mError reading wrangler.toml:", error, "\x1b[0m");
    cancel("Operation cancelled.");
  }

  const kvSpinner = spinner();
  const defaultKVName = `${path.basename(process.cwd())}-kv`;
  kvNamespaceName = await prompt(
    "Enter the name of your KV namespace",
    defaultKVName
  );
  kvSpinner.start("Creating KV namespace...");

  const kvOutput = executeCommand(
    `wrangler kv:namespace create ${kvNamespaceName}`
  );

  let namespaceId: string;

  if (kvOutput === undefined || typeof kvOutput !== "string") {
    console.error(
      "\x1b[31mFailed to create KV namespace. Please try again.\x1b[0m"
    );
    cancel("Operation cancelled.");
    return;
  }

  // Extract namespace ID from the output
  // Expected format: id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  const matchResult = kvOutput.match(/id = "([^"]+)"/);
  if (matchResult && matchResult.length === 2) {
    namespaceId = matchResult[1]!;
  } else {
    console.error(
      "\x1b[31mFailed to extract KV namespace ID from the output.\x1b[0m"
    );
    cancel("Operation cancelled.");
    return;
  }

  kvSpinner.stop("KV namespace created.");

  // Update wrangler.toml with KV configuration
  wranglerToml = {
    ...wranglerToml!,
    kv_namespaces: [
      {
        binding: "KV",
        id: namespaceId,
      },
    ],
  };

  try {
    const updatedToml = toml.stringify(wranglerToml);
    fs.writeFileSync(wranglerTomlPath, updatedToml);
    console.log(
      "\x1b[33mKV namespace configuration updated in wrangler.toml\x1b[0m"
    );
  } catch (error) {
    console.error("\x1b[31mError updating wrangler.toml:", error, "\x1b[0m");
    cancel("Operation cancelled.");
  }

  outro("KV namespace configuration completed.");
}

// Function to prompt for Google client credentials
async function promptForGoogleClientCredentials() {
  intro("Now, time for auth!");

  const devVarsPath = path.join(__dirname, "..", ".dev.vars");

  if (!fs.existsSync(devVarsPath)) {
    console.log(
      "\x1b[33mNow, we will set up authentication for your app using Google OAuth2. \nGo to https://console.cloud.google.com/, create a new project and set up OAuth consent screen.\nThen, go to Credentials > OAuth client ID and create a new client ID.\nPaste the client ID and client secret below. \n\nMore info: https://developers.google.com/workspace/guides/configure-oauth-consent#:~:text=Go%20to%20OAuth%20consent%20screen,sensitive%20scopes%2C%20and%20restricted%20scopes.\x1b[0m"
    );
    const clientId = await prompt(
      "Enter your Google Client ID (enter to skip)",
      ""
    );
    const clientSecret = await prompt(
      "Enter your Google Client Secret (enter to skip)",
      ""
    );

    try {
      fs.writeFileSync(
        devVarsPath,
        `AUTH_GOOGLE_ID=${clientId}\nAUTH_GOOGLE_SECRET=${clientSecret}\n`
      );
      console.log(
        "\x1b[33m.dev.vars file created with Google Client ID and Client Secret.\x1b[0m"
      );
    } catch (error) {
      console.error("\x1b[31mError creating .dev.vars file:", error, "\x1b[0m");
      cancel("Operation cancelled.");
    }
  } else {
    console.log(
      "\x1b[31m.dev.vars file already exists. Skipping creation.\x1b[0m"
    );
  }

  outro(".dev.vars updated with Google Client ID and Client Secret.");
}

// Function to generate secure random 32-character string
function generateSecureRandomString(length: number): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

// Function to update .dev.vars with secure random string
async function updateDevVarsWithSecret() {
  const authSecret = generateSecureRandomString(32);
  const betterAuthSecret = generateSecureRandomString(32);
  const devVarsPath = path.join(__dirname, "..", ".dev.vars");

  try {
    const devVarsContent = fs.readFileSync(devVarsPath, "utf-8");

    if (!devVarsContent.includes("AUTH_SECRET")) {
      fs.appendFileSync(devVarsPath, `\nAUTH_SECRET=${authSecret}`);
      console.log("\x1b[33mAUTH_SECRET appended to .dev.vars file.\x1b[0m");
    } else {
      console.log("\x1b[31mAUTH_SECRET already exists in .dev.vars\x1b[0m");
    }

    if (!devVarsContent.includes("BETTER_AUTH_SECRET")) {
      fs.appendFileSync(
        devVarsPath,
        `\nBETTER_AUTH_SECRET=${betterAuthSecret}`
      );
      console.log(
        "\x1b[33mBETTER_AUTH_SECRET appended to .dev.vars file.\x1b[0m"
      );
    } else {
      console.log(
        "\x1b[31mBETTER_AUTH_SECRET already exists in .dev.vars\x1b[0m"
      );
    }
  } catch (error) {
    console.error("\x1b[31mError updating .dev.vars file:", error, "\x1b[0m");
    cancel("Operation cancelled.");
  }

  outro(".dev.vars updated with secure secrets.");
}

// Function to configure environment variables in wrangler.toml
async function configureWranglerEnvVars() {
  intro("Configuring environment variables for deployment...");

  const wranglerTomlPath = path.join(__dirname, "..", "wrangler.toml");
  let wranglerToml: toml.JsonMap;

  try {
    const wranglerTomlContent = fs.readFileSync(wranglerTomlPath, "utf-8");
    wranglerToml = toml.parse(wranglerTomlContent);
  } catch (error) {
    console.error("\x1b[31mError reading wrangler.toml:", error, "\x1b[0m");
    cancel("Operation cancelled.");
    return;
  }

  // Generate secure secret for BETTER_AUTH_SECRET
  const betterAuthSecret = generateSecureRandomString(32);

  // Prompt for NEXT_PUBLIC_AUTH_URL
  const defaultAuthUrl = "http://localhost:3000";
  const authUrl = await prompt(
    "Enter your public auth URL (use your production URL for deployment)",
    defaultAuthUrl
  );

  // Update wrangler.toml vars section
  wranglerToml = {
    ...wranglerToml,
    vars: {
      ...(wranglerToml.vars as toml.JsonMap),
      BETTER_AUTH_SECRET: betterAuthSecret,
      NEXT_PUBLIC_AUTH_URL: authUrl,
    },
  };

  try {
    const updatedToml = toml.stringify(wranglerToml);
    fs.writeFileSync(wranglerTomlPath, updatedToml);
    console.log(
      "\x1b[33mEnvironment variables updated in wrangler.toml\x1b[0m"
    );
  } catch (error) {
    console.error("\x1b[31mError updating wrangler.toml:", error, "\x1b[0m");
    cancel("Operation cancelled.");
  }

  outro("Environment variables configured.");
}

// Function to run database migrations
async function runDatabaseMigrations(dbName: string) {
  const setupMigrationSpinner = spinner();
  setupMigrationSpinner.start("Generating setup migration...");
  executeCommand("bunx drizzle-kit generate --name setup");
  setupMigrationSpinner.stop("Setup migration generated.");

  const localMigrationSpinner = spinner();
  localMigrationSpinner.start("Running local database migrations...");
  executeCommand(`bunx wrangler d1 migrations apply ${dbName}`);
  localMigrationSpinner.stop("Local database migrations completed.");

  const remoteMigrationSpinner = spinner();
  remoteMigrationSpinner.start("Running remote database migrations...");
  executeCommand(`bunx wrangler d1 migrations apply ${dbName} --remote`);
  remoteMigrationSpinner.stop("Remote database migrations completed.");
}

function setEnvironmentVariable(name: string, value: string) {
  const platform = os.platform();
  let command: string;

  if (platform === "win32") {
    command = `set ${name}=${value}`; // Windows Command Prompt
  } else {
    command = `export ${name}=${value}`; // Unix-like shells
  }

  console.log(
    `\x1b[33mPlease run this command: ${command} and then rerun the setup script.\x1b[0m`
  );
  process.exit(1);
}

async function main() {
  try {
    const whoamiOutput = executeCommand("wrangler whoami");
    if (whoamiOutput === undefined || typeof whoamiOutput !== "string") {
      console.error(
        "\x1b[31mError running wrangler whoami. Please run `wrangler login`.\x1b[0m"
      );
      cancel("Operation cancelled.");
      process.exit(1);
    }

    try {
      await createDatabaseAndConfigure();
    } catch (error) {
      console.error("\x1b[31mError:", error, "\x1b[0m");
      const accountIds = extractAccountDetails(whoamiOutput);
      const accountId = await promptForAccountId(accountIds);
      setEnvironmentVariable("CLOUDFLARE_ACCOUNT_ID", accountId);
      cancel("Operation cancelled.");
      process.exit(1);
    }

    try {
      await createBucketR2();
    } catch (error) {
      console.error("\x1b[31mError:", error, "\x1b[0m");
      cancel("Operation cancelled.");
      process.exit(1);
    }

    try {
      await createKVNamespace();
    } catch (error) {
      console.error("\x1b[31mError:", error, "\x1b[0m");
      cancel("Operation cancelled.");
      process.exit(1);
    }

    await promptForGoogleClientCredentials();
    await updateDevVarsWithSecret();
    await configureWranglerEnvVars();
    console.log("\x1b[33mReady... Set... Launch\x1b[0m");
    await runDatabaseMigrations(dbName);

    console.log(
      "\x1b[33mSetup complete! Run 'bun run dev' to start your worker.\x1b[0m"
    );
  } catch (error) {
    console.error("\x1b[31mError:", error, "\x1b[0m");
    cancel("Operation cancelled.");
  }
}

main();
