import styles from "./Footer.module.css";

export function Footer() {
    return (
        <footer className={styles.footer}>
            <p>&copy; {new Date().getFullYear()} Blog Full-Stack. Tous droits réservés.</p>
        </footer>
    );
}
