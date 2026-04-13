import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ApiError, mapPostDetail, publicApiRequest } from "@/lib/api";
import type { PostDTO } from "blog-shared-types";
import { CommentSection } from "@/components/CommentSection";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    let post: PostDTO | null = null;

    try {
        post = await publicApiRequest<PostDTO>(`/posts/by-slug/${slug}`, {
            next: { revalidate: 60 },
        });
    } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) {
            throw error;
        }
    }

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
    let post: ReturnType<typeof mapPostDetail> extends infer T ? T : never;

    try {
        const response = await publicApiRequest<PostDTO>(`/posts/by-slug/${slug}`, {
            next: { revalidate: 60 },
        });
        post = mapPostDetail(response);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            notFound();
        }
        throw error;
    }

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
