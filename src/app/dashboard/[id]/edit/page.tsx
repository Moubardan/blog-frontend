import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ApiError, authenticatedApiRequest } from "@/lib/api";
import type { PostDTO } from "blog-shared-types";
import { PostForm } from "@/components/PostForm";
import styles from "@/app/dashboard/new/page.module.css";

export const metadata: Metadata = {
    title: "Modifier l'article",
};

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const { id } = await params;

    let post: PostDTO;

    try {
        post = await authenticatedApiRequest<PostDTO>(`/posts/mine/${id}`);
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
            <h1 className={styles.title}>Modifier l&apos;article</h1>
            <PostForm
                post={{
                    ...post,
                    excerpt: post.excerpt ?? null,
                    published: post.published ?? false,
                }}
            />
        </main>
    );
}
