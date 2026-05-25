<template>
  <div class="bouncing-emojis" aria-hidden="true">
    <span v-for="item in items" :key="item.id" class="emoji" :class="item.className">{{ item.glyph }}</span>
  </div>
</template>

<script setup lang="ts">
const items = [
  { id: 1, glyph: '🏳️', className: 'emoji--1' },
  { id: 2, glyph: '🌍', className: 'emoji--2' },
  { id: 3, glyph: '✨', className: 'emoji--3' },
  { id: 4, glyph: '🎯', className: 'emoji--4' },
  { id: 5, glyph: '⭐', className: 'emoji--5' },
  { id: 6, glyph: '🧩', className: 'emoji--6' },
];
</script>

<style scoped>
.bouncing-emojis {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.emoji {
  position: absolute;
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  filter: drop-shadow(0 4px 8px var(--shadow));
  user-select: none;
}

.emoji--1 {
  top: 14%;
  left: 18%;
  animation: bounce-a 4.2s ease-in-out infinite;
}

.emoji--2 {
  top: 22%;
  right: 16%;
  animation: bounce-b 5s ease-in-out infinite;
}

.emoji--3 {
  top: 48%;
  left: 6%;
  animation: bounce-c 3.8s ease-in-out infinite;
}

.emoji--4 {
  bottom: 30%;
  right: 8%;
  animation: bounce-a 4.6s ease-in-out infinite reverse;
}

.emoji--5 {
  bottom: 14%;
  left: 28%;
  animation: bounce-b 5.4s ease-in-out infinite reverse;
}

.emoji--6 {
  top: 62%;
  right: 30%;
  animation: bounce-c 4.4s ease-in-out infinite reverse;
}

@keyframes bounce-a {
  0%,
  100% {
    transform: translateY(0) rotate(-6deg);
  }
  50% {
    transform: translateY(-28px) rotate(8deg);
  }
}

@keyframes bounce-b {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-18px, -32px) scale(1.12);
  }
}

@keyframes bounce-c {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  35% {
    transform: translateY(-20px) scale(1.08);
  }
  70% {
    transform: translateY(8px) scale(0.95);
  }
}

@media (prefers-reduced-motion: reduce) {
  .emoji {
    animation: none;
  }
}
</style>
