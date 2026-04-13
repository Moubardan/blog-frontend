"use server";

import { signIn as nextAuthSignIn } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type AuthActionResult = {
  success: boolean;
  errors?: Record<string, string[]>;
};

export async function registerAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validation = registerSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: validation.data.email },
  });

  if (existing) {
    return {
      success: false,
      errors: { email: ["Cet email est déjà utilisé"] },
    };
  }

  const hashedPassword = await hash(validation.data.password, 10);

  await prisma.user.create({
    data: {
      name: validation.data.name,
      email: validation.data.email,
      password: hashedPassword,
    },
  });

  return { success: true };
}

export async function credentialsSignIn(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  try {
    await nextAuthSignIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      success: false,
      errors: { auth: ["Email ou mot de passe incorrect"] },
    };
  }
}
