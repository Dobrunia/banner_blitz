<template>
  <div class="loading-screen">
    <div class="loading-spinner" />
    <p>Загрузка стран...</p>
  </div>
</template>

<style scoped>
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-block);
  flex: 1;
  min-height: 0;
}

@media (max-width: 640px) {
  .loading-screen {
    font-size: var(--font-md);
  }
}

.loading-spinner {
  width: 56px;
  height: 56px;
  border: 5px solid var(--border-color);
  border-top-color: var(--accent);
  border-radius: var(--radius-round);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
