import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Connexion",
    description: "Connectez-vous pour accéder à votre espace auteur.",
};

export default async function LoginPage() {
    const session = await auth();

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Connexion</h1>
            <p className={styles.subtitle}>
                Connectez-vous pour publier et gérer vos articles.
            </p>
            <div className={styles.card}>
                <LoginForm />
            </div>
        </main>
    );
}
