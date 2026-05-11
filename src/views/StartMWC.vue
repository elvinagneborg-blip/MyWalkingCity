<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p>Laddar My Walking City...</p>
  </div>

  <main v-else>
  <section class="body-top">
    <h2 class="section-title"> {{ uiLabels.shapeUppsala }} <br> {{ uiLabels.withAPhoto }} </h2>
    <h6> {{ uiLabels.startDescription}}</h6>
    
    <div>
      <p><RouterLink to="/option/" class="report"> {{ uiLabels.report }} </RouterLink></p>
      <p><a href="#howItWorks-section" class="how-it-works"> 
    {{ uiLabels.howDoesItWork }} 
  </a></p>
    </div>

    <div class="stats-container">
      <div>4000<br> {{ uiLabels.reports }} </div>
      <div>850<br> {{ uiLabels.activeUsers }} </div>
      <div>99%<br> {{ uiLabels.solved }} </div>
    </div>
  </section>

  <section class="body-latest-reports">
    <h6> {{ uiLabels.liveFeed }} </h6>
    <h2> {{ uiLabels.latestReports }} </h2>
    <h5> {{ uiLabels.latestReportsDescription }} </h5>

    <div class="report-list">
      <!-- Visas om det är tomt i sessionStorage -->
      <div v-if="latestUserReports.length === 0">
        <p> {{ uiLabels.noReportsSubmitted }}</p>
      </div>

      <!-- Loopar igenom den hämtade datan -->
      <RecentReport 
        v-else
        v-for="report in latestUserReports" 
        :key="report.id" 
        :report="report"
        :session="session"
       />
      </div>

    
      
    <p><RouterLink to="/allreports/" class="report"> {{ uiLabels.allReportsOnMap }} </RouterLink></p>
    </section>

    <section id="howItWorks-section" class="body-how-it-works">
      <h6> {{ uiLabels.howItWorks }} </h6>
      <h2> {{ uiLabels.fourSteps }}
      </h2>
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
    </main>
</template>

<script setup>
  //Imports
  import { ref, onMounted, watch } from 'vue'               //för att kunna ha reaktiva variabler och övervaka dem
  import io from 'socket.io-client'                         //kontakt med server
  import { supabase } from '@/utils/supabase'               //Databasen
  import RecentReport from '../components/RecentReport.vue' //RecentReportkomponent

  //Setup and Props (Input)
  const socket = io("localhost:3000")
  const props = defineProps(['currentLang', 'session'])     //Ta emot språkval och inloggad/utloggad från app.vue

  //UI and language
  const uiLabels = ref({})                      //Språkknappar/uiLabels

  socket.on("uiLabels", (labels) => {           //Lyssnare för uiLabels
    uiLabels.value = labels
  })

  watch(() => props.currentLang, (newLang) => { //vakta språkvalet, ligger alltid och lyssnar
    socket.emit("getUILabels", newLang || "en");        //Hämtar uiLabels enl. valt språk
  }, { immediate: true })                       //Språket laddas direkt när sidan laddas, istället för att vänta på att språket ska ändras 1a gngen

  //Latest reports
  const latestUserReports = ref([])             //Senaste rapporter (ev. byta namn?)

  async function fetchLatestReports() {         //Hämtar de 5 senaste rapporterna, async = kan vänta på svar från databasen utan att hemsidan låser sig under tiden
    const { data, error } = await supabase      //Await tills vi får svar, tar emot antingen data eller error
      .from('reports')                          //Från reports-tabellen
      .select('*')                              //Välj alla kolumner
      .order('created_at', {ascending: false})  //Sortera i fallande ordn., nyast först (ifall true = äldst först)
      .limit(5)                                 //Hämtar 5 stycken rapporter
    if (!error) {                               //Om allt gått bra, inte error
        latestUserReports.value = data          //Datan sparas i latestUserReports
    }
    else {
      console.error("Could not fetch latest reports:", error.message) 
    }
  }

  //
  const steps = ref([                           // Steg för "How it works", ska detta vara kvar?
    { id: 1, title: 'Identify', description: 'Identify problems or good things in the city.' },
    { id: 2, title: 'Report', description: 'Set location, describe, add photo, submit.' },
    { id: 3, title: 'Wait for feedback', description: 'Your report will be handled by policy makers. You will get notification when the problem is solved' },
    { id: 4, title: 'Level up and compete with your friends', description: 'Collect points by writing and boosting reports, leveling up and becoming a helping citizen.' }
  ])

  //Lifecycle hooks
  onMounted(() => { 
    fetchLatestReports()
  })
</script>



<style scoped>

html {
  scroll-behavior: smooth
}

.body-top {
  background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/img/Uppsala_domkyrka_flygbild-scaled.jpg');
  display: flex;
  margin: 0 auto;
  min-height: 500px;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  justify-content: center;
  align-self: center;
  width: 50%;
  }

.report-list {
  display: flex;
  flex-direction: column; 
  align-items: center;
  gap: 15px; 
  margin-top: 20px;
}



.stats-container {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin-top: 40px;
  color: white;
}

.how-it-works-container {
  display: flex;
  flex-direction: column;
  align-items: center; 
  gap: 20px;
  margin: 40px auto;
  max-width: 500px;
}
.step-item {
  display: flex;
  gap: 20px;
  width: 100%;
}
.step-number {
  background-color: #5cb85c; 
  color: white;
  font-size: 2rem;
  font-weight: bold;
  min-width: 60px;
  height: 60px;
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
  margin: 0 0 5px 0;
  font-size: 1.2rem;
}
.step-text p {
  margin: 0;
  color: #333;
}

.report {
  background-color: #1EBC9C;
  color: white;
  border: none;
  padding: 17px 110px;
  cursor: pointer;
  border-radius: 5px;
}

.how-it-works {
 background-color: #1ebc9c85;
  color: white;
  border: none;
  padding: 17px 80px;
  cursor: pointer;
  border-radius: 5px;
}

.section-title {
  color: white;
  width: 100%;
  text-align: left;
  margin-left: 50px;
}

.body-top h6 {
  color: white;
  width: 100%;
  text-align: left;
  margin-left: 50px;
  margin-top: 10px;
  line-height: 1.5;
  max-width: 400px; /* Texten bryts automatiskt när den blir bredare än så här */
  line-height: 1.5;
}


.body-latest-reports h6 {
  color: #1EBC9C;
  text-align: center;
  margin-top: 40px;
}

.body-how-it-works {
  margin-top: 100px;
}

.body-how-it-works h6 {
  color: #1EBC9C;
  text-align: center;
}

@media (max-width: 768px) {
  
  .body-top {
    width: 100%;
    min-height: 400px; 
    padding-top: 30px;
  }

  .report, .how-it-works {
    width: 88%; 
    padding: 15px 0; 
    margin-bottom: 10px; 
  }

  .stats-container {
    gap: 15px; 
    font-size: 0.9rem; 
    margin-bottom: 60px;
  }

  .report-card {
    width: 90%; 
  }

  .how-it-works-container {
    padding: 0 15px; 
  }
}
  
</style>