<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen">
    <p>{{ uiLabels.loadingMWC }}</p>
  </div>

  <main v-else>
    <section class="body-top">
      
      <div class="hero-left">
        <h2 class="section-title"> {{ uiLabels.shapeUppsala }} <br> {{ uiLabels.withAPhoto }} </h2>
        <h6> {{ uiLabels.startDescription}}</h6>
        
        <div class="top-buttons">
          <p><RouterLink to="/option/" class="report"> {{ uiLabels.report }} </RouterLink></p>
          <p><a href="#howItWorks-section" class="how-it-works"> 
            {{ uiLabels.howDoesItWork }} 
          </a></p>
        </div>

        <div class="stats-container">
          <div>45<br> {{ uiLabels.reports }} </div>
          <div>89<br> {{ uiLabels.activeUsers }} </div>
          <div>10<br> {{ uiLabels.solved }} </div>
        </div>
      </div>

      <div class="body-how-it-works desktop-only">
        <h6> {{ uiLabels.howItWorks }} </h6>
        <h2> {{ uiLabels.fourSteps }} </h2>
        
        <div class="how-it-works-container">
          <div class="step-item" v-for="step in steps" :key="step.id">
            <div class="step-number">{{ step.id }}</div>
            <div class="step-text">
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="howItWorks-section" class="body-how-it-works mobile-only">
      <h6> {{ uiLabels.howItWorks }} </h6>
      <h2> {{ uiLabels.fourSteps }} </h2>
      <div class="how-it-works-container">
        <div class="step-item" v-for="step in steps" :key="step.id">
          <div class="step-number">{{ step.id }}</div>
            <div class="step-text">
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
            </div>
        </div>
      </div>
    </section>

    <section class="body-latest-reports" id="latestReports-section">
      <h6> {{ uiLabels.liveFeed }} </h6>
      <h2> {{ uiLabels.latestReports }} </h2>
      <h5> {{ uiLabels.latestReportsDescription }} </h5>

      <div class="report-list">
        <div v-if="latestUserReports.length === 0">
          <p> {{ uiLabels.noReportsSubmitted }}</p>
        </div>

        <RecentReport 
          v-else
          v-for="report in latestUserReports" 
          :key="report.id" 
          :report="report"
          :session="session"
          @click-location="handleReportClick"
         />
      </div>

      <p><RouterLink to="/allreports/" class="report"> {{ uiLabels.allReportsOnMap }} </RouterLink></p>
    </section>
  </main>
</template>

<script setup>
  import { ref, onMounted, watch, computed } from 'vue'
  import io from 'socket.io-client'
  import { supabase } from '@/utils/supabase'
  import RecentReport from '../components/RecentReport.vue'
  import { useRouter } from 'vue-router'

  const props = defineProps(['backendURL', 'currentLang', 'session'])
  const socket = io(props.backendURL)

  const uiLabels = ref({})

  socket.on("uiLabels", (labels) => {
    uiLabels.value = labels
  })

  watch(() => props.currentLang, (newLang) => {
    socket.emit("getUILabels", newLang || "en");
  }, { immediate: true })

  const latestUserReports = ref([])

  async function fetchLatestReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', {ascending: false})
      .limit(5)
    if (!error) {
        latestUserReports.value = data
    } else {
      console.error("Could not fetch latest reports:", error.message) 
    }
  }

//när man klickar på en rapports location
  const router = useRouter()

  function handleReportClick(reportId) {
  router.push({
    path: '/allreports',
    query: { selectedReport: reportId } // Skickar med parametern till AllReportsView
  })
}

  const steps = computed(() => [
    { id: 1, title: uiLabels.value.identify, description: uiLabels.value.identifyDescription },
    { id: 2, title: uiLabels.value.report, description: uiLabels.value.reportDescription },
    { id: 3, title: uiLabels.value.waitFeedback, description: uiLabels.value.waitFeedbackDescription },
    { id: 4, title: uiLabels.value.levelUp, description: uiLabels.value.levelUpDescription }
  ])

  onMounted(() => { 
    fetchLatestReports()
  })
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}

/* ===== Standard- & Datorlayout (> 768px) ===== */
.body-top {
  background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/img/Uppsala_domkyrka_flygbild-scaled.jpg');
  background-size: cover;
  background-position: center;
  width: 100%;
  height: calc(100vh - 100px);
  min-height: 650px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 80px;
  box-sizing: border-box;
  margin: 0 auto;
}

.hero-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.section-title {
  color: white;
  font-size: 50px;
  margin-bottom: -5px;
  text-align: left;
  margin-left: 50px;
}

.body-top h6 {
  color: white;
  margin-top: 10px;
  font-size: 16px;
  line-height: 1.5;
  max-width: 400px;
  text-align: left;
  margin-left: 50px;
}

.top-buttons {
  margin-top: 20px;
  margin-left: 90px;
}

.report {
  background-color: #1EBC9C;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  text-decoration: none;
  display: inline-block;
  width: 280px;
  padding: 15px 0;
  font-weight: bold;
  text-align: center; /* Tvingar texten inuti knappen att alltid centreras */
}

/* Dölj "Hur fungerar det?"-knappen på datorn */
.how-it-works {
  display: none !important;
}

.stats-container {
  display: flex;
  text-align: center;
  align-items: center;
  gap: 50px;
  margin-top: 40px;
  color: white;
  margin-left: 90px;
}

/* Styling för rutan inuti bakgrundsbilden på desktop */
.body-how-it-works.desktop-only {
  display: block; /* Visas på datorn */
  flex: 1;
  max-width: 460px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
}

.body-how-it-works.desktop-only h6 {
  color: #1EBC9C;
  font-weight: bold;
  margin: 0 0 5px 0;
  text-align: center;
}

.body-how-it-works.desktop-only h2 {
  color: #2d3748;
  font-size: 24px;
  margin: 0 0 20px 0;
  text-align: center;
}

/* Göm mobil-versionen på datorn */
.body-how-it-works.mobile-only {
  display: none;
}

.how-it-works-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  gap: 15px;
  align-items: center;
}

.step-number {
  background-color: #1EBC9C; 
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  min-width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px; 
  flex-shrink: 0;
}

.step-text {
  text-align: left;
}

.step-text h4 {
  margin: 0 0 2px 0;
  font-size: 1.1rem;
  color: #2d3748;
}

.step-text p {
  margin: 0;
  color: #4a5568;
  font-size: 0.9rem;
}

/* ===== Sektion för Senaste Rapporter ===== */
.body-latest-reports {
  padding: 40px 40px;
}

.body-latest-reports h6 {
  color: #1EBC9C;
  text-align: center;
  margin-top: 40px;
}

.report-list {
  display: flex;
  flex-direction: column; 
  align-items: center;
  gap: 15px; 
  margin-top: 20px;
}

/* ===== Mobilanpassning (Skärmar <= 768px) ===== */
@media (max-width: 768px) {
  .body-top {
    flex-direction: column;
    height: calc(100vh - 100px);
    padding-top: 30px;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
  }

  .hero-left {
    align-items: center;
    width: 100%;
    text-align: center;
  }

  .section-title {
    margin-left: 0 !important;
    text-align: center;
    font-size: 36px;
  }

  .body-top h6 {
    margin-left: auto !important;
    margin-right: auto !important;
    text-align: center;
    font-size: 13px;
    max-width: 400px;
  }

  .top-buttons {
    margin-left: 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .report {
    padding: 15px 0 !important;
    width: 280px !important;
    text-align: center;
    display: inline-block;
  }

  /* Sätt tillbaka originalknappen på mobilen */
  .how-it-works {
    display: inline-block !important;
    background-color: #1ebc9c85;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    text-decoration: none;
    width: 280px;
    padding: 15px 0;
    text-align: center;
  }

  .stats-container {
    gap: 15px; 
    font-size: 0.9rem; 
    margin-top: 40px;
    margin-bottom: 60px;
    margin-left: 0px;
  }

  /* GÖM datorversionen av stegen helt på mobilen */
  .body-how-it-works.desktop-only {
    display: none !important;
  }

  /* VISA den fristående mobilversionen under bilden, exakt som i ditt original */
  .body-how-it-works.mobile-only {
    display: block;
    margin-top: 100px;
    text-align: center;
  }

  .body-how-it-works.mobile-only h6 {
    color: #1EBC9C;
    text-align: center;
  }

  .body-how-it-works.mobile-only h2 {
    font-size: 2rem;
    margin-bottom: 20px;
    text-align: center;
  }

  .how-it-works-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start; 
    gap: 20px;
    margin: 40px auto;
    max-width: 500px;
    padding: 0 15px; 
  }
}
</style>