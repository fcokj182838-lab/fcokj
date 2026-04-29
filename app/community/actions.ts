"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdminClient } from "../lib/supabase/server";

const ADMIN_COOKIE_NAME = "community_admin_token";

function getAdminHashSource() {
  const password = process.env.COMMUNITY_ADMIN_PASSWORD;
  const secret = process.env.COMMUNITY_ADMIN_SECRET;

  if (!password || !secret) {
    return null;
  }

  return { password, secret };
}

function createAdminToken(password: string, secret: string) {
  return createHmac("sha256", secret).update(password).digest("hex");
}

async function isAdminAuthenticated() {
  const hashSource = getAdminHashSource();
  if (!hashSource) {
    return false;
  }

  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!tokenFromCookie) {
    return false;
  }

  const expectedToken = createAdminToken(hashSource.password, hashSource.secret);
  const providedBuffer = Buffer.from(tokenFromCookie);
  const expectedBuffer = Buffer.from(expectedToken);

  // 길이가 다르면 timingSafeEqual에서 예외가 발생하므로 사전 차단
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function loginCommunityAdmin(formData: FormData) {
  const rawPassword = formData.get("password");
  const passwordInput = typeof rawPassword === "string" ? rawPassword.trim() : "";
  const hashSource = getAdminHashSource();

  if (!hashSource) {
    redirect("/community?error=config");
  }

  if (!passwordInput) {
    redirect("/community?error=empty");
  }

  const inputToken = createAdminToken(passwordInput, hashSource.secret);
  const expectedToken = createAdminToken(hashSource.password, hashSource.secret);
  const inputBuffer = Buffer.from(inputToken);
  const expectedBuffer = Buffer.from(expectedToken);

  if (inputBuffer.length !== expectedBuffer.length || !timingSafeEqual(inputBuffer, expectedBuffer)) {
    redirect("/community?error=auth");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, expectedToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8시간
  });

  redirect("/community?admin=1");
}

export async function logoutCommunityAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/community?logout=1");
}

export async function createCommunityPost(formData: FormData) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/community?error=unauthorized");
  }

  const rawTitle = formData.get("title");
  const rawContent = formData.get("content");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const content = typeof rawContent === "string" ? rawContent.trim() : "";

  if (!title || !content) {
    redirect("/community?error=invalid");
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect("/community?error=config");
  }

  const { error } = await supabase.from("community_posts").insert({
    title,
    content,
    // 명시적으로 공개 상태를 넣어둬서 스키마 기본값 누락 시에도 안전
    is_published: true,
  });

  if (error) {
    redirect("/community?error=insert");
  }

  revalidatePath("/community");
  redirect("/community?created=1");
}

export async function getCommunityAdminStatus() {
  return isAdminAuthenticated();
}
