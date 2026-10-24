"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, destroySession, loginWithCredentials, registerUser } from "@/lib/auth";
import { toggleStar, addComment, updateComment, deleteComment, createProject, deleteProject, updateUserProfile } from "@/lib/services";
import { isValidHttpUrl, isValidAvatarUrl } from "@/lib/validation";

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = (formData.get("name") as string)?.trim();
  const role = (formData.get("role") as string)?.trim() || "Developer";
  const bio = (formData.get("bio") as string)?.trim() || "";
  const avatarUrl = (formData.get("avatarUrl") as string)?.trim() || "";
  const githubUrl = (formData.get("githubUrl") as string)?.trim() || "";
  const websiteUrl = (formData.get("websiteUrl") as string)?.trim() || "";

  if (!name) {
    return { error: "Name cannot be empty" };
  }
  if (name.length > 80) {
    return { error: "Name cannot exceed 80 characters" };
  }
  if (role.length > 80) {
    return { error: "Role cannot exceed 80 characters" };
  }
  if (bio.length > 2000) {
    return { error: "Bio cannot exceed 2000 characters" };
  }
  if (avatarUrl && !isValidAvatarUrl(avatarUrl)) {
    return { error: "Invalid avatar format. Please provide a valid HTTP/HTTPS URL or upload an image file." };
  }
  if (githubUrl && !isValidHttpUrl(githubUrl)) {
    return { error: "GitHub URL must start with http:// or https://" };
  }
  if (websiteUrl && !isValidHttpUrl(websiteUrl)) {
    return { error: "Website URL must start with http:// or https://" };
  }

  const success = updateUserProfile(user.id, {
    name,
    role,
    bio,
    avatarUrl,
    githubUrl,
    websiteUrl,
  });

  if (!success) {
    return { error: "Failed to update profile" };
  }

  revalidatePath("/", "layout");
  revalidatePath(`/creators/${user.username}`);
  return { success: true };
}

export async function toggleStarAction(projectId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please sign in or select a demo user to star projects" };
  }

  const result = toggleStar(projectId, user.id);
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  return { success: true, ...result };
}

export async function addCommentAction(projectId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please sign in to leave feedback" };
  }

  const trimmed = content ? content.trim() : "";
  if (!trimmed) {
    return { error: "Comment cannot be empty" };
  }
  if (trimmed.length > 2000) {
    return { error: "Comment cannot exceed 2000 characters" };
  }

  const comment = addComment(projectId, user.id, trimmed);
  revalidatePath(`/projects/${projectId}`);
  return { success: true, comment };
}

export async function updateCommentAction(commentId: string, content: string, projectId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please sign in to edit comments" };
  }
  const trimmed = content ? content.trim() : "";
  if (!trimmed) {
    return { error: "Comment cannot be empty" };
  }
  if (trimmed.length > 2000) {
    return { error: "Comment cannot exceed 2000 characters" };
  }

  const updated = updateComment(commentId, user.id, trimmed);
  if (!updated) {
    return { error: "Failed to update comment or not authorized" };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, comment: updated };
}

export async function deleteCommentAction(commentId: string, projectId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please sign in to delete comments" };
  }

  const deleted = deleteComment(commentId, user.id);
  if (!deleted) {
    return { error: "Failed to delete comment or not authorized" };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function logoutAction() {
  await destroySession();
  revalidatePath("/", "layout");
  return { success: true };
}

export async function loginAction(formData: FormData) {
  const emailOrUsername = formData.get("emailOrUsername") as string;
  const password = formData.get("password") as string;

  if (!emailOrUsername || !password) {
    return { error: "Please provide both identifier and password" };
  }

  const res = await loginWithCredentials(emailOrUsername, password);
  if (!res.success) {
    return { error: res.error || "Authentication failed" };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const role = formData.get("role") as string;
  const bio = formData.get("bio") as string;

  if (!name || !username || !email || !password) {
    return { error: "Name, username, email, and password are required" };
  }

  if (confirmPassword && password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const res = await registerUser({ name, username, email, password, role, bio });
  if (!res.success) {
    return { error: res.error || "Registration failed" };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function createProjectAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to publish a project" };
  }

  const title = (formData.get("title") as string)?.trim();
  const tagline = (formData.get("tagline") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const tagsRaw = (formData.get("tags") as string)?.trim();
  const coverImage = (formData.get("coverImage") as string)?.trim() || undefined;
  const codeSnippet = (formData.get("codeSnippet") as string)?.trim() || undefined;
  const demoUrl = (formData.get("demoUrl") as string)?.trim() || undefined;
  const githubUrl = (formData.get("githubUrl") as string)?.trim() || undefined;

  if (!title || !tagline || !description) {
    return { error: "Title, tagline, and description are required" };
  }

  if (title.length > 120) {
    return { error: "Title cannot exceed 120 characters" };
  }
  if (tagline.length > 250) {
    return { error: "Tagline cannot exceed 250 characters" };
  }
  if (description.length > 10000) {
    return { error: "Description cannot exceed 10000 characters" };
  }
  if (codeSnippet && codeSnippet.length > 100000) {
    return { error: "Code snippet cannot exceed 100,000 characters" };
  }
  if (coverImage && !isValidAvatarUrl(coverImage)) {
    return { error: "Cover image must be a valid HTTP/HTTPS URL or image data" };
  }
  if (demoUrl && !isValidHttpUrl(demoUrl)) {
    return { error: "Demo URL must start with http:// or https://" };
  }
  if (githubUrl && !isValidHttpUrl(githubUrl)) {
    return { error: "GitHub URL must start with http:// or https://" };
  }

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean)
    : ["Showcase"];

  const projectId = createProject({
    title,
    tagline,
    description,
    tags,
    coverImage,
    codeSnippet,
    demoUrl,
    githubUrl,
    authorId: user.id,
  });

  revalidatePath("/");
  return { success: true, projectId };
}

export async function deleteProjectAction(projectId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const deleted = deleteProject(projectId, user.id);
  if (!deleted) {
    return { error: "Failed to delete project or not authorized" };
  }

  revalidatePath("/");
  return { success: true };
}
