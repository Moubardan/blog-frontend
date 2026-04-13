import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    const posts = await prisma.post.findMany({
        where: { authorId: session.user.id },
        select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h1 className={styles.title}>Mes articles</h1>
                <Link href="/dashboard/new" className={styles.newBtn}>
                    + Nouvel article
                </Link>
            </div>

            {posts.length === 0 ? (
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
                        {posts.map((post) => (
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
