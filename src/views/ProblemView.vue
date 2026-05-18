<template>
  <!--Loading skärm-->
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p>{{ uiLabels.loadingMWC }}</p>
  </div>

  <!--Main-->
  <main v-else class="report-page">
    <!--Header specifik för sidan -->
    <section class="report-header">
      <p class="report-title"> {{ uiLabels.reportAProblem }} </p>
    </section>

    <!--Formuläret-->
    <section class="form-section">
      <form @submit.prevent="handleSubmit" class="form-container">

      <div class="map-container">
        <MapComponent ref="reportMap" @location-changed="updateCoords"/>
        <!-- Nearby reports knapp -->
        <button 
          v-if="!showNearbyReports"
          class="allreports-recent-report-button"
          @click="showNearbyReports = true">
          {{uiLabels.nearbyReports}}
        </button>
      </div>

      <!--Nearby reports listan-->
      <aside v-if="showNearbyReports" class="allreports-recent-report-panel">
      <div class="allreports-recent-report-header">
        <p class="allreports-recent-report-title"> {{ uiLabels.nearbyReports }} </p>
        <button
          class="allreports-close-recent-report-panel"
          @click="showNearbyReports = false"
          aria-label="Close recent report">
               ✖️
        </button>
      </div>

      <div class="report-list">
        <!-- Visas om det är tomt i sessionStorage -->
        <div v-if="nearbyReports.length === 0">
            <p> {{ uiLabels.noReportsSubmitted }}</p>
        </div>
            <!-- Loopar igenom den hämtade datan -->
          <RecentReport 
            v-else
            v-for="report in nearbyReports" 
            :key="report.id" 
            :report="report"
            :session="session"/>
        </div>

        <aside v-if="showNearbyReports" class="allreports-recent-report-panel">

          <div class="allreports-recent-report-header">
            <p class="allreports-recent-report-title"> Rapporter i närheten </p>
            <button
              class="allreports-close-recent-report-panel"
              @click="showNearbyReports = false"
              aria-label="Close recent report">
                  x
            </button>
          </div>

          <div class="report-list">
            <div v-if="nearbyReports.length === 0">
                <p> {{ uiLabels.noReportsSubmitted }}</p>
            </div>
            <RecentReport 
              v-else
              v-for="report in nearbyReports" 
              :key="report.id" 
              :report="report"
              :session="session"
            />
          </div>
        </aside>


      <!--Formuläret-->
        <div class="form-field">
          <label class="form-label">{{ uiLabels.searchBar }}</label>
          
          <div class="search-group">
            <input 
              type="text" 
              v-model="addressSearch"
              :placeholder="uiLabels.searchForLocation"
              class="form-control"
              @keydown.enter.prevent="searchAddress" 
            />
            <button type="button" @click="searchAddress" class="btn-secondary">{{ uiLabels.search }}</button>
            <button type="button" @click="getLocation(true)" class="btn-secondary">{{ uiLabels.getMyLocation }}</button>
          </div>

          <div v-if="selectedAddress" class="selected-address-display" style="margin-top: 12px;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">
              {{ uiLabels.selectedAddress || 'Vald adress' }}
            </label>
            <input 
              type="text" 
              class="form-input-locked" 
              :value="selectedAddress" 
              readonly 
            />
          </div>
        </div>

        <div class="form-field">
          <label for="category" class="form-label"> {{uiLabels.category}} </label>
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
          <label for="title" class="form-label"> {{ uiLabels.title }} </label>
          <input
            id="title"
            class="form-input"
            :placeholder="uiLabels.giveProblemTitle"
            v-model="formData.title"
            required
          />
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
          <label class="form-label">{{ uiLabels.photo }}</label>

          <div v-if="!imagePreview">
            <label for="photo" class="custom-file-upload-button">
              <span>{{ uiLabels.photoPlaceholder }}</span>
              <span class="file-control-icon">🖼️</span>
              <input
                id="photo"
                type="file"
                accept="image/*"
                capture="environment"
                class="hidden-file-input"
                @change="handlePhotoUpload"
              />
            </label>
          </div>

          <div v-else class="preview-container">
            <div class="selected-file-info">
              <span class="filename">📍 {{ selectedFileName }}</span>
            </div>
            
            <img :src="imagePreview" class="image-preview" />
            
            <button type="button" @click="removeImage" class="remove-image-btn">
              🗑️ {{ uiLabels.removeImage }}
            </button>
          </div>
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
            :placeholder="uiLabels.emailPlaceholder"
            v-model="formData.email"
          />
        </div>

        <div class="form-field">
          <label class="form-label">{{ uiLabels.usernameLabel }}</label>
          <input
            type="text"
            class="form-input"
            :class="{ 'form-input-locked': !!usernameFromProfile }"
            :placeholder="uiLabels.usernamePlaceholder || 'Välj ett publikt namn'"
            v-model="formData.username"
            :readonly="!!usernameFromProfile"
          />
          <p v-if="usernameFromProfile" class="helper-text">
            {{ uiLabels.changeInProfileHint }}
          </p>
        </div>

        <!-- 4. Ändra till type="submit" och ta bort @click (formuläret sköter det nu) -->
        <button type="submit" class="submit-button" :disabled="isSubmitting">
          {{ isSubmitting ? uiLabels.sending : uiLabels.sendInReport }}
        </button>
      </form>
    </section>
    

  </main>
</template>


<script setup>
  //Imports
  import { ref, onMounted, watch } from 'vue' //för att kunna ha reaktiva variabler och övervaka dem
  import io from 'socket.io-client' //kontakt med server
  import { useRouter } from 'vue-router'
  import MapComponent from "@/components/MapComponent.vue";
  import RecentReport from '../components/RecentReport.vue' //RecentReportkomponent
  import {supabase, addPoints } from '@/utils/supabase' //funktionen för att få och spara poäng
  import { useImageUpload } from '@/composables/useImageUpload'

  //Setup and Props (Input)
  const props = defineProps(['backendURL', 'currentLang', 'session']) //ta emot språkval från app.vue
  const router = useRouter()
  const socket = io(props.backendURL)

  //UI and language
  const uiLabels = ref({})                      //Språkknappar/uiLabels

  socket.on("uiLabels", (labels) => {           //Lyssnare för uiLabels
    uiLabels.value = labels
  })

  watch(() => props.currentLang, (newLang) => { //vakta språkvalet, ligger alltid och lyssnar
    socket.emit("getUILabels", newLang || "en");        //Hämtar uiLabels enl. valt språk
  }, { immediate: true })                       //Språket laddas direkt när sidan laddas, istället för att vänta på att språket ska ändras 1a gngen

  //Data
  const isSubmitting = ref(false)
  const formData = ref({
  type: 'problem', // Förvalt värde
  title: '',
  category: '',
  description: '',
  image_url: '',
  email: '',
  username: '', 
  latitude: null, 
  longitude: null,
  address: ''
  })

  // --- Funktioner ---

  // Körs när användaren valt en bild
  const { 
    selectedFileName, 
    imagePreview, 
    handlePhotoUpload, 
    removeImage, 
    uploadImage 
  } = useImageUpload()

  const reportMap = ref(null);
  const addressSearch = ref('');
  const userLocation = ref(null);
  const selectedAddress = ref('');

  function getLocation(isManual = false) {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          updateCoords(userLocation.value) 
          
          console.log("Plats hittad:", userLocation.value);

          if (reportMap.value) {
            reportMap.value.setLocation(userLocation.value.lat, userLocation.value.lng)
          }
        },
        function(error) {
            if (isManual) {
              
              if (error.code === 1) { // 1 = PERMISSION_DENIED
                alert(uiLabels.value.locationPermissionDenied || "Platsåtkomst nekad. För att använda platsfunktionen, vänligen tillåt platsåtkomst i din webbläsare.");
              } else {
                alert(uiLabels.value.locationError || "Kunde inte hämta din plats: " + error.message);
              }
            }
            
          }
      );
    } else {
      alert("Din webbläsare stöder inte platsinformation.");
    }
};

  async function updateCoords({ lat, lng }) {
    formData.value.latitude = lat
    formData.value.longitude = lng
    console.log(`Uppdaterade koordinater: ${lat}, ${lng}`)
    fetchNearbyReports(lat, lng)
    const address = await getAddressFromCoords(lat, lng)
    addressSearch.value = ''
    selectedAddress.value = address
  }
  

  async function searchAddress() {
  const query = addressSearch.value
  if (!query) return 

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    )
    const data = await response.json()

    if (data.length > 0) {
      const { lat, lon } = data[0]
      const newLat = parseFloat(lat)
      const newLon = parseFloat(lon)

      if (reportMap.value) {
        reportMap.value.setLocation(newLat, newLon)
      }

      formData.value.latitude = newLat
      formData.value.longitude = newLon
      
      const cleanAddress = await getAddressFromCoords(newLat, newLon)
      selectedAddress.value = cleanAddress
      
      addressSearch.value = '' 
      
    } else {
      alert("Kunde inte hitta adressen.")
    }
  } catch (error) {
    console.error("Sökfel:", error)
    alert("Något gick fel vid sökningen. Kontrollera din internetanslutning.")
  }
}

  async function getAddressFromCoords(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
    
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

  //Username
const usernameFromProfile = ref(null);

// Funktion för att hämta profilinformation
async function fetchUserProfile() {
  if (!props.session) return;

  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', props.session.user.id)
    .single();

  if (data && data.username) {
    usernameFromProfile.value = data.username;
    formData.value.username = data.username; // Förifyll fältet
  }
}

  //Submit
  async function handleSubmit() {
  // 1. Inledande kontroller (Validering)
  
  // Kontrollera om användaren har valt en plats (inte bara kvar på Uppsala-default)
  const defaultLat = 59.8586;
  const defaultLng = 17.6389;
  
  if (!formData.value.latitude || 
      (formData.value.latitude === defaultLat && formData.value.longitude === defaultLng)) {
    alert(uiLabels.value.pleaseSelectLocation || "Vänligen välj en plats på kartan.");
    return;
  }

  // Kontrollera att kategori är vald
  if (!formData.value.category) {
    alert(uiLabels.value.pleaseSelectCategory || "Vänligen välj en kategori.");
    return;
  }

  if (!formData.value.username) {
    alert(uiLabels.value.pleaseEnterUsername || "Du måste fylla i ett användarnamn.");
    return;
  }

  // Starta laddningsläget
  isSubmitting.value = true;

  try {
    // 2. Förbered användardata
    if (props.session) {
      formData.value.email = props.session.user.email;
    }

    // 3. Bildhantering
    // Vi väntar på att bilden laddas upp till Storage och får tillbaka URL:en
    const imageUrl = await uploadImage();

    // 4. Förbered det slutgiltiga objektet för databasen
    const reportData = {
      ...formData.value,
      image_url: imageUrl, // URL från storage (eller null om ingen bild valdes)
      user_id: props.session ? props.session.user.id : null,
      created_at: new Date().toISOString() // Bra praxis att sätta tidstämpel explicit
    };

    // 5. Skicka till Supabase 'reports'-tabellen
    const { error } = await supabase
      .from('reports')
      .insert([reportData]);

    if (error) {
      throw error; // Hoppa till catch-blocket om databasen nekar
    }

    // Ge 10 poäng om användaren är inloggad
    if (props.session) {
      await addPoints(props.session.user.id, 10);
    }

    // 6. Succé! Skicka användaren vidare
    router.push('/feedback/');

  } catch (error) {
    console.error("Error submitting report:", error);
    alert((uiLabels.value.errorSending || "Kunde inte skicka: ") + error.message);
  } finally {
    // Stäng alltid av laddningsläget, oavsett om det gick bra eller dåligt
    isSubmitting.value = false;
  }
}

  //Livefeed, nearby report
  const nearbyReports = ref([])
  const showNearbyReports = ref(false)

  async function fetchNearbyReports(lat, lng) {
    if (!lat || !lng) return   
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .limit(50) //hämtar 50 stycken rapporter
    if (!error && data) {
      const sortedByDistance = data.sort((a, b) => {
        const distA = Math.pow(a.latitude - lat, 2) + Math.pow(a.longitude - lng, 2);
        const distB = Math.pow(b.latitude - lat, 2) + Math.pow(b.longitude - lng, 2);
        return distA - distB
    })
    nearbyReports.value = sortedByDistance.slice(0, 5);
    }else {
      console.error("Kunde inte hämta live-feed:", error.message)
    }
  }

  //Lifecycle hooks
  onMounted(() => { 
    setTimeout(() => {
    getLocation();
  }, 500);
  fetchUserProfile() // Hämta användarens profilinfo när komponenten laddas
  })
</script>


<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}
/* ===== Övergripande layout ===== */
.report-page {
  margin: 0 auto;
  font-family: 'var(--inputFont)';
  background-color: #f9fbfb; /* Ljus, fräsch bakgrund */
  color: #2d3748;
}

input, 
textarea, 
select, 
button, 
label {
  font-family: var(--inputFont) !important;
}

/* ===== Sidhuvud - Snyggare titel ===== */
.report-header {
  padding: 60px 20px 40px;
  text-align: center;
}

.report-title {
  font-size: 2.2rem;
  font-weight: 800; /* Extra tjock för titeln */
  color: #1a202c;
  margin-bottom: 8px;
  letter-spacing: -0.03em; /* Lite tightare bokstäver för modern look */
}

.report-subtitle {
  color: #718096;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* ===== Formulärsektion - Nu mycket bredare ===== */
.form-section {
  display: flex;
  justify-content: center;
  padding: 0 20px 60px;
}

.form-container {
  width: 100%;
  /* Breddad max-width för att använda mer av skärmen */
  max-width: 1100px; 
  background-color: #cbe5e1;
  border-radius: 24px;
  padding: 40px;
  box-sizing: border-box;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); /* Mjuk skugga istället för bara färg */
  border: 1px solid #e2e8f0;
}

/* ===== Karta - Maximerad bredd ===== */
.map-container {
  position: relative;
  width: 100%;
  height: 500px; /* Rejäl höjd för kartan */
  border-radius: 16px;
  margin-bottom: 30px;
  overflow: hidden;
  border: 1px solid #cbd5e0;
  /* Förhindrar att kartan "stjäl" fokus direkt */
  z-index: 1;
}

/* ===== Recent reports - Moderniserad "Glassmorphism" ===== */
.recent-report {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 260px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px); /* Snygg suddig bakgrund */
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
}

.recent-reports-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #2d3748;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 5px;
}

/* ===== Form Controls - Renare och modernare ===== */
.form-field {
  margin-bottom: 28px;
}

.form-label {
  font-weight: 600; /* Halvfet för labels */
  font-size: 0.9rem;
  text-transform: uppercase; /* Ger en ren, strukturerad känsla */
  letter-spacing: 0.05em;
  margin-bottom: 10px;
  color: #718096; /* Lite mjukare färg på labels */
  display: block;
}

.form-control,
.form-input,
.form-input-locked {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #edf2f7;
  border-radius: 12px;
  background-color: #f8fafc;
  font-size: 1rem;
  color: #2d3748;
  transition: all 0.2s ease;
}

.form-input-locked {
  background-color: #e1e6ec;
  color: #718096;
  cursor: not-allowed;
  border-color: #cbd5e0;
}

.form-control:focus,
.form-input:focus {
  outline: none;
  border-color: #1ebc9c;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(30, 188, 156, 0.1);
}

.helper-text {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 5px;
  font-style: italic;
}

.search-group {
  display: flex;
  gap: 10px;
}

/* ===== Knappar ===== */
.btn-secondary, .btn-location {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-secondary:hover, .btn-location:hover {
  background: #f7fafc;
}

.submit-button {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 12px;
  background-color: #1ebc9c; /* Använd er signaturfärg istället för mörkgrå */
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.2s;
}

.submit-button:hover {
  background-color: #17a68a;
  transform: translateY(-1px);
}

.submit-button:active {
  transform: translateY(0);
}

.custom-file-upload-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #f8fafc;
  border: 2px solid #edf2f7;
  border-radius: 12px;
  cursor: pointer;
}

.remove-image-btn {
  background-color: #ff5f5f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  width: auto; /* Gör den inte lika bred som send-knappen */
}

/* ===== Bilder & Preview ===== */
.hidden-file-input {
  display: none; 
}

.image-preview {
  width: 100%;
  max-width: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  background: #f0f9f7; /* Svag grön ton för att visa att något är valt */
  padding: 20px;
  border-radius: 16px;
  border: 1px dashed #1ebc9c;
}


/* Knappen som ligger ovanpå kartan */
.allreports-recent-report-button {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  padding: 10px 16px;
  background-color: #1ebc9c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* Panelen som dyker upp */
.allreports-recent-report-panel {
  position: fixed; /* Gör att den lägger sig ovanpå allt */
  top: 0;
  right: 0;
  width: 350px;
  height: 100%;
  background: white;
  z-index: 2000; /* Mycket högt så den täcker kartan */
  box-shadow: -4px 0 15px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.allreports-recent-report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.allreports-recent-report-title {
  margin: 0;
  font-size: 1.2rem;
}

.allreports-close-recent-report-panel {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
}

/* Scrollbar lista inuti panelen */
.report-list {
  overflow-y: auto;
  flex-grow: 1;
}

/* ===== Mobilanpassning ===== */
@media (max-width: 768px) {
  .report-title {
    font-size: 1.8rem;
  }
  
  .form-container {
    padding: 20px;
    border-radius: 0; /* Fullbredd på mobil känns ofta bättre utan hörn */
  }

  .map-container {
    height: 350px;
  }

  .recent-report {
    display: none; /* Dölj "senaste rapporter" på små skärmar för att frigöra plats på kartan */
  }

  /* Nu visar vi knappen! */
  .allreports-recent-report-button {
    display: block;
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    /* ... din befintliga knapp-styling ... */
  }

  /* Panelen görs om till en "slide-out" meny som täcker allt */
  .allreports-recent-report-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 100%; /* Eller t.ex. 300px */
    height: 100%;
    border-radius: 0;
    z-index: 2000;
  }

  /* Visa krysset så man kan stänga på mobilen */
  .allreports-close-recent-report-panel {
    display: block;
  }
}

</style>