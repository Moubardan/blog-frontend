"use client";

import { useActionState } from "react";
import { addCommentAction, type CommentActionResult } from "@/app/actions/comments";
import styles from "./CommentForm.module.css";

interface CommentFormProps {
    postId: string;
    isAuthenticated: boolean;
}

export function CommentForm({ postId, isAuthenticated }: CommentFormProps) {
    const [state, formAction, isPending] = useActionState<CommentActionResult | null, FormData>(
        addCommentAction,
        null
    );

    if (!isAuthenticated) {
        return (
            <p className={styles.loginPrompt}>
                <a href="/login">Connectez-vous</a> pour laisser un commentaire.
            </p>
        );
    }

    return (
        <form action={formAction} className={styles.form}>
            <input type="hidden" name="postId" value={postId} />
            <textarea
                name="content"
                placeholder="Écrivez votre commentaire..."
                className={styles.textarea}
                required
                maxLength={1000}
                aria-label="Votre commentaire"
            />
            {state?.errors?.content && (
                <p className={styles.error}>{state.errors.content[0]}</p>
            )}
            {state?.errors?.auth && (
                <p className={styles.error}>{state.errors.auth[0]}</p>
            )}
            {state?.success && (
                <p className={styles.success}>Commentaire ajouté !</p>
            )}
            <button type="submit" disabled={isPending} className={styles.submitBtn}>
                {isPending ? "Envoi..." : "Commenter"}
            </button>
        </form>
    );
}
