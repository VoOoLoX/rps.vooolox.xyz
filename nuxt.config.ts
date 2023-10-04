// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@unocss/nuxt"],
  supabase: {},
  runtimeConfig: {
    public: {
      mixpanelToken: process.env.NUXT_MIXPANEL_TOKEN,
    },
  },
});
