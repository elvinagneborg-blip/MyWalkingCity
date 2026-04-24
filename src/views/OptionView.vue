<template>
    <main class="option-page">
       
      <!--Allmän header för alla sidor  -->
      <WebbHeader />
  
      <!--Header specifik för sidan -->
    <section class="option-header">
        <h2 class="option-title"> What do you want to report? </h2>
    </section>

    <!-- Report / highligt knappar -->
    <div class="content">
    <div class="option-buttons">
        <button class="main-option" @click="goToReport">
            <span class="icon">⚠</span>
            <span>Problem</span>
        </button>

        <button class="main-option" @click="goToHighlight">
            <span class="icon">👍</span>
            <span>Highlight</span>
        </button>
    </div>

    <!-- All reports / Back to home knappar -->
    <div class="secondary-buttons">
        <button class="secondary-option" @click="goAllReports">All reports</button>
        <button class="secondary-option" @click="goHome">Back to home</button>
      </div>
    </div>
    </main>
</template>

<!-- JS basic -->
<script setup>
import { useRouter } from 'vue-router'
import WebbHeader from '@/components/WebbHeader.vue'

const router = useRouter()
const goToReport = () => {
  router.push({ name: 'ReportView' })
}

const goToHighlight = () => {
  router.push({ name: 'HighlightView' })
}

const goHome = () => {
    router.push({ name: 'StartMWC' })
}

const goAllReports = () => {
    router.push({name: 'AllReportsView' })
}


</script>

<!--CSS - basci-->
<style scoped>
/* ===== Option sidan - standard ===== */
.option-page {
    min-height: 100vh;
    background-color: #f2f2f2;
    display: flex;
    flex-direction: column;
    font-family: Arial, sans-serif;
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 1.5rem;
    text-align: center;
}

.option-title {
    font-size: 3rem;
    line-height: 1.1;
    font-weight: 700;
    color: black;
    margin-bottom: 4rem;
}

/* ===== knappar ===== */
.option-buttons {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 5rem;
}

.main-option {
    background-color: #27c4b2;
    color: white;
    border: none;
    border-radius: 14px;
    padding: 1.6rem 1.5rem;
    font-size: 2rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    cursor: pointer;
    transition: transform 0.15s ease, opacity 0.15s ease;
}

.main-option:hover {
    transform: scale(1.02);
    opacity: 0.95;
}

.icon {
    font-size: 2rem;
}

.secondary-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.secondary-option {
    background-color: #9be0d7;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 1.4rem;
    font-weight: 600;
    cursor: pointer;
}


</style>