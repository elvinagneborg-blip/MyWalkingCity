<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p>Laddar My Walking City...</p>
  </div>

  <main v-else class="allreports-page">
      <!--Header specifik för sidan -->
    <section class="allreports-header">
        <h2 class="allreports-title"> {{uiLabels.allReports}} </h2>
    </section>

    <!-- Sektion för kart-området -->
    <section class="allreports-map-section">
        <div class="allreports-map-container">
            <MapComponent />

        
            <!--Recent reports knapp -->            
            <button 
                v-if="!showRecentReports"
                class="allreports-recent-report-button"
                @click="showRecentReports = true">
                {{uiLabels.recentReports}}
            </button>
          
        </div>
          <!-- Panel med recent reports -->
            <aside v-if="showRecentReports" class="allreports-recent-report-panel">
                <div class="allreports-recent-report-header">
                    <h3 class="allreports-recent-report-title"> {{uiLabels.recentReports}} </h3>
                    <button
                        class="allreports-close-recent-report-panel"
                        @click="showRecentReports = false"
                        aria-label="Close recent report">
                        x
                    </button>
                </div>

         <div class="report-list">
            <!-- Visas om det är tomt i sessionStorage -->
        <div v-if="allUserReports.length === 0">
            <p> {{ uiLabels.noReportsSubmitted }}</p>
        </div>

            <!-- Loopar igenom den hämtade datan -->
        <RecentReport 
            v-else
            v-for="report in allUserReports" 
            :key="report.id" 
            :report="report"
            :session="session"
        />
        </div>
            </aside>
    </section>
    </main>

</template>


<script setup>
//Imports
  import { ref, onMounted, watch } from 'vue' //för att kunna ha reaktiva variabler och övervaka dem
  import { useBoost } from '@/composables/useBoost' //för att kunna använda boost funktionen
  import io from 'socket.io-client' //kontakt med server
    import MapComponent from "@/components/MapComponent.vue";
    import { supabase } from '@/utils/supabase' // @ pekar oftast på src-mappen
    import RecentReport from '@/components/RecentReport.vue'

//Setup and Props (Input)
  const socket = io("localhost:3000")
  const props = defineProps(['currentLang', 'session']) //ta emot språkval från app.vue
  const { handleBoost, isBoosting } = useBoost()

  //Data
  const uiLabels = ref({})
  const showRecentReports = ref(false)
  const allUserReports = ref([])

  //Socket listeners
  socket.on("uiLabels", (labels) => {
    uiLabels.value = labels
  })

  //Watchers
  watch(() => props.currentLang, (newLang) => { //vakta språket
    if (newLang) {
      socket.emit("getUILabels", newLang);
    } else {
      socket.emit("getUILabels", "en"); //Om språkvalet inte hunnits skickas ner, kör på eng
    }
  }, { immediate: true }); //Språket laddas direkt när sidan laddas

async function getReports() {
  const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', {ascending: false})
      .limit(5) //hämtar 5 stycken rapporter
  allUserReports.value = data
  console.log('Rapporter från databasen:', data)
}



onMounted(async () => {
  await getReports()
})

</script>



<style scoped>
    * { box-sizing: border-box;
    }

/* ===== allreports sidan - standard ===== */
.allreports-page {
    background-color: #f5f5f5;
    min-height: 100vh;
    font-family: Arial, sans-serif;
    color: #111;
    padding-bottom: 32px;
}

/* ===== Sidans enga rubrik ===== */
.allreports-header {
    width: min(92%, 900px);
    margin: 0 auto;
    padding: 16px 0;
}

.allreports-title {
    margin: 0; 
}

/* ===== Kart - området ===== */
.allreports-map-section {
    width: 100%;
}

/* Denna box MÅSTE ha en höjd för att kartan ska synas */
.allreports-map-container {
    position: relative;
    width: 100%;
    height: 75vh;  /* Ge boxen höjd här! */
    overflow: hidden;
    z-index: 1;
}

/* Denna tvingar själva Leaflet-biblioteket att fylla hela boxen */
.allreports-map-container :deep(.leaflet-container) {
    width: 100%;
    height: 100%;
}

.allreports-map-image {
    display: block; /*fyller containen med bilden*/
    width: 100%;
    height: 100%;
    object-fit: cover;/*ser till så att bilden ställer in sig rätt till containern*/
    border-radius: 12px;
}

/* ===== Recent report knapp =====*/
.allreports-recent-report-button {
    position: absolute;
    right: 20px;
    bottom: 20px;
    background-color: #20c7b5;
    color: black;
    border: none;
    border-radius: 999px;
    padding: 14px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer; /*när man hovrar blir de en hand */
    z-index: 1000;
}

/* ===== Recent report panel =====*/
.allreports-recent-report-panel {
    position: relative;
    margin-top: -570px;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #eeeeee;
    border-radius: 24px 24px 0 0;
    padding: 20px 20px 28px;
    z-index: 1200; /* för att den ska ligga ovanpå kartan, så länge de har största z - index värdet */
}

.allreports-recent-report-header {
    position: relative; /* Detta gör att knappen utgår från denna box */
    width: 100%;        /* Sträck ut över hela panelens bredd */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 20px;    /* Ger lite luft på sidorna */
}

.allreports-recent-report-title {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    text-align: center;
}

.allreports-close-recent-report-panel {
    position: absolute;
    right: 0;           /* Lägg den längst till höger i headern */

    
    background: #20c7b5; /* Din gröna färg som bakgrund gör den lättare att se */
    color: white;
    border: none;
    border-radius: 50%;  /* Gör den rund */
    width: 36px;
    height: 36px;
    
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;         /* Se till att den ligger överst */
}


/* ===== Recent report listan  =====*/

.allreports-recent-report-list {
    display: flex;
    flex-direction: column;
    gap: 28px;
}

.allreports-recent-report-item {
    display: flex;
    align-items: flex-start;
    gap: 24px;
    padding-bottom: 24px;
    border-bottom: 2px solid #d9d9d9;
}

.allreports-recent-report-item:last-child { /*space för nästa report*/
    border-bottom: none;
    padding-bottom: 0;
}

/* ===== Recent report texten i listan =====*/

.allreports-recent-report-text {
    margin: 0;
}

.allreports-recent-report-text dt {
    font-weight: 700;
    display: inline;
}

.allreports-recent-report-text dd {
    display: inline;
    margin: 0 0 10px 6px;
}

.allreports-recent-report-text dd::after { /*för att lägga in en osynlig radbrytning efter varje dd*/
    content: "";
    display: block; /*tvingar på en ny rad*/
}

.report-thumb {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    margin-left: 15px;
}

.boost-action-btn {
    margin-top: 10px;
    padding: 6px 12px;
    background-color: #ffd700; /* Guld/Gul för boost */
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
    transition: transform 0.2s;
}

.boost-action-btn:hover {
    transform: scale(1.05);
}

.boost-action-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.report-content {
    flex: 1; /* Gör att texten tar upp platsen till vänster om bilden */
}

</style>
