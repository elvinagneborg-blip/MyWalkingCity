<template>
  <main class="report-page">
    <!--Header specifik för sidan -->
    <section class="report-header">
      <h2 class="report-title"> {{ uiLabels.reportAProblem }} </h2>
      <p class="report-subtitle"> {{ uiLabels.currentLocation }} </p>
    </section>

    <!-- Sektion för kart-området -->
     <section class="map-section">
        <div class="map-container">
          <MapComponent />

            <!-- Recent reports i hörnet av kartan -->
            <aside class="recent-report">
              <h3 class="recent-reports-title"> {{ uiLabels.recentReports }} </h3>
              <ul class="recent-reports-list">
                    <li> Pothole </li>
                    <li> Broken Bench </li>
                    <li> Ramp missing </li>
                </ul>
            </aside>
          </div>
      </section>

     <!-- Beskrivningsrutan -->
     <section class="form-section">
      <div class="form-container">

        <div class="form-field">
          <label for="category" class="form-label"> {{ uiLabels.category }} </label>
          <select id="category" class="form-control" v-model="category">
            <option disabled value=""> {{ uiLabels.chooseCategory }} </option>
            <option>Pothole</option>
            <option>Broken bench</option>
            <option>Ramp missing</option>
            <option>Lighting issue</option>
            <option>Other</option>
            </select>
        </div>

      <div class="form-field">
        <label for="description" class="form-label"> {{ uiLabels.describeYourProblem }} </label>
          <textarea
            id="description"
            class="form-input"
            placeholder="What is wrong?"
            rows="5"
            v-model="description"
          ></textarea>
      </div>

      <div class="form-field">
        <label for="photo" class="form-label"> {{ uiLabels.photo }} </label>
        <label for="photo" class="form-control file-control">
          <span class="file-control-text"> {{ uiLabels.uploadPhoto }} </span>
          <span class="file-control-icon">🖼️</span>
            <input
              id="photo"
              type="file"
              accept="image/*"
              capture="environment"
              class="file-input"
              @change="photo = $event.target.files[0]"
            />
          </label>
      </div>
      
    <!--Submit knappen och popup fönstret -->
    <button class="submit-button" @click="handleSubmit">
      {{uiLabels.sendInReport}}
    </button>

    <!-- Popup-fönstret -->
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup-box">
      <p class="popup-text"> {{ uiLabels.thankYouText }} </p>
        <h3 class="popup-title"> {{ uiLabels.whatHappensNow }} </h3>
          <p class="popup-description">
            {{ uiLabels.sentReportInfo }}
          </p>
      <button class="popup-button" @click="handleDone"> Done </button>
      </div>
    </div>
    </div>
    </section>
  </main>
</template>

<script setup>
  //Imports
  import { ref, onMounted, watch } from 'vue' 
  import { useRouter } from 'vue-router' //Programmatisk navigering, när något ska hända innan användaren skickas vidare vid klick
  import io from 'socket.io-client' //kontakt med server
  import MapComponent from "@/components/MapComponent.vue"
  import { saveSubmission } from '../utils/storage.js'

  //Setup and Props (Input)
  const socket = io("localhost:3000")
  const props = defineProps(['currentLang']) //ta emot språkval från app.vue

  //Data
  const router = useRouter()
  const uiLabels = ref({})
  const category = ref('') 
  const description = ref('') 
  const photo = ref(null) 
  const showPopup = ref(false) 

  //Socket listeners
  socket.on("uiLabels", (labels) => {
  uiLabels.value = labels
  })

  //Watchers
  watch(() => props.currentLang, (newLang) => { //vakta språket
    socket.emit("getUILabels", newLang);
  }, { immediate: true }); //Språket laddas direkt när sidan laddas

  //Methods
  const handleSubmit = () => { 
    // Skapa ett objekt med all data som användaren fyllt i
    const reportData = {
      title: category.value,           // Vi använder kategorin som titel
      description: description.value,  // Beskrivningen från textrutan
      // Tydligen är det klurigt med bilder, skippar det just nu
    };
    // Anropa vår gemensamma funktion och berätta att detta är en 'report'
    saveSubmission(reportData, 'report')
    showPopup.value = true
  }

  const handleDone = () => { 
    category.value = ''
    description.value = ''
    photo.value = null
    showPopup.value = false
    // Omdirigerar tillbaka till startsidan där listan uppdateras
    router.push({ name: 'StartMWC' })
  }


</script>




<!-- CSS-->
<style scoped>

.report-page {
  margin: 0;
  font-family: Arial, sans-serif;
}

/* Alla formulärelement ska använda samma font */
input,
textarea,
select,
button {
  font-family: inherit;
  font-size: 16px;
}


/* ===== Sidhuvud ===== */
.report-header {
  padding: 16px;
}

.report-title {
  margin-bottom: 8px;
}

.report-subtitle {
  margin: 0;
}

/* ===== Karta ===== */

.map-section {
  padding: 16px;
  display: flex;
  justify-content: center;
}

.map-container {
  position: relative;
  width: 100%;
  max-width: 900px;   /* gör kartan mindre i bredd */
  border: 2px solid #aaa;
  border-radius: 12px;
  padding: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.map-image {
  display: block;
  width: 100%;
  height: 420px;      /* mindre höjd */
  object-fit: cover;
  border-radius: 12px;
}

/* ===== Recent reports ===== */
.recent-report {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 220px;
  max-width: 45%;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-height: 180px;
  overflow-y: auto;
  box-sizing: border-box;
  z-index:1000;
}

.recent-reports-title {
  margin-top: 0;
}

.recent-reports-list {
  margin: 0;
  padding-left: 20px;
}

/* ===== Formulärsektion ===== */

.form-section {
  display: flex;
  justify-content: center;
  padding: 32px 16px 40px;
}

.form-container {
  width: 100%;
  max-width: 700px;
  background-color: #c9e2df;
  border-radius: 20px;
  padding: 24px 20px;
  box-sizing: border-box;
}

.form-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.form-label {
  font-size: 18px;
  margin-bottom: 8px;
  color: #1e1e1e;
}
/* ===== Form controls ===== */

.form-control,
.form-input {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background-color: white;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 16px;
}

/* Select behöver extra reset */
select.form-control {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
}

/* Textarea */
textarea.form-input {
  resize: vertical;
  min-height: 140px;
}

/* ===== Filuppladdning ===== */

.file-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.file-control-text {
  color: #777;
}

.file-control-icon {
  font-size: 20px;
}

.file-input {
  display: none;
}

/* ===== Knapp ===== */

.submit-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background-color: #2f2f2f;
  color: white;
  cursor: pointer;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.35);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 1000;
}

.popup-box {
  width: 90%;
  max-width: 500px;
  background-color: white;
  border-radius: 20px;
  padding: 24px;
  box-sizing: border-box;
}

.popup-text {
  font-size: 20px;
  margin-bottom: 24px;
}

.popup-title {
  margin-bottom: 12px;
}

.popup-description {
  margin-bottom: 24px;
  line-height: 1.4;
}

.popup-button {
  display: block;
  margin: 0 auto;
  padding: 12px 28px;
  border: none;
  border-radius: 12px;
  background-color: #2f2f2f;
  color: white;
  cursor: pointer;
}

/* ===== Anpassad till telefon ===== */

@media (max-width: 768px) {
  .site-title {
    font-size: 18px;
  }

  .report-title {
  margin-bottom: 8px;
  font-size: clamp(28px, 4vw, 56px);
  text-align: center;
  }

.report-subtitle {
  margin: 0;
  font-size: clamp(16px, 2.2vw, 28px);
  text-align: center;
  }

  .map-container {
    max-width: 100%;
    padding: 8px;
  }

  .map-image {
    height: 260px;
  }

  .recent-report {
    width: 42%;
    min-width: 140px;
    max-width: 220px;
    right: 12px;
    bottom: 12px;
    left: auto;         /* viktigt */
    font-size: 14px;
    padding: 10px;
  }

  .form-container {
    padding: 20px 16px;
    border-radius: 16px;
  }

  .form-label {
    font-size: 16px;
  }

  .form-control,
  .form-input,
  .submit-button {
    font-size: 16px;
    padding: 14px;
  }

  textarea.form-control,
  textarea.form-input {
    min-height: 120px;
  }
}

</style>