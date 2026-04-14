import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
    authenticatedApiRequest,
    mapPostSummary,
    type ProfileResponse,
} from "@/lib/api";
import type { PostDTO } from "blog-shared-types";
import { redirect } from "next/navigation";
import { DeletePostButton } from "@/components/DeletePostButton";
import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Dashboard",
};

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const [profile, posts] = await Promise.all([
        authenticatedApiRequest<ProfileResponse>("/auth/profile"),
        authenticatedApiRequest<PostDTO[]>("/posts/mine"),
    ]);

    const mappedPosts = posts.map(mapPostSummary);
    const publishedCount = mappedPosts.filter((post) => post.published).length;
    const draftCount = mappedPosts.length - publishedCount;

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Espace auteur</p>
                    <h1 className={styles.title}>Mes articles</h1>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/profile" className={styles.profileLink}>
                        Voir mon profil
                    </Link>
                    <Link href="/dashboard/new" className={styles.newBtn}>
                        + Nouvel article
                    </Link>
                </div>
            </div>

            <section className={styles.summaryGrid}>
                <article className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Auteur</span>
                    <strong className={styles.summaryValue}>{profile.name}</strong>
                    <p className={styles.summaryMeta}>{profile.email}</p>
                </article>
                <article className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Articles publiés</span>
                    <strong className={styles.summaryValue}>{publishedCount}</strong>
                    <p className={styles.summaryMeta}>Visibles sur la partie publique</p>
                </article>
                <article className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Brouillons</span>
                    <strong className={styles.summaryValue}>{draftCount}</strong>
                    <p className={styles.summaryMeta}>Encore modifiables avant publication</p>
                </article>
            </section>

            {mappedPosts.length === 0 ? (
                <p className={styles.empty}>
                    Vous n&apos;avez pas encore d&apos;articles.{" "}
                    <Link href="/dashboard/new">Créer votre premier article</Link>
                </p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Titre</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mappedPosts.map((post) => (
                            <tr key={post.id}>
                                <td>
                                    <Link href={`/articles/${post.slug}`}>{post.title}</Link>
                                </td>
                                <td>
                                    <span className={post.published ? styles.published : styles.draft}>
                                        {post.published ? "Publié" : "Brouillon"}
                                    </span>
                                </td>
                                <td>
                                    {new Intl.DateTimeFormat("fr-FR", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    }).format(post.createdAt)}
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <Link
                                            href={`/dashboard/${post.id}/edit`}
                                            className={styles.editLink}
                                        >
                                            Modifier
                                        </Link>
                                        <DeletePostButton postId={post.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}
