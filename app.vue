<script setup lang="ts">
import "@unocss/reset/tailwind-compat.css";
import mixpanel from "mixpanel-browser";

useHead({
  title: "Rock Paper Scissors",
});

const { mixpanelToken } = useRuntimeConfig().public;

mixpanel.init(mixpanelToken, {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
  ignore_dnt: true,
});
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
