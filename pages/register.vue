<template>
  <div class="flex bg-zinc-900 h-screen">
    <div class="bg-black w-[516px] flex flex-col justify-center p-12">
      <Logo />

      <h1 class="text-white font-bold text-lg mt-8">
        Sign up for a free account
      </h1>
      <p class="text-zinc-300 mt-1">
        Already registered?
        <nuxt-link to="/login" class="font-bold text-[#FFAC00] underline"
          >Sign in</nuxt-link
        >
        to your account
      </p>

      <form @submit.prevent="submit">
        <div class="mt-8">
          <label class="text-zinc-300 text-sm block mb-1" for=""
            >Email Address</label
          >
          <input
            v-model="email"
            class="block w-full bg-[#27272A] border border-[#3F3F46] rounded text-white px-4 py-2 placheholder:text-zinc-500 text-sm"
            type="email"
            placeholder="you@example.com"
          />
        </div>
        <div class="mt-6">
          <label class="text-zinc-300 text-sm block mb-1" for=""
            >Password</label
          >
          <input
            v-model="password"
            class="block w-full bg-[#27272A] border border-[#3F3F46] rounded text-white px-4 py-2 placheholder:text-zinc-500 text-sm"
            type="password"
            placeholder="**********"
          />
        </div>

        <div>
          <button
            class="w-full mt-4 bg-[#FFAC00] rounded-full px-4 py-2 font-bold text-sm flex items-center justify-center space-x-2"
          >
            <span>Sign Up</span>
            <IconArrowRight />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import Swal from "sweetalert2";

const email = ref("");
const password = ref("");

async function submit() {
  try {
    const response = await $fetch("/api/user", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
    });

    const { isConfirmed } = await Swal.fire({
      icon: "success",
      title: "Success",
      text: "Account created successfully",
    });

    if (isConfirmed) {
      navigateTo("/");
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?._data?.message,
    });
  }
}
</script>
