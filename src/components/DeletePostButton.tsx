"use client";

import { deletePostAction } from "@/app/actions/posts";
import styles from "@/app/dashboard/page.module.css";

interface DeletePostButtonProps {
    postId: string;
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
    async function handleDelete() {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
            return;
        }
        await deletePostAction(postId);
        window.location.reload();
    }

    return (
        <button onClick={handleDelete} className={styles.deleteBtn} type="button">
            Supprimer
        </button>
    );
}
