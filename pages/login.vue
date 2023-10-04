<script setup lang="ts">
import mixpanel from "mixpanel-browser";

const supabase = useSupabaseClient();
const email = ref("");

const message = ref({
  success: false,
  text: "",
});

const isValidEmail = (text: string) =>
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(text);

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
    mixpanel.track("Error sending email", { error });
    return;
  }

  if (data) {
    message.value.success = true;
    message.value.text = "E-mail successfully sent";
    mixpanel.track("Email sent", { email: email.value });
    return;
  }
};

const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectTo: "https://rps.vooolox.xyz/confirm",
    },
  });

  if (error) {
    mixpanel.track("Google signin error", { error });
    return;
  }

  if (data) {
    mixpanel.track("Google signin");
    return;
  }
};

const signInWithMicrosoft = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      scopes: "email,offline_access",
      redirectTo: "https://rps.vooolox.xyz/confirm",
    },
  });

  if (error) {
    mixpanel.track("Microsoft signin error", { error });
    return;
  }

  if (data) {
    mixpanel.track("Microsoft signin");
    return;
  }
};
</script>
<template>
  <div class="flex flex-col gap-8 items-center justify-center w-full h-screen dark:bg-#101010">
    <h1 class="text-3xl dark:text-white text-center">
      Welcome <br />
      to <br />
      Rock Paper Scissors
    </h1>
    <div class="flex flex-col gap-1 w-250px">
      <label for="email" class="dark:text-white text-xs pl-1">E-mail:</label>
      <input
        class="outline-none dark:bg-dark bg-light dark:text-white p-2 rounded-lg"
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
    <button
      :disabled="!isValidEmail(email)"
      class="dark:bg-dark dark:text-white p-4 rounded-lg dark:hover:bg-#80808080 transition-all disabled:pointer-events-none dark:disabled:bg-#0f0f0f"
      @click="signInWithOtp()"
    >
      Continue with E-mail
    </button>
    <hr class="dark:border-dark w-8rem" />
    <div class="flex gap-4">
      <button class="flex items-center gap-2 dark:bg-dark dark:text-white p-4 rounded-lg hover:bg-#80808080 transition-all" @click="signInWithGoogle()">
        <p class="text-1.5rem i-logos-google-icon"></p>
      </button>
      <button class="flex items-center gap-2 dark:bg-dark dark:text-white p-4 rounded-lg hover:bg-#80808080 transition-all" @click="signInWithMicrosoft()">
        <p class="text-1.5rem i-logos-microsoft-icon"></p>
      </button>
    </div>
  </div>
</template>
