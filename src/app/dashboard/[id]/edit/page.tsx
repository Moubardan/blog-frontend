import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    const post = await prisma.post.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            content: true,
            slug: true,
            excerpt: true,
            published: true,
            authorId: true,
        },
    });

    if (!post) {
        notFound();
    }

    if (post.authorId !== session.user.id) {
        redirect("/dashboard");
    }

    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Modifier l&apos;article</h1>
            <PostForm post={post} />
        </main>
    );
}
