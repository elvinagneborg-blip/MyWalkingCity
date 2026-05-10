<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p>Laddar My Walking City...</p>
  </div>

  <main v-else class="report-page">
  <section class="report-page">
    <!--Header specifik för sidan -->
    <section class="report-header">
      <h2 class="report-title"> {{ uiLabels.reportAProblem }} </h2>
      
    </section>

   

  <section class="form-section">

  <!-- 1. Wrappa allt i en form-tagg -->
      <form @submit.prevent="handleSubmit" class="form-container">

        <div class="map-container">
          <MapComponent 
          ref="reportMap" 
    @location-changed="updateCoords"
    />

            <!-- Recent reports i hörnet av kartan -->


            
            <aside class="recent-report">
              <h3 class="recent-reports-title"> {{ uiLabels.recentReports }} </h3>
              <ul class="recent-reports-list" v-for="report in allUserReports">
                    <li> {{ report.category }} <br> {{ report.description }} </li>
                </ul>
            </aside>
          </div>
          <div class="form-field">

      <label class="form-label">{{ uiLabels.locationOfProblem }}</label>
      <div class="search-group">
        <input 
          type="text" 
          v-model="addressSearch" 
          :placeholder="uiLabels.searchForLocation"
          class="form-control"
          @key.enter.prevent="searchAddress" 
        />
        <button type="button" @click="searchAddress" class="btn-secondary">{{ uiLabels.search }}</button>
      </div>
      </div>

        <div class="form-field">
          <label for="category" class="form-label"> {{uiLabels.category}} </label>
          <!-- 2. Uppdatera v-model till formData.category -->
          <select id="category" class="form-control" v-model="formData.category" required>
            <option disabled value="">{{ uiLabels.chooseCategory }}</option>
            <option value="streets">{{ uiLabels.streets }}</option>
            <option value="sidewalks_and_bike_lanes">{{ uiLabels.sidewalks_and_bike_lanes }}</option>
            <option value="lights">{{ uiLabels.lights }}</option>
            <option value="publicutilities">{{ uiLabels.publicutilities }}</option>
            <option value="vandalism">{{ uiLabels.vandalism }}</option>
            <option value="accessibility">{{ uiLabels.accessibility }}</option>
            <option value="other">{{uiLabels.other}}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="description" class="form-label"> {{uiLabels.description}}</label>
          <textarea
            id="description"
            class="form-input"
            :placeholder="uiLabels.describeYourProblem"
            rows="5"
            v-model="formData.description"
            required
          ></textarea>
        </div>

        <div class="form-field">
          <label for="photo" class="form-label">{{uiLabels.photo}}</label>
          <label for="photo" class="form-control file-control">
            <span class="file-control-text">{{uiLabels.photoPlaceholder}}</span>
            <span class="file-control-icon">🖼️</span>
            <input
              id="photo"
              type="file"
              accept="image/*"
              capture="environment"
              class="file-input"
              @change="handlePhotoUpload"
            />
          </label>
        </div>
        
        <div v-if="imagePreview" class="preview-container">
      <p class="preview-text">{{uiLabels.selectedPhoto}}</p>
      <img :src="imagePreview" class="image-preview" />
      
      <!-- En knapp för att ångra sig och ta bort bilden -->
      <button type="button" @click="removeImage" class="remove-image-btn">
        {{uiLabels.removeImage}}
      </button>
    </div>

        <div class="form-field">
          <label for="email" class="form-label">{{uiLabels.email}}</label>
          <input
            v-if="props.session"
            id="email"
            type="email"
            class="form-input-locked"
            :value="props.session.user.email"
            readonly
          
          />
          <input
            v-else
            id="email"
            type="email"
            class="form-input"
            :placeholder="uiLabels.email"
            v-model="formData.email"
          />
        </div>

        <!-- 4. Ändra till type="submit" och ta bort @click (formuläret sköter det nu) -->
        <button type="submit" class="submit-button" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send in your report!' }}
        </button>
      </form>
  </section>
    
  </section>
  </main>
</template>


<script setup>
//Imports
  import { ref, onMounted, watch } from 'vue' //för att kunna ha reaktiva variabler och övervaka dem
  import io from 'socket.io-client' //kontakt med server
  import { useRouter } from 'vue-router'
  import MapComponent from "@/components/MapComponent.vue";
  import { supabase } from '@/utils/supabase'
  import L from 'leaflet'

  //Setup and Props (Input)
  const socket = io("localhost:3000")
  const props = defineProps(['currentLang', 'session']) //ta emot språkval från app.vue

  //Data
  const allUserReports = ref([])
  const uiLabels = ref({})
  const formData = ref({
  type: 'problem', // Förvalt värde
  category: '',
  description: '',
  image_url: '',
  email: '',
  latitude: 59.8586, // Förvalt till centrala Uppsala
  longitude: 17.6389 // Förvalt till centrala Uppsala
  })

  const isSubmitting = ref(false)
  const selectedFile = ref(null)
  const router = useRouter()
  const imagePreview = ref(null)
  const addressSearch = ref('')
  const reportMap = ref(null)
  

  async function updateCoords({ lat, lng }) {
  formData.value.latitude = lat
  formData.value.longitude = lng

  console.log(`Uppdaterade koordinater: ${lat}, ${lng}`)

  const address = await getAddressFromCoords(lat, lng)
  addressSearch.value = address;
}
  
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


  //Methods
  const fetchLatestReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', {ascending: false})
      .limit(5) //hämtar 5 stycken rapporter

    if (!error) {
        allUserReports.value = data
    }
    else {
      console.error("Kunde inte hämta live-feed:", error.message)
    }
  }

 async function handleSubmit() {
  isSubmitting.value = true
  if (props.session) {
    formData.value.email = props.session.user.email
  }
  const imageUrl = await uploadImage() // 1. Ladda upp bilden först (om användaren valt en)
  const reportData = { // 2. Förbered datan som ska till databasen
    ...formData.value,
    image_url: imageUrl, // Här lägger vi till länken vi just fick
    user_id: props.session ? props.session.user.id : null //spara anv UUID
  }
  const { error } = await supabase // 3. Skicka till reports-tabellen
    .from('reports')
    .insert([reportData])

  if (error) {
    alert("Kunde inte skicka: " + error.message)
  } else {
    router.push('/feedback/')
  }
  
  isSubmitting.value = false
}

async function searchAddress() {
  const query = addressSearch.value
  if (!query) return // Sök inte om fältet är tomt

  try {
    // 1. Vi skickar adressen till Nominatim. 
    // encodeURIComponent ser till att mellanslag och ÅÄÖ fungerar i webbadressen.
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    )
    const data = await response.json()

    if (data.length > 0) {
      // 2. Vi tar det första resultatet (oftast det mest relevanta)
      const { lat, lon } = data[0]
      const newLat = parseFloat(lat)
      const newLon = parseFloat(lon)

      // 3. Flytta kartan och markören via din MapComponent
      if (reportMap.value) {
        reportMap.value.setLocation(newLat, newLon)
      }

      // 4. Uppdatera din formData så att rätt koordinater skickas till databasen
      formData.value.latitude = newLat
      formData.value.longitude = newLon
      
      console.log("Hittade adressen:", data[0].display_name)
    } else {
      alert("Kunde inte hitta adressen. Prova att vara mer specifik (t.ex. lägg till 'Uppsala').")
    }
  } catch (error) {
    console.error("Sökfel:", error)
    alert("Något gick fel vid sökningen. Kontrollera din internetanslutning.")
  }
}

async function uploadImage() {
  if (!selectedFile.value) return null

  // Skapa ett unikt filnamn (t.ex. 171234567-mittfoto.jpg)
  const fileName = `${Date.now()}-${selectedFile.value.name}`
  
  const { data, error } = await supabase.storage
    .from('report-images') // Namnet på din bucket
    .upload(fileName, selectedFile.value)

  if (error) {
    console.error("Storage error:", error)
    return null
  }
  const { data: publicUrlData } = supabase.storage
    .from('report-images')
    .getPublicUrl(fileName)

  return publicUrlData.publicUrl
}

  function handlePhotoUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  selectedFile.value = file

  // Skapa en tillfällig länk som Vue kan visa i en <img>-tagg
  imagePreview.value = URL.createObjectURL(file)
} 
function removeImage() {
  selectedFile.value = null
  imagePreview.value = null
  // Tips: nollställ även själva input-fältet om du vill vara extra noga
  document.getElementById('photo').value = ""
}

async function getAddressFromCoords(lat, lng) {
  try {
    // Vi anropar Nominatims API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    
    // Nominatim ger tillbaka mycket info, vi försöker plocka ut gata och nummer
    if (data && data.address) {
      const street = data.address.road || '';
      const number = data.address.house_number || '';
      return `${street} ${number}`.trim() || data.display_name;
    }
    return "Okänd adress";
  } catch (error) {
    console.error("Kunde inte hämta adress:", error);
    return "Kunde inte hämta adress";
  }
}

onMounted(() => { 
    fetchLatestReports()
  })

</script>
<!-- CSS-->
<style scoped>

.preview-container {
  margin-top: 15px;
  text-align: center;
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 2px solid #ddd;
  display: block;
  margin: 10px auto;
}

.preview-text {
  font-size: 0.9rem;
  color: #666;
}

.remove-image-btn {
  background: #ff4444;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

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

.form-input-locked {
  width: 100%;
  padding: 16px;
  background-color: #edf2f7bc; /* Ljusgrå bakgrund */
  color: #718096;           /* Lite blekare textfärg */
  cursor: not-allowed;      /* Visar en "stopp"-symbol vid hovring */
  border: 1px solid #cbd5e0;
  border-radius: 16px;
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