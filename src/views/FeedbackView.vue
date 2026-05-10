<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p>Laddar My Walking City...</p>
  </div>

  <main v-else class="feedback-page">
  

    <section v-if="session" class="loggedin-feedback-container">
        <h2 class="feedback-title"> {{uiLabels.thankYouText}} </h2>
        <h3 class="feedback-subtitle"> {{uiLabels.whatHappensNow}} </h3>
        <p class="feedback-text"> {{ reportType === 'highlight' ? uiLabels.feedbackHighlight : uiLabels.feedbackProblem }} </p>

        <div class="visit-profile-container" >
        <h4 class="view-report-title"> {{uiLabels.viewReport}} </h4>

            <div class="visit-profile-button-container">
                <router-link to="/profile/" class="btn visitProfile" > {{uiLabels.visitProfile}} </router-link> 
            </div>

        <div class="options-button-container">
        <router-link to="/" class="btn backToHome" > {{uiLabels.backToHome}} </router-link>
        <router-link to="/allreports/" class="btn allReports" > {{uiLabels.allReports}} </router-link>
        </div>

        </div>

    </section>

    <section v-else class="feedback-container">
        <h2 class="feedback-title"> {{uiLabels.thankYouText}} </h2>
        <h3 class="feedback-subtitle"> {{uiLabels.whatHappensNow}} </h3>
        <p class="feedback-text"> {{ reportType === 'highlight' ? uiLabels.feedbackHighlight : uiLabels.feedbackProblem }} </p>

        <div class="accountperks-container" >
        <h4 class="accountperks-title"> {{uiLabels.perkTitle}} </h4>

        <div class="createAccount-button-container">
        <router-link to="/login/" class="btn createAccount" > {{uiLabels.createAccount}} </router-link> 
        <router-link to="/login/" class="btn logIn" > {{uiLabels.logIn}} </router-link> 
        </div>

        <ul class="accountperks-list">
            <li class="accountperks-item"> {{uiLabels.perk1}} </li>
            <li class="accountperks-item"> {{uiLabels.perk2}} </li>
            <li class="accountperks-item"> {{uiLabels.perk3}} </li>
        </ul>
        <div class="options-button-container">
        <router-link to="/" class="btn backToHome" > {{uiLabels.noBackToHome}} </router-link>
        <router-link to="/allreports/" class="btn allReports" > {{uiLabels.allReports}} </router-link>
        </div>
        </div>

    </section>

  </main>
</template>


<script setup>
//Imports
  import { ref, onMounted, watch } from 'vue' //för att kunna ha reaktiva variabler och övervaka dem
  import io from 'socket.io-client' //kontakt med server
  import { useRoute } from 'vue-router'
  import { supabase } from '@/utils/supabase'
  import { computed } from 'vue'

  //Setup and Props (Input)
  const socket = io("localhost:3000")
  const props = defineProps(['currentLang', 'session']) //ta emot språkval och session§ från app.vue
  const route = useRoute()
  const reportType = computed(() => route.query.type || 'problem')

  const uiLabels = ref({})


  
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


</script>

<!-- CSS-->
<style scoped>
.feedback-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 85vh;
  background-color: #f8fafc; /* Ljusgrå bakgrund som får den vita boxen att poppa */
  padding: 20px;
  font-family: 'Inter', sans-serif; /* Eller din valda font */
}

/* Den vita "kort"-containern */
.feedback-container, .loggedin-feedback-container {
  background: white;
  padding: 20px;
  border-radius: 32px; /* Kraftigt rundade hörn enligt prototyp */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  max-width: 440px;
  width: 100%;
  text-align: center;
}

/* Rubriker */
.feedback-title {
  font-size: 24px;
  font-weight: 800;
  color: #23a88c;
  margin-bottom: 12px;
  padding-bottom: 20px;
}

.feedback-subtitle {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.feedback-text {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 32px;
  font-size: 15px;
}


/* Knapp-containern */
.createAccount-button-container, .visit-profile-button-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  text-align: center;
}

.btn {
  display: block;
  padding: 16px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.2s ease;
}

.btn:active {
  transform: scale(0.98); /* Liten tryck-effekt */
}

/* Specifik stil för "Create Account" (Mörk) */
.createAccount, .visitProfile {
  background-color: #2d3748;
  color: white;
}

.createAccount:hover {
  background-color: #1a202c;
}

/* Specifik stil för "Log In" (Ljus) */
.logIn {
  background-color: #edf2f7;
  color: #2d3748;
}

.logIn:hover {
  background-color: #e2e8f0;
}

.options-button-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.backToHome, .allReports {
  background-color: #cbd5e0;
  color: #2d3748;
  margin-top: 20px;
  font-size: 12px;
  padding: 12px 16px;
  width: fit-content;
  margin: 0 auto; /* Centrera knappen */
}

.backToHome:hover, .allReports:hover {
  background-color: #a0aec0;
  color: white;
}
/* Perks-sektionen längst ner */
.accountperks-container {
  text-align: left;
  background-color: #f7fafc;
  padding: 24px;
  border-radius: 20px;
}

.accountperks-title, .view-report-title {
  font-size: 20px;
  font-weight: 800;
  color: #23a88c;
  margin-bottom: 25px;
  text-align: center;   
}

.accountperks-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.accountperks-item {
  position: relative;
  padding-left: 28px;
  margin-bottom: 12px;
  font-size: 16px;
  color: #4a5568;
  line-height: 1.4;
}


/* ===== Sidhuvud ===== */
.feedback-header {
  padding: 16px;
}

.feedback-title {
  margin-bottom: 8px;
}

.feedback-subtitle {
  margin: 0;
}


/* ===== Anpassad till telefon ===== */

@media (max-width: 768px) {
  .site-title {
    font-size: 18px;
  }

  .feedback-title {
  margin-bottom: 8px;
  font-size: clamp(28px, 4vw, 56px);
  text-align: center;
  }
  
.feedback-subtitle {
  margin: 0;
  font-size: clamp(16px, 2.2vw, 28px);
  text-align: center;
  }
}
</style>