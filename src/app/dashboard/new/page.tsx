import type { Metadata } from "next";
import { PostForm } from "@/components/PostForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Nouvel article",
};

export default function NewPostPage() {
    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Nouvel article</h1>
            <PostForm />
        </main>
    );
}
