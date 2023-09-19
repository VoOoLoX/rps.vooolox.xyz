<script setup lang="ts">
const { gameId }: { gameId?: string } = useRoute().params;
</script>

<template>
  <Game :gameId="gameId"></Game>
</template>
