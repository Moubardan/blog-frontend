import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CommentSection } from "@/components/CommentSection";
import styles from "./page.module.css";

export const revalidate = 60;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const posts = await prisma.post.findMany({
        where: { published: true },
        select: { slug: true },
    });
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.post.findUnique({
        where: { slug },
        select: { title: true, excerpt: true },
    });

    if (!post) {
        return { title: "Article introuvable" };
    }

    return {
        title: post.title,
        description: post.excerpt || `Lire l'article "${post.title}" sur notre blog.`,
        openGraph: {
            title: post.title,
            description: post.excerpt || undefined,
            type: "article",
        },
    };
}

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params;
    const post = await prisma.post.findUnique({
        where: { slug, published: true },
        include: {
            author: { select: { id: true, name: true } },
            comments: {
                include: { author: { select: { id: true, name: true } } },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!post) {
        notFound();
    }

    return (
        <main className={styles.main}>
            <Link href="/" className={styles.back}>
                ← Retour aux articles
            </Link>

            <article>
                <h1 className={styles.title}>{post.title}</h1>
                <div className={styles.meta}>
                    <span>Par {post.author.name ?? "Anonyme"}</span>
                    <time dateTime={post.createdAt.toISOString()}>
                        {new Intl.DateTimeFormat("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        }).format(post.createdAt)}
                    </time>
                </div>
                <div className={styles.content}>{post.content}</div>
            </article>

            <section id="comments" className={styles.commentsSection}>
                <h2 className={styles.commentsTitle}>
                    Commentaires ({post.comments.length})
                </h2>
                <CommentSection postId={post.id} comments={post.comments} />
            </section>
        </main>
    );
}
