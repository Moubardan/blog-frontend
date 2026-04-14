import { expect, test, type Page } from "@playwright/test";

type Account = {
  email: string;
  password: string;
  name: string;
};

const CLEANUP_API_URL = process.env.PLAYWRIGHT_API_URL || "http://127.0.0.1:4000";
const CLEANUP_SECRET = process.env.E2E_CLEANUP_SECRET || "local-e2e-cleanup-secret";

function createAccount(): Account {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    email: `tester-${suffix}@example.com`,
    password: `Password-${suffix}`,
    name: `Tester ${suffix}`,
  };
}

async function cleanupUsers(emails: string[]) {
  if (emails.length === 0) {
    return;
  }

  const response = await fetch(`${CLEANUP_API_URL}/test-support/cleanup-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-e2e-cleanup-secret": CLEANUP_SECRET,
    },
    body: JSON.stringify({ emails }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cleanup failed: ${response.status} ${body}`);
  }
}

test.afterEach(async ({}, testInfo) => {
  const createdEmails = testInfo.annotations
    .filter((annotation) => annotation.type === "created-email")
    .map((annotation) => annotation.description)
    .filter((value): value is string => Boolean(value));

  await cleanupUsers(createdEmails);
});

async function register(page: Page, account: Account) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Créer un compte" }).click();
  await page.getByLabel("Nom").fill(account.name);
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Mot de passe").fill(account.password);
  await page.getByRole("button", { name: /^Créer un compte$/ }).click();
  await expect(page.getByText("Compte créé ! Vous pouvez maintenant vous connecter.")).toBeVisible();
}

async function login(page: Page, account: Account) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Mot de passe").fill(account.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: "Mes articles" })).toBeVisible();
}

test("redirects unauthenticated users away from protected routes", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
});

test("registers and logs in with credentials", async ({ page }) => {
  const account = createAccount();
  test.info().annotations.push({ type: "created-email", description: account.email });

  await register(page, account);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await login(page, account);
  await expect(page.getByText(account.email)).toBeVisible();
});

test("creates a new published article from the dashboard", async ({ page }) => {
  const account = createAccount();
  const title = `Article E2E ${Date.now()}`;
  const slug = `article-e2e-${Date.now()}`;
  test.info().annotations.push({ type: "created-email", description: account.email });

  await register(page, account);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await login(page, account);

  await page.getByRole("link", { name: /nouvel article/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/new$/);

  await page.getByLabel("Titre").fill(title);
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Extrait \(optionnel\)").fill("Article cree par Playwright");
  await page.getByLabel("Contenu").fill("Contenu genere par Playwright pour verifier le flux de creation d'article.");
  await page.getByLabel("Publier immédiatement").check();
  await page.getByRole("button", { name: "Créer l'article" }).click();

  await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/);
  await expect(page.getByRole("link", { name: title })).toBeVisible();
});