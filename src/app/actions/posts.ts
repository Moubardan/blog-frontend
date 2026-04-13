"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const createPostSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères").max(200),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"),
  excerpt: z.string().max(300).optional(),
  published: z.boolean().optional(),
});

const updatePostSchema = createPostSchema.partial();

export type ActionResult = {
  success: boolean;
  data?: Record<string, unknown>;
  errors?: Record<string, string[]>;
};

export async function createPostAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, errors: { auth: ["Vous devez être connecté"] } };
  }

  const raw = {
    title: formData.get("title"),
    content: formData.get("content"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") || undefined,
    published: formData.get("published") === "on",
  };

  const validation = createPostSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existing = await prisma.post.findUnique({
    where: { slug: validation.data.slug },
  });

  if (existing) {
    return {
      success: false,
      errors: { slug: ["Ce slug est déjà utilisé"] },
    };
  }

  await prisma.post.create({
    data: {
      ...validation.data,
      authorId: session.user.id,
    },
  });

  revalidatePath("/");
  redirect("/dashboard");
}

export async function updatePostAction(
  postId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, errors: { auth: ["Vous devez être connecté"] } };
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return { success: false, errors: { post: ["Article introuvable"] } };
  }
  if (post.authorId !== session.user.id) {
    return { success: false, errors: { auth: ["Vous n'êtes pas l'auteur de cet article"] } };
  }

  const raw = {
    title: formData.get("title") || undefined,
    content: formData.get("content") || undefined,
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    published: formData.has("published") ? formData.get("published") === "on" : undefined,
  };

  const validation = updatePostSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (validation.data.slug && validation.data.slug !== post.slug) {
    const existing = await prisma.post.findUnique({
      where: { slug: validation.data.slug },
    });
    if (existing) {
      return { success: false, errors: { slug: ["Ce slug est déjà utilisé"] } };
    }
  }

  await prisma.post.update({
    where: { id: postId },
    data: validation.data,
  });

  revalidatePath("/");
  revalidatePath(`/articles/${post.slug}`);
  if (validation.data.slug && validation.data.slug !== post.slug) {
    revalidatePath(`/articles/${validation.data.slug}`);
  }
  redirect("/dashboard");
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, errors: { auth: ["Vous devez être connecté"] } };
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return { success: false, errors: { post: ["Article introuvable"] } };
  }
  if (post.authorId !== session.user.id) {
    return { success: false, errors: { auth: ["Vous n'êtes pas l'auteur de cet article"] } };
  }

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/");
  revalidatePath(`/articles/${post.slug}`);
  return { success: true };
}
