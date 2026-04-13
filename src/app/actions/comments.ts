"use server";

import { ApiError, authenticatedApiRequest, publicApiRequest } from "@/lib/api";
import { z } from "zod";
import { auth } from "@/lib/auth";
import type { PostDTO } from "blog-shared-types";
import { revalidatePath } from "next/cache";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Le commentaire ne peut pas être vide")
    .max(1000, "Le commentaire est trop long (max 1000 caractères)"),
  postId: z.string().uuid(),
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

  let post: PostDTO;
  try {
    await authenticatedApiRequest(`/posts/${validation.data.postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content: validation.data.content }),
    });
    post = await publicApiRequest<PostDTO>(`/posts/${validation.data.postId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        errors: {
          post: [error.message],
        },
      };
    }

    throw error;
  }

  revalidatePath(`/articles/${post.slug}`);
  return { success: true };
}
