<template>
  <div class="floating-shapes" aria-hidden="true">
    <span class="shape shape--circle shape--1" />
    <span class="shape shape--circle shape--2" />
    <span class="shape shape--triangle shape--3" />
    <span class="shape shape--square shape--4" />
    <span class="shape shape--circle shape--5" />
    <span class="shape shape--ring shape--6" />
    <span class="shape shape--triangle shape--7" />
    <span class="shape shape--square shape--8" />
  </div>
</template>

<style scoped>
.floating-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.shape {
  position: absolute;
  opacity: 0.45;
}

.shape--circle {
  border-radius: var(--radius-round);
  background: color-mix(in srgb, var(--accent) 55%, transparent);
}

.shape--ring {
  border: 3px solid color-mix(in srgb, var(--accent) 70%, transparent);
  border-radius: var(--radius-round);
  background: transparent;
}

.shape--square {
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--text-secondary) 25%, transparent);
  transform: rotate(18deg);
}

.shape--triangle {
  width: 0;
  height: 0;
  border-right: 18px solid transparent;
  border-bottom: 32px solid color-mix(in srgb, var(--accent) 50%, transparent);
  border-left: 18px solid transparent;
  background: transparent;
}

.shape--1 {
  top: 8%;
  left: 6%;
  width: 48px;
  height: 48px;
  animation: drift-a 14s ease-in-out infinite;
}

.shape--2 {
  top: 18%;
  right: 10%;
  width: 32px;
  height: 32px;
  animation: drift-b 11s ease-in-out infinite;
}

.shape--3 {
  top: 42%;
  left: 12%;
  animation: drift-c 16s ease-in-out infinite;
}

.shape--4 {
  bottom: 28%;
  right: 14%;
  width: 40px;
  height: 40px;
  animation: drift-d 13s ease-in-out infinite;
}

.shape--5 {
  bottom: 12%;
  left: 20%;
  width: 56px;
  height: 56px;
  animation: drift-b 18s ease-in-out infinite reverse;
}

.shape--6 {
  top: 55%;
  right: 22%;
  width: 64px;
  height: 64px;
  animation: drift-a 20s ease-in-out infinite reverse;
}

.shape--7 {
  top: 72%;
  left: 8%;
  animation: drift-d 15s ease-in-out infinite reverse;
}

.shape--8 {
  top: 6%;
  right: 28%;
  width: 28px;
  height: 28px;
  animation: drift-c 12s ease-in-out infinite reverse;
}

@keyframes drift-a {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(28px, -36px) rotate(12deg);
  }
}

@keyframes drift-b {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-24px, 30px) scale(1.15);
  }
}

@keyframes drift-c {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(20px, 18px) rotate(-8deg);
  }
  66% {
    transform: translate(-16px, -22px) rotate(10deg);
  }
}

@keyframes drift-d {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(32px, 24px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .shape {
    animation: none;
  }
}
</style>
