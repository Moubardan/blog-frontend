"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Le commentaire ne peut pas être vide")
    .max(1000, "Le commentaire est trop long (max 1000 caractères)"),
  postId: z.string().cuid(),
});

export type CommentActionResult = {
  success: boolean;
  errors?: Record<string, string[]>;
};

export async function addCommentAction(
  _prevState: CommentActionResult | null,
  formData: FormData
): Promise<CommentActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, errors: { auth: ["Vous devez être connecté pour commenter"] } };
  }

  const raw = {
    content: formData.get("content"),
    postId: formData.get("postId"),
  };

  const validation = commentSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const post = await prisma.post.findUnique({
    where: { id: validation.data.postId },
  });

  if (!post) {
    return { success: false, errors: { post: ["Article introuvable"] } };
  }

  await prisma.comment.create({
    data: {
      content: validation.data.content,
      postId: validation.data.postId,
      authorId: session.user.id,
    },
  });

  revalidatePath(`/articles/${post.slug}`);
  return { success: true };
}
