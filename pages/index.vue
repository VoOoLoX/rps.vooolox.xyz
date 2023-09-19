<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    return;
  }

  navigateTo("/login", { replace: true });
};
</script>

<template>
  <div class="flex flex-col gap-8 items-center justify-center w-full h-screen bg-#101010">
    <img
      class="rounded-lg w-3rem h-3rem sm:w-4rem sm:h-4rem"
      :src="'https://api.dicebear.com/7.x/thumbs/svg?size=96&seed=' + user?.id"
      referrerpolicy="no-referrer"
    />
    <p class="text-white text-2xl">{{ user?.email }}</p>
    <a class="bg-white text-black p-4 rounded-lg" href="/game">Play</a>
    <button class="bg-dark text-white p-4 rounded-lg" @click="signOut">Sign out</button>
  </div>
</template>
