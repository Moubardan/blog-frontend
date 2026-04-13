"use server";

import { ApiError, authenticatedApiRequest } from "@/lib/api";
import { z } from "zod";
import { auth } from "@/lib/auth";
import type { PostDTO } from "blog-shared-types";
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

function buildActionErrors(error: ApiError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  if (error.message.toLowerCase().includes("slug")) {
    errors.slug = [error.message];
  } else if (error.status === 403) {
    errors.auth = [error.message];
  } else {
    errors.post = [error.message];
  }

  return errors;
}

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

  try {
    await authenticatedApiRequest<PostDTO>("/posts", {
      method: "POST",
      body: JSON.stringify(validation.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        errors: buildActionErrors(error),
      };
    }

    throw error;
  }

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

  let currentPost: PostDTO;
  try {
    currentPost = await authenticatedApiRequest<PostDTO>(`/posts/mine/${postId}`);
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

  const raw = {
    title: formData.get("title") || undefined,
    content: formData.get("content") || undefined,
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    published: formData.get("published") === "on",
  };

  const validation = updatePostSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let updatedPost: PostDTO;
  try {
    updatedPost = await authenticatedApiRequest<PostDTO>(`/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(validation.data),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        errors: buildActionErrors(error),
      };
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath(`/articles/${currentPost.slug}`);
  if (updatedPost.slug !== currentPost.slug) {
    revalidatePath(`/articles/${updatedPost.slug}`);
  }
  redirect("/dashboard");
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, errors: { auth: ["Vous devez être connecté"] } };
  }

  let currentPost: PostDTO;
  try {
    currentPost = await authenticatedApiRequest<PostDTO>(`/posts/mine/${postId}`);
    await authenticatedApiRequest<{ message: string }>(`/posts/${postId}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        errors: buildActionErrors(error),
      };
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath(`/articles/${currentPost.slug}`);
  return { success: true };
}
