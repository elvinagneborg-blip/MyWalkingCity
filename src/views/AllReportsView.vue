<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p>{{uiLabels.loadingMWC}}</p>
  </div>

  <main v-else class="allreports-page">
      <!--Header specifik för sidan -->
    <section class="allreports-header">
        <h2 class="allreports-title"> {{uiLabels.allReports}} </h2>
    </section>

    <!-- Sektion för kart-området -->
    <section class="allreports-map-section">
        <div class="allreports-content-wrapper">
        <div class="allreports-map-container" :class="{ 'shift-left': showRecentReports }">
          <MapComponent ref="mapRef" :allReports="filteredReports" :showReportId="selectedReportId"/> <!--Skickar alla reapporter till kartan som ritar upp pluppar-->

          <!-- Filter knapp -->
          <details class="allreports-filter-dropdown"> <!--details: för att få en dropp down meny-->
            <summary class="allreports-filter-button">
              {{uiLabels.filter}}
            </summary>

            <!-- Huvudfilter: alla/problem/highlights -->
            <div class="allreports-filter-menu">
              <button
                class="allreports-filter-option"
                @click="selectType('all')">
                {{ uiLabels.showAll }}
              </button>

              <button
                class="allreports-filter-option"
                @click="selectType('problem')">
                {{uiLabels.problems}}
              </button>

              <button
                class="allreports-filter-option"
                @click="selectType('highlight')">
                {{uiLabels.highlights}}
              </button>

              <!-- Underkategorier visas bara när problem eller highlight är valt -->
              <div v-if="selectedType !== 'all'" class="allreports-category-options">

                <p class="allreports-filter-subtitle">
                  {{uiLabels.category}}
                </p>

                <button
                  v-for="category in availableCategories"
                  :key="category"
                  class="allreports-filter-option"
                  @click="selectCategory(category)">
                  {{ formatCategory(category) }}
                </button>
              </div>
            </div>
          </details>

        
            <!--Recent reports knapp -->            
            <button 
                v-if="!showRecentReports"
                class="allreports-recent-report-button"
                @click="showRecentReports = true">
                {{uiLabels.recentReports}}
            </button>
          
        </div>
          <!-- List med recent reports -->
        <ReportPanel
            v-if="showRecentReports"
            :title="uiLabels.recentReports"
            :reports="filteredRecentReports"
            :session="session"
            :emptyMessage="uiLabels.noReportsSubmitted"
            @close="showRecentReports = false"
            />
        </div>
    </section>
    </main>
</template>


<script setup>
//Imports
  import { ref, onMounted, watch } from 'vue' //för att kunna ha reaktiva variabler och övervaka dem
  import { useBoost } from '@/composables/useBoost' //för att kunna använda boost funktionen
  import { useReportFilters } from '@/composables/useReportFilter'
  import io from 'socket.io-client' //kontakt med server
  import MapComponent from "@/components/MapComponent.vue"
  import { supabase } from '@/utils/supabase' // @ pekar oftast på src-mappen
  import ReportPanel from '@/components/ReportPanel.vue'
  import { useRoute } from 'vue-router'
  
  //Setup and Props (Input)
  const props = defineProps(['backendURL', 'currentLang', 'session']) //ta emot språkval från app.vue
  const { handleBoost, isBoosting } = useBoost()
  const socket = io(props.backendURL)

  const route = useRoute() // 2. Aktivera verktyget för att läsa av URL:en
  const selectedReportId = ref(null) // 3. Denna kommer hålla koll på rapport-ID:t vi klickade på
  const mapRef = ref(null)

   //UI and language
  const uiLabels = ref({})                      //Språkknappar/uiLabels

  socket.on("uiLabels", (labels) => {           //Lyssnare för uiLabels
    uiLabels.value = labels
  })

  watch(() => props.currentLang, (newLang) => { //vakta språkvalet, ligger alltid och lyssnar
    socket.emit("getUILabels", newLang || "en");        //Hämtar uiLabels enl. valt språk
  }, { immediate: true })                       //Språket laddas direkt när sidan laddas, istället för att vänta på att språket ska ändras 1a gngen


  //All reports
  const allReportMarkers = ref([])


  async function getAllReportMarkers() {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
    if (!error) {
        console.log("Hämtade markörer från Supabase:", data)
      allReportMarkers.value = data
    } else {
      console.error("Kunde inte hämta alla rapporter till kartan:", error.message)
    }
  }

  //Recent reports
  const showRecentReports = ref(false)
  const allUserReports = ref([]) //byta namn?
  
  async function getReports() {         //Ev. ändra och hämta 
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', {ascending: false})
      .limit(5) //hämtar 5 stycken rapporter
    if (!error) {
        allUserReports.value = data
    }
    else {
      console.error("Could not fetch latest reports:", error.message) 
    }
    }

    // Om man kommer från recent report
    watch(() => route.query.selectedReport, (newId) => {
        if (newId) {
            selectedReportId.value = newId   // Sparar undan ID:t
            showRecentReports.value = false // Stänger panelen så kartan blir synlig!
  }
}, { immediate: true }) // immediate: true gör att den kollar direkt när sidan laddas

//Filtrering
const {
  selectedType,
  selectedCategory,
  selectType,
  selectCategory,
  filteredReports,
  filteredRecentReports,
  availableCategories
} = useReportFilters(allReportMarkers, allUserReports)

function formatCategory(category) {
  return category.replaceAll('_', ' ')
}

//Lifecycle hooks
  onMounted(async () => {
    await getReports()
    await getAllReportMarkers() 
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

/* ===== Filter ===== */
.allreports-filter-dropdown {
  position: absolute;
  left: 50px;
  top: 20px;
  z-index: 1000;
}

.allreports-filter-button {
  list-style: none;
  background-color: #20c7b5;
  color: black;
  border: none;
  border-radius: 999px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.allreports-filter-button::-webkit-details-marker {
  display: none;
}

.allreports-filter-menu {
  margin-top: 8px;
  background-color: white;
  border-radius: 14px;
  padding: 10px;
  min-width: 190px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.allreports-filter-option {
  background-color: #f5f5f5;
  border: none;
  border-radius: 10px;
  padding: 9px 12px;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

.allreports-filter-option:hover {
  background-color: #dff5f2;
}

.allreports-category-options {
  border-top: 1px solid #ddd;
  margin-top: 6px;
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.allreports-filter-subtitle {
  margin: 0 0 4px 0;
  font-size: 12px;
  font-weight: bold;
  color: #555;
}


/* ===== Recent report knapp =====*/
.allreports-recent-report-button {
    position: absolute;
    right: 20px;
    top: 20px;
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

.allreports-content-wrapper {
    display: flex;
    width: 100%;
    height: 75vh;
    overflow: hidden;
    position: relative;
}

@media (max-width: 600px) {

/* Flyttar ner filterknappen under zoomknapparna */
.allreports-filter-dropdown {
  left: 16px;
  top: 105px;
  z-index: 1000;
  width: 100px;          /* styr hela filterområdet */
  max-width: 60vw;       /* gör att den inte tar över mobilen */
  
}

/* Gör filterknappen mindre */
.allreports-filter-button {
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
}

/* Gör filtermenyn mindre och scroll-bar */
.allreports-filter-menu {
  min-width: 140px;
  max-width: calc(100vw - 32px);
  max-height: 45vh;
  overflow-y: auto;
  padding: 8px;
  gap: 6px;
}

/* Gör alternativen i menyn lite mindre */
.allreports-filter-option {
  font-size: 13px;
  padding: 8px 10px;
}

/* Gör senaste rapporter-knappen mindre */
.allreports-recent-report-button {
  right: 16px;
  top: 20px;
  padding: 10px 18px;
  font-size: 14px;
  max-width: 190px;
  white-space: nowrap;
}
}

</style>
