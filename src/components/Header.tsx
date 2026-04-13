import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import styles from "./Header.module.css";

export async function Header() {
    const session = await auth();

    return (
        <header className={styles.header}>
            <nav className={styles.nav} aria-label="Navigation principale">
                <Link href="/" className={styles.logo}>
                    Blog
                </Link>
                <ul className={styles.links}>
                    <li>
                        <Link href="/" className={styles.link}>
                            Articles
                        </Link>
                    </li>
                    {session?.user ? (
                        <>
                            <li>
                                <Link href="/dashboard" className={styles.link}>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <form
                                    action={async () => {
                                        "use server";
                                        await signOut({ redirectTo: "/" });
                                    }}
                                >
                                    <button type="submit" className={styles.signOutBtn}>
                                        Déconnexion
                                    </button>
                                </form>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link href="/login" className={styles.authBtn}>
                                Connexion
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    );
}
