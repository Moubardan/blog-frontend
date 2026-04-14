import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { authenticatedApiRequest, type ProfileResponse } from "@/lib/api";
import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Profil",
};

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const profile = await authenticatedApiRequest<ProfileResponse>("/auth/profile");
    const createdAt = new Date(profile.createdAt);

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Compte</p>
                    <h1 className={styles.title}>Mon profil</h1>
                    <p className={styles.subtitle}>
                        Informations récupérées depuis l&apos;API NestJS sécurisée.
                    </p>
                </div>
                <Link href="/dashboard" className={styles.dashboardLink}>
                    Retour au dashboard
                </Link>
            </div>

            <section className={styles.card}>
                <div className={styles.row}>
                    <span className={styles.label}>Nom</span>
                    <span className={styles.value}>{profile.name}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.label}>Email</span>
                    <span className={styles.value}>{profile.email}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.label}>Identifiant</span>
                    <span className={styles.code}>{profile.id}</span>
                </div>
                <div className={styles.row}>
                    <span className={styles.label}>Compte créé le</span>
                    <span className={styles.value}>
                        {new Intl.DateTimeFormat("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        }).format(createdAt)}
                    </span>
                </div>
            </section>
        </main>
    );
}