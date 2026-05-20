<template>

    <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
        <p>{{ uiLabels.loadingMWC }}</p>
    </div>

    <main v-else>
    <section class="option-page" @click="activeInfo = null" >
      <!--Header specifik för sidan -->
    <section class="option-header">
        <h2 class="option-title"> {{ uiLabels.whatYouWantReport }} </h2>
    </section>

    <!-- Report / highligt knappar -->
    <div class="content">
        <div class="option-buttons">

        <div class="option-row">
            <button class="info-button" @click.stop="toggleInfo('problem')">i</button>

            <RouterLink :to="{ name: 'ProblemView' }" class="main-option">
                <span class="icon">⚠</span>
                    <span> {{ uiLabels.problem }} </span>
            </RouterLink>

        <div v-if="activeInfo === 'problem'" class="info-box">
            {{uiLabels.problemInfo}}
        </div>
        </div>

        <div class="option-row">
            <button class="info-button" @click.stop="toggleInfo('highlight')">i</button>
         
            <RouterLink :to="{ name: 'HighlightView' }" class="main-option">
                <span class="icon">👍</span>
                    <span> {{ uiLabels.highlight }} </span>
            </RouterLink>

            <div v-if="activeInfo === 'highlight'" class="info-box">
            {{uiLabels.highlightInfo}}
            </div>
        </div>
    </div>

    <!-- All reports / Back to home knappar -->
    <div class="secondary-buttons">
        <RouterLink :to="{ name: 'AllReportsView' }" class="btn secondary-option"> {{ uiLabels.allReports }} </RouterLink>
        <RouterLink :to="{ name: 'StartMWC' }" class="btn secondary-option"> {{ uiLabels.backToHome }} </RouterLink>
      </div>
    </div>

</section>
    </main>
</template>


<script setup>
    //Imports
    import { ref, watch } from 'vue'
    import io from 'socket.io-client' //kontakt med server

    //Setup and Props (Input)
    const props = defineProps(['backendURL', 'currentLang']) //ta emot språkval från app.vue    
    const socket = io(props.backendURL)

     //UI and language
    const uiLabels = ref({})                      //Språkknappar/uiLabels

    socket.on("uiLabels", (labels) => {           //Lyssnare för uiLabels
        uiLabels.value = labels
    })

    watch(() => props.currentLang, (newLang) => {       //vakta språkvalet, ligger alltid och lyssnar
        socket.emit("getUILabels", newLang || "en");    //Hämtar uiLabels enl. valt språk
    }, { immediate: true })                             //Språket laddas direkt när sidan laddas, istället för att vänta på att språket ska ändras 1a gngen

    //info ruta
    const activeInfo = ref(null)

    const toggleInfo = (type) => {
        activeInfo.value = activeInfo.value === type ? null : type
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
    text-decoration: none;
    box-sizing: border-box;

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
    text-decoration: none;
    box-sizing: border-box;
}
.option-row {
    position: relative;
    width: 100%;
}

.main-option {
    width: 100%;
}

.info-button {
    position: absolute;
    left: calc(100% + 1rem);
    top: 50%;
    transform: translateY(-50%);

    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: none;

    background-color: #9be0d7;
    color: white;
    font-weight: 700;
    cursor: pointer;
}

.info-box {
    position: absolute;
    left: calc(100% + 3rem);
    top: 50%;
    transform: translateY(-50%);

    width: 11rem;
    background-color: white;
    color: black;
    padding: 0.8rem;
    border-radius: 10px;
    font-size: 0.9rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    text-align: left;
}

@media (max-width: 600px) {
    .content {
        padding: 2rem 1rem;
    }

    .option-title {
        font-size: 2rem;
        margin-top: 4rem;
        margin-bottom: 5rem;
    }

    .option-buttons {
        max-width: 260px;
        gap: 1rem;
        margin-bottom: 5rem;
    }

    .main-option {
        padding: 1rem;
        font-size: 1.4rem;
        border-radius: 12px;
    }

    .icon {
        font-size: 1.4rem;
    }

    .secondary-option {
        padding: 0.8rem 1rem;
        font-size: 0.8rem;
    }

    .info-button {
        left: calc(100% + 0.5rem);
    }


    .info-box {
        left: 0;
        top: calc(100% + 0.5rem);
        transform: none;

        width: 100%;
        box-sizing: border-box;
        font-size: 0.8rem;
        text-align: center;
        z-index: 10;
    }


}



</style>