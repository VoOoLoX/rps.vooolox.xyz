<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

import { Database } from "../types/supabase";
import { REALTIME_LISTEN_TYPES, REALTIME_PRESENCE_LISTEN_EVENTS, REALTIME_SUBSCRIBE_STATES, RealtimeChannel } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

const { gameId = undefined } = defineProps<{
  gameId?: string;
}>();

const GAMES_CHANNEL = "GAMES";
const db = useSupabaseClient<Database>();
const user = useSupabaseUser();

type Move = "rock" | "paper" | "scissors";
type User = {
  id: string;
  moves: Move[];
};
const users = ref<User[]>([]);
const opponent = () => users.value.find((u) => u.id !== user.value?.id);
const myself = () => users.value.find((u) => u.id === user.value?.id);
const getById = (uuid: string) => users.value.find((u) => u.id === uuid);
const hasOpponent = () => !!opponent();

const createNewGameOrJoinExisting = (channel: RealtimeChannel) =>
  channel.on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC }, async () => {
    const state = channel.presenceState<User>();
    if (gameId && gameId in state) {
      const gameState = state[gameId];

      users.value = await Promise.all(
        gameState.map(async (user) => {
          let { data } = await db.from("moves").select("move").eq("player_id", user.id).eq("game_id", gameId);
          const userId = user.id;
          const moves = data?.map((m) => m.move) as Move[] | null;

          return {
            id: userId,
            moves,
          } as User;
        })
      );
    }
  });

if (!gameId) {
  navigateTo(`/game/${nanoid()}`, {
    replace: true,
  });
}

const gameChannel = db.channel(GAMES_CHANNEL, {
  config: { presence: { key: gameId } },
});

createNewGameOrJoinExisting(gameChannel).subscribe(async (status: `${REALTIME_SUBSCRIBE_STATES}`) => {
  if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
    const { id } = user.value;
    await gameChannel.track({ id });
  }
});

db.channel(`MOVES-${gameId}`)
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "moves", filter: `game_id=eq.${gameId}` }, (payload) => {
    const inserted = payload.new as Database["public"]["Tables"]["moves"]["Row"];
    getById(inserted.player_id)?.moves.push(inserted.move);
  })
  .subscribe();

const showOpponentsMove = (allowFirst = false) => {
  const m = myself();
  const o = opponent();
  if (!o || !m) return false;
  if (allowFirst && o.moves.length === 0 && m.moves.length === 0) return false;
  if (o.moves.length === m.moves.length) return true;
};

const waitingForOpponent = (allowFirst = false) => {
  const m = myself();
  const o = opponent();
  if (!o || !m) return true;
  if (allowFirst && o.moves.length === 0 && m.moves.length === 0) return false;
  if (o.moves.length === 0 && m.moves.length === 0) return true;
  if (o.moves.length < m.moves.length) return true;
  else return false;
};

const calculateScore = (): { myself: number; opponent: number } | undefined => {
  const m = myself();
  const o = opponent();
  if (!o || !m) return;
  if (o.moves.length !== m.moves.length) return;
  let score = {
    myself: 0,
    opponent: 0,
  };

  m.moves.forEach((move, index) => {
    if (move === o.moves[index]) return;
    if (move === "rock" && o.moves[index] === "scissors") score.myself += 1;
    if (move === "paper" && o.moves[index] === "rock") score.myself += 1;
    if (move === "scissors" && o.moves[index] === "paper") score.myself += 1;
    if (move === "rock" && o.moves[index] === "paper") score.opponent += 1;
    if (move === "paper" && o.moves[index] === "scissors") score.opponent += 1;
    if (move === "scissors" && o.moves[index] === "rock") score.opponent += 1;
  });

  return score;
};

const myScore = () => calculateScore()?.myself;
const opponentScore = () => calculateScore()?.opponent;

const makeMove = async (move: Move) => {
  if (!gameId) {
    return;
  }

  const { error } = await db.from("moves").insert({ game_id: gameId, move });

  if (error) {
    console.log(error);
    return;
  }
};

const copyGameUrl = () => {
  navigator.clipboard.writeText(`http://localhost:1337/game/${gameId}`);
};

const moveToIcon = (move?: Move) => {
  switch (move) {
    case "rock":
      return "i-noto-rock";
    case "paper":
      return "i-noto-scroll";
    case "scissors":
      return "i-noto-scissors";
  }
};
</script>

<template>
  <main class="flex flex-col w-full h-full bg-#101010">
    <div class="flex flex-col gap-8 items-center justify-center h-50vh">
      <pre v-if="!hasOpponent()" @click="copyGameUrl()" class="text-white bg-black p-2 rounded-4 cursor-copy">http://localhost:1337/game/{{ gameId }}</pre>
      <h1 class="text-1.5rem text-white">You</h1>
      <img
        class="rounded-lg w-3rem h-3rem sm:w-4rem sm:h-4rem"
        :src="'https://api.dicebear.com/7.x/thumbs/svg?size=96&seed=' + user.id"
        referrerpolicy="no-referrer"
      />
      <div v-if="hasOpponent()" class="flex items-center gap-2">
        <p v-for="move in myself()?.moves" :class="moveToIcon(move)"></p>
      </div>

      <div class="flex w-full items-center justify-around">
        <button
          @click="makeMove('rock')"
          :disabled="!hasOpponent() || waitingForOpponent(true)"
          class="p-4 text-3rem sm:text-5rem disabled:pointer-events-none disabled:filter-grayscale hover:bg-#80808080 transition-all bg-transparent rounded-2xl group"
        >
          <p class="transition-all group-hover:scale-125 i-noto-rock"></p>
        </button>
        <button
          @click="makeMove('paper')"
          :disabled="!hasOpponent() || waitingForOpponent(true)"
          class="p-4 text-3rem sm:text-5rem disabled:pointer-events-none disabled:filter-grayscale hover:bg-#80808080 transition-all bg-transparent rounded-2xl group"
        >
          <p class="transition-all group-hover:scale-125 i-noto-scroll"></p>
        </button>
        <button
          @click="makeMove('scissors')"
          :disabled="!hasOpponent() || waitingForOpponent(true)"
          class="p-4 text-3rem sm:text-5rem disabled:pointer-events-none disabled:filter-grayscale hover:bg-#80808080 transition-all bg-transparent rounded-2xl group"
        >
          <p class="transition-all group-hover:scale-125 i-noto-scissors"></p>
        </button>
      </div>
      <h2 v-if="myScore() !== undefined" class="text-2rem sm:text-3rem text-white">{{ myScore() }}</h2>
    </div>
    <div class="absolute top-50% h-3px w-full bg-dark"></div>
    <div class="flex flex-col-reverse gap-8 items-center justify-center h-50vh">
      <div v-if="opponent()" class="flex flex-col-reverse gap-8 items-center justify-center">
        <!-- <h1 class="text-1.5rem text-white">Opponent</h1> -->
        <img
          class="rounded-lg w-3rem h-3rem sm:w-4rem sm:h-4rem"
          :src="'https://api.dicebear.com/7.x/thumbs/svg?size=96&seed=' + opponent()?.id"
          referrerpolicy="no-referrer"
        />
        <div v-if="showOpponentsMove()" class="flex items-center gap-2">
          <p v-for="move in opponent()?.moves" :class="moveToIcon(move)"></p>
        </div>

        <div v-if="!showOpponentsMove(true)" class="p-4 text-3rem sm:text-5rem">
          <p :class="waitingForOpponent() ? 'i-noto-one-oclock animate-pulse animate-count-infinite animate-duration-1s' : 'i-noto-check-mark'"></p>
        </div>
        <div v-else class="p-4 text-3rem sm:text-5rem">
          <p :class="moveToIcon(opponent()?.moves.at(-1))"></p>
        </div>
      </div>
      <div v-else>
        <p class="text-3rem sm:text-5rem i-noto-one-oclock animate-pulse animate-count-infinite animate-duration-1s"></p>
      </div>
      <h2 v-if="opponentScore() !== undefined" class="text-2rem sm:text-3rem text-white">{{ opponentScore() }}</h2>
    </div>
  </main>
</template>
