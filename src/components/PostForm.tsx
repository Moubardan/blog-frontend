"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createPostAction, updatePostAction, type ActionResult } from "@/app/actions/posts";
import styles from "./PostForm.module.css";

interface PostFormProps {
    post?: {
        id: string;
        title: string;
        content: string;
        slug: string;
        excerpt: string | null;
        published: boolean;
    };
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export function PostForm({ post }: PostFormProps) {
    const action = post
        ? updatePostAction.bind(null, post.id)
        : createPostAction;

    const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
        action,
        null
    );

    function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const slugInput = document.getElementById("slug") as HTMLInputElement;
        if (slugInput && !post) {
            slugInput.value = slugify(e.target.value);
        }
    }

    return (
        <form action={formAction} className={styles.form}>
            <div className={styles.field}>
                <label htmlFor="title" className={styles.label}>
                    Titre
                </label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    defaultValue={post?.title}
                    onChange={handleTitleChange}
                    className={styles.input}
                    placeholder="Le titre de votre article"
                />
                {state?.errors?.title && (
                    <p className={styles.error}>{state.errors.title[0]}</p>
                )}
            </div>

            <div className={styles.field}>
                <label htmlFor="slug" className={styles.label}>
                    Slug
                </label>
                <input
                    id="slug"
                    name="slug"
                    type="text"
                    required
                    defaultValue={post?.slug}
                    className={styles.input}
                    placeholder="mon-article"
                />
                <span className={styles.hint}>
                    URL : /articles/votre-slug — lettres minuscules, chiffres et tirets uniquement
                </span>
                {state?.errors?.slug && (
                    <p className={styles.error}>{state.errors.slug[0]}</p>
                )}
            </div>

            <div className={styles.field}>
                <label htmlFor="excerpt" className={styles.label}>
                    Extrait (optionnel)
                </label>
                <input
                    id="excerpt"
                    name="excerpt"
                    type="text"
                    defaultValue={post?.excerpt ?? ""}
                    className={styles.input}
                    placeholder="Résumé court de l'article"
                    maxLength={300}
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="content" className={styles.label}>
                    Contenu
                </label>
                <textarea
                    id="content"
                    name="content"
                    required
                    defaultValue={post?.content}
                    className={styles.textarea}
                    placeholder="Écrivez le contenu de votre article..."
                />
                {state?.errors?.content && (
                    <p className={styles.error}>{state.errors.content[0]}</p>
                )}
            </div>

            <div className={styles.checkboxRow}>
                <input
                    id="published"
                    name="published"
                    type="checkbox"
                    defaultChecked={post?.published ?? false}
                    className={styles.checkbox}
                />
                <label htmlFor="published" className={styles.label}>
                    Publier immédiatement
                </label>
            </div>

            {state?.errors?.auth && (
                <p className={styles.error}>{state.errors.auth[0]}</p>
            )}
            {state?.errors?.post && (
                <p className={styles.error}>{state.errors.post[0]}</p>
            )}

            <div className={styles.actions}>
                <button type="submit" disabled={isPending} className={styles.submitBtn}>
                    {isPending
                        ? "Enregistrement..."
                        : post
                            ? "Mettre à jour"
                            : "Créer l'article"}
                </button>
                <Link href="/dashboard" className={styles.cancelLink}>
                    Annuler
                </Link>
            </div>
        </form>
    );
}
