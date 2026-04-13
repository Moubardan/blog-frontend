import { mapPostSummary, publicApiRequest, type PublicPostsResponse } from "@/lib/api";
import { PostCard } from "@/components/PostCard";
import styles from "./page.module.css";

export const revalidate = 60;

export default async function HomePage() {
    const response = await publicApiRequest<PublicPostsResponse>("/posts?page=1&limit=10", {
        next: { revalidate },
    });
    const posts = response.data.map(mapPostSummary);

    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Articles</h1>
            <p className={styles.subtitle}>
                Découvrez nos derniers articles sur le développement web full-stack.
            </p>

            {posts.length === 0 ? (
                <p className={styles.empty}>Aucun article publié pour le moment.</p>
            ) : (
                <div className={styles.grid}>
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </main>
    );
}
