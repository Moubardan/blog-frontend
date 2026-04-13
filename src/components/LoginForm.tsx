"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
    credentialsSignIn,
    registerAction,
    googleSignIn,
    type AuthActionResult,
} from "@/app/actions/auth";
import styles from "@/app/login/page.module.css";

export function LoginForm() {
    const [mode, setMode] = useState<"login" | "register">("login");

    const [loginState, loginAction, loginPending] = useActionState<
        AuthActionResult | null,
        FormData
    >(credentialsSignIn, null);

    const [registerState, registerAction_, registerPending] = useActionState<
        AuthActionResult | null,
        FormData
    >(registerAction, null);

    const state = mode === "login" ? loginState : registerState;
    const action = mode === "login" ? loginAction : registerAction_;
    const isPending = mode === "login" ? loginPending : registerPending;

    return (
        <>
            <form action={action} className={styles.form}>
                {mode === "register" && (
                    <div className={styles.field}>
                        <label htmlFor="name" className={styles.label}>
                            Nom
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className={styles.input}
                            placeholder="Votre nom"
                        />
                        {state?.errors?.name && (
                            <p className={styles.error}>{state.errors.name[0]}</p>
                        )}
                    </div>
                )}
                <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={styles.input}
                        placeholder="vous@exemple.com"
                    />
                    {state?.errors?.email && (
                        <p className={styles.error}>{state.errors.email[0]}</p>
                    )}
                </div>
                <div className={styles.field}>
                    <label htmlFor="password" className={styles.label}>
                        Mot de passe
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={mode === "register" ? 8 : undefined}
                        className={styles.input}
                        placeholder="••••••••"
                    />
                    {state?.errors?.password && (
                        <p className={styles.error}>{state.errors.password[0]}</p>
                    )}
                </div>

                {state?.errors?.auth && (
                    <p className={styles.error}>{state.errors.auth[0]}</p>
                )}

                {mode === "register" && state?.success && (
                    <p style={{ color: "var(--color-success)", fontSize: "0.85rem" }}>
                        Compte créé ! Vous pouvez maintenant vous connecter.
                    </p>
                )}

                <button type="submit" disabled={isPending} className={styles.submitBtn}>
                    {isPending
                        ? "Chargement..."
                        : mode === "login"
                            ? "Se connecter"
                            : "Créer un compte"}
                </button>
            </form>

            <div className={styles.divider}>ou</div>

            <form action={googleSignIn}>
                <button type="submit" className={styles.googleBtn}>
                    Continuer avec Google
                </button>
            </form>

            <p className={styles.toggle}>
                {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
                <button
                    type="button"
                    className={styles.toggleLink}
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                >
                    {mode === "login" ? "Créer un compte" : "Se connecter"}
                </button>
            </p>
        </>
    );
}
