"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addCommentAction, type CommentActionResult } from "@/app/actions/comments";
import styles from "./CommentForm.module.css";

interface CommentFormProps {
    postId: string;
    isAuthenticated: boolean;
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button type="submit" disabled={pending} className={styles.submitBtn}>
            {pending ? "Envoi..." : "Commenter"}
        </button>
    );
}

export function CommentForm({ postId, isAuthenticated }: CommentFormProps) {
    const [state, formAction] = useFormState<CommentActionResult | null, FormData>(
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
            <SubmitButton />
        </form>
    );
}
