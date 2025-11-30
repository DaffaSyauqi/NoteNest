// middleware/auth.js
export default defineNuxtRouteMiddleware(async () => {
  if (process.server) return;

  const token = useCookie("JWTtoken");

  if (!token.value) {
    return navigateTo("/register");
  }

  try {
    const { valid } = await $fetch("/api/verify-token", {
      method: "POST",
      body: { token: token.value },
    });

    if (!valid) {
      return navigateTo("/register");
    }
  } catch (error) {
    return navigateTo("/register");
  }
});
