<script setup lang="ts">
const supabase = useSupabaseClient();
const email = ref("");

const message = ref({
  success: false,
  text: "",
});

const signInWithOtp = async () => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: "https://rps.vooolox.xyz/confirm",
    },
  });

  if (error) {
    message.value.success = false;
    message.value.text = error.message;
    return;
  }

  if (data) {
    message.value.success = true;
    message.value.text = "E-mail successfully sent";
    return;
  }
};
</script>
<template>
  <div class="flex flex-col gap-8 items-center justify-center w-full h-screen bg-#101010">
    <h1 class="text-3xl text-white text-center">
      Welcome <br />
      to <br />
      Rock Paper Scissors
    </h1>
    <div class="flex flex-col gap-1 w-250px">
      <label for="email" class="text-white text-xs pl-1">E-mail:</label>
      <input
        class="outline-none bg-dark text-white p-2 rounded-lg"
        v-model="email"
        type="email"
        placeholder="example@example.com"
        required
        @input="message.text = ''"
      />
      <p
        :class="(message.success ? 'text-green-500' : 'text-red-500') + ' ' + (message.text ? 'opacity-100' : 'opacity-0')"
        class="pl-1 text-xs h-1rem whitespace-nowrap transition-all"
      >
        {{ message.text }}
      </p>
    </div>
    <button class="bg-dark text-white p-4 rounded-lg" @click="signInWithOtp">Continue with E-Mail</button>
  </div>
</template>
