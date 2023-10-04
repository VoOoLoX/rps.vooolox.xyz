<script setup lang="ts">
import mixpanel from "mixpanel-browser";

const user = useSupabaseUser();

watch(
  user,
  () => {
    if (user.value) {
      mixpanel.identify(user.value.id);
      mixpanel.track("User signed in", { user: user.value.email });
      return navigateTo("/");
    }
  },
  { immediate: true }
);
</script>
<template>
  <div>Waiting for login...</div>
</template>
