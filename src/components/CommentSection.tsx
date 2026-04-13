import { auth } from "@/lib/auth";
import { CommentForm } from "./CommentForm";
import styles from "@/app/articles/[slug]/page.module.css";

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    author: { id: string; name: string | null };
}

interface CommentSectionProps {
    postId: string;
    comments: Comment[];
}

export async function CommentSection({ postId, comments }: CommentSectionProps) {
    const session = await auth();

    return (
        <>
            {comments.length === 0 ? (
                <p className={styles.noComments}>Aucun commentaire pour le moment.</p>
            ) : (
                <ul className={styles.commentList}>
                    {comments.map((comment) => (
                        <li key={comment.id} className={styles.comment}>
                            <div className={styles.commentMeta}>
                                <strong>{comment.author.name ?? "Anonyme"}</strong> &middot;{" "}
                                <time dateTime={comment.createdAt.toISOString()}>
                                    {new Intl.DateTimeFormat("fr-FR", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    }).format(comment.createdAt)}
                                </time>
                            </div>
                            <p className={styles.commentContent}>{comment.content}</p>
                        </li>
                    ))}
                </ul>
            )}
            <CommentForm postId={postId} isAuthenticated={!!session?.user} />
        </>
    );
}
