<template>
    <main v-if="uiLabels && Object.keys(uiLabels).length > 0">

    <section class="option-page">
      <!--Header specifik för sidan -->
    <section class="option-header">
        <h2 class="option-title"> {{ uiLabels.whatYouWantReport }} </h2>
    </section>

    <!-- Report / highligt knappar -->
    <div class="content">
    <div class="option-buttons">
        <button class="main-option" @click="goToProblem">
            <span class="icon">⚠</span>
            <span> {{ uiLabels.problem }} </span>
        </button>

        <button class="main-option" @click="goToHighlight">
            <span class="icon">👍</span>
            <span> {{ uiLabels.highlight }} </span>
        </button>
    </div>

    <!-- All reports / Back to home knappar -->
    <div class="secondary-buttons">
        <button class="secondary-option" @click="goAllReports"> {{ uiLabels.allReports }} </button>
        <button class="secondary-option" @click="goHome"> {{ uiLabels.backToHome }} </button>
      </div>
    </div>
</section>
    </main>
</template>


<script setup>
    //Imports
    import { ref, onMounted, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import io from 'socket.io-client' //kontakt med server


    //Setup and Props (Input)
    const socket = io("localhost:3000")
    const props = defineProps(['currentLang']) //ta emot språkval från app.vue    

    //Data
    const router = useRouter()
    const uiLabels = ref({})

    //Socket listeners
    socket.on("uiLabels", (labels) => {
        uiLabels.value = labels
    })

    //Watchers
    watch(() => props.currentLang, (newLang) => { //vakta språket
        socket.emit("getUILabels", newLang);
    }, { immediate: true }); //Språket laddas direkt när sidan laddas

    //Methods
    const goToProblem = () => {
        router.push({ name: 'ProblemView' })
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

.main-option:hover, .secondary-option:hover {
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