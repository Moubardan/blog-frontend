import Link from "next/link";
import styles from "./PostCard.module.css";

interface PostCardProps {
    post: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        createdAt: Date;
        author: { id: string; name: string | null };
    };
}

export function PostCard({ post }: PostCardProps) {
    return (
        <article className={styles.card}>
            <Link href={`/articles/${post.slug}`} className={styles.cardTitle}>
                {post.title}
            </Link>
            {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
            <div className={styles.meta}>
                <span>{post.author.name ?? "Anonyme"}</span>
                <time dateTime={post.createdAt.toISOString()}>
                    {new Intl.DateTimeFormat("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    }).format(post.createdAt)}
                </time>
            </div>
        </article>
    );
}
