<script setup lang="ts">
defineProps<{
  lives: number;
  maxLives: number;
}>();
</script>

<template>
  <div class="lives-indicator" aria-label="Жизни">
    <span
      v-for="index in maxLives"
      :key="index"
      class="life-heart"
      :class="{ lost: index > lives }"
    >
      ❤️
    </span>
  </div>
</template>

<style scoped>
.lives-indicator {
  display: flex;
  justify-content: center;
  gap: var(--space-inner);
  margin-bottom: var(--space-inner);
  font-size: var(--font-lg);
}

.life-heart.lost {
  filter: grayscale(1);
  opacity: 0.35;
}
</style>
