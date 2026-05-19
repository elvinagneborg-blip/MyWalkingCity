<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p>{{ uiLabels.loadingMWC }}</p>
  </div>

  <main v-else class="report-page">
  
  <section class="report-page">
    <!--Header specifik för sidan -->
    <section class="report-header">
      <h2 class="report-title"> {{ uiLabels.reportAHighlight }} </h2>
      
    </section>

   

  <section class="form-section">

  <!-- Wrappa allt i en form-tagg -->
      <form @submit.prevent="handleSubmit" class="form-container">

        <div class="map-panel-wrapper">
        <div class="map-container">
          <MapComponent 
          ref="reportMap" 
          :allReports="highlightMarkers"
          :showReportId="activeReportId"
          @location-changed="updateCoords"
    />

       <!-- Nearby reports knapp -->
        <button 
          v-if="!showNearbyReports"
          class="allreports-recent-report-button"
          @click="showNearbyReports = true">
          {{uiLabels.nearbyReports}}
        </button>
        </div>

      <!--Nearby reports listan-->
    <ReportPanel 
      v-if="showNearbyReports"
        :title="uiLabels.nearbyReports"
        :reports="nearbyReports"
        :session="session"
        :emptyMessage="uiLabels.noReportsSubmitted"
        @close="showNearbyReports = false"
        @click-location="handleLocalReportClick"
    />
 
  </div>


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
            <button type="button" @click="getLocation(true)" class="btn-secondary location-btn">{{ uiLabels.getMyLocation }}</button>
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
          <label for="category" class="form-label"> {{ uiLabels.category }} </label>
          <select id="category" class="form-control" v-model="formData.category" required>
            <option disabled value="">{{ uiLabels.chooseCategory }}</option>
            <option value="culture">{{uiLabels.culture}}</option>
            <option value="event">{{uiLabels.event}}</option>
            <option value="nature">{{uiLabels.nature}}</option>
            <option value="mustsee">{{uiLabels.mustsee}}</option>
            <option value="foodanddrink">{{uiLabels.foodanddrink}}</option>
            <option value="other">{{uiLabels.other}}</option>
          
          </select>
        </div>

         <div class="form-field">
          <label for="title" class="form-label"> {{ uiLabels.title }} </label>
          <input
            id="title"
            class="form-input"
            :placeholder="uiLabels.giveHighlightTitle"
            v-model="formData.title"
            required
          />
        </div>

        <div class="form-field">
          <label for="description" class="form-label"> {{ uiLabels.describeYourHighlight }}</label>
          <textarea
            id="description"
            class="form-input"
            :placeholder="uiLabels.whatYouWantHighlight"
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
          <label for="email" class="form-label">{{ uiLabels.email }}</label>
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
            :placeholder="uiLabels.usernamePlaceholder"
            v-model="formData.username"
            :readonly="!!usernameFromProfile"
          />
          <p v-if="usernameFromProfile" class="helper-text">
            {{ uiLabels.changeInProfileHint }}
          </p>
        </div>

        <button type="submit" class="submit-button" :disabled="isSubmitting">
          {{ isSubmitting ? uiLabels.sending : uiLabels.sendInHighlight }}
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
  import ReportPanel from '@/components/ReportPanel.vue'
  import { supabase, addPoints } from '@/utils/supabase' //funktionen för att få och spara poäng
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
    type: 'highlight', // Förvalt värde
    title: '', 
    category: '',
    description: '',
    image_url: '',
    email: '',
    latitude: null, // Förvalt till centrala Uppsala
    longitude: null, // Förvalt till centrala Uppsala
    address: ''
  })

  // --- Funktioner ---

   //Images
    //Report Image
  const { 
    selectedFileName, 
    imagePreview, 
    handlePhotoUpload, 
    removeImage, 
    uploadImage 
  } = useImageUpload()

  //Map and adress search
  const reportMap = ref(null);
  const addressSearch = ref('');
  const userLocation = ref(null);
  const selectedAddress = ref(null);

  function getLocation(isManual = false) {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Här får vi koordinaterna!
          userLocation.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          updateCoords(userLocation.value) // Uppdatera kartan och adressen direkt när vi får platsen
          
          console.log("Plats hittad:", userLocation.value);

          if (reportMap.value) {
            reportMap.value.setLocation(userLocation.value.lat, userLocation.value.lng)
          }
        },
        function(error) {
      // Vi visar bara felmeddelanden om användaren aktivt tryckt på knappen
            if (isManual) {
              if (error.code === 1) { // 1 = PERMISSION_DENIED
                alert(uiLabels.value.locationPermissionDenied || "Platsåtkomst nekad. För att använda platsfunktionen, vänligen tillåt platsåtkomst i din webbläsare.");
              } else {
                alert(uiLabels.value.locationError || "Kunde inte hämta din plats: " + error.message);
              }
            }
            // Om isManual är false (vid sidladdning) så händer ingenting
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
  if (!query) return // Sök inte om fältet är tomt

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    )
    const data = await response.json()

    if (data.length > 0) {
      const { lat, lon } = data[0]
      const newLat = parseFloat(lat)
      const newLon = parseFloat(lon)

      // Flytta kartan
      if (reportMap.value) {
        reportMap.value.setLocation(newLat, newLon)
      }

      // Spara koordinaterna i formuläret
      formData.value.latitude = newLat
      formData.value.longitude = newLon
      
      // Hämta en ren och snygg gatuadress och sätt den i det låsta fältet
      const cleanAddress = await getAddressFromCoords(newLat, newLon)
      selectedAddress.value = cleanAddress
      
      //  HÄR TÖMMER VI SÖKFÄLTET 
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
  // Inledande kontroller (Validering)
  
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
    // Förbered användardata
    if (props.session) {
      formData.value.email = props.session.user.email;
    }

    // Bildhantering
    // Vi väntar på att bilden laddas upp till Storage och får tillbaka URL:en
    const imageUrl = await uploadImage();

    // Förbered det slutgiltiga objektet för databasen
    const reportData = {
      ...formData.value,
      image_url: imageUrl, // URL från storage (eller null om ingen bild valdes)
      user_id: props.session ? props.session.user.id : null,
      created_at: new Date().toISOString() // Bra praxis att sätta tidstämpel explicit
    };

    // Skicka till Supabase 'reports'-tabellen
    const { error } = await supabase
      .from('reports')
      .insert([reportData]);

    if (error) {
      throw error; // Hoppa till catch-blocket om databasen nekar
    }

    // 10 poäng vid highligt sparas hos användaren
    if (props.session) {
      await addPoints(props.session.user.id, 10);
    }

    // Succé! Skicka användaren vidare
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
  
  // anropar vår SQL-funktion skickar med parametrarna
  const { data, error } = await supabase
    .rpc('get_nearby_reports', {
      in_lat: lat,
      in_lng: lng,
      in_type: 'highlight' //BARA hämta highlights
    })

  if (!error && data) {
    nearbyReports.value = data
  } else {
    console.error("Kunde inte hämta nära highlights från RPC:", error?.message)
  }
}

  //ta alla highligts och lägga ut markörer på kartan
  const highlightMarkers = ref([])

  async function fetchHighlightMarkers() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('type', 'highlight') // Hämtar BARA highlights
    
  if (!error && data) {
    highlightMarkers.value = data
  } else {
    console.error("Kunde inte hämta kartmarkörer:", error?.message)
  }
}

//rapporten visas på kartan om man klickar på location
const activeReportId = ref(null)

function handleLocalReportClick(reportId) {
  activeReportId.value = reportId 
}

// Bevaka när panelen öppnas/stängs och knuffa kartan i pixlar på mobilen
watch(showNearbyReports, async (isOpen) => {
  if (formData.value.latitude && formData.value.longitude && reportMap.value) {
    await new Promise(resolve => setTimeout(resolve, 150)); // 1. Vänta ett litet ögonblick så att CSS-panelen hinner ritas ut
    if (typeof reportMap.value.invalidateSize === 'function') {  // 2. Berätta för Leaflet att storleken har ändrats
      reportMap.value.invalidateSize();
    }
    reportMap.value.setLocation(formData.value.latitude, formData.value.longitude); // 3. Sätt ALLTID kartan i centrum på nålens RIKTIGA koordinater först
    const isMobile = window.innerWidth <= 768;

    if (isOpen && isMobile) { // 4. Om vi är på mobil och panelen öppnades, knuffa kameran i pixlar

      const mapWidth = document.querySelector('.map-container')?.clientWidth || 0;   // Vi hämtar kartans bredd i pixlar
      const pixelsToMove = mapWidth * 0.25;

      if (typeof reportMap.value.panBy === 'function') {
        reportMap.value.panBy(pixelsToMove, 0);
      }
    }
  }
});

  //Lifecycle hooks
onMounted(() => { 
    setTimeout(() => {
      getLocation() // Hämta användarens plats vid sidladdning
    }, 500)
    fetchUserProfile()
    fetchHighlightMarkers()
  })
</script>



<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}
/*Övergripande layout*/
.report-page {
  margin: 0 auto;
  font-family: 'var(--inputFont)';
  background-color: #f9fbfb; 
  color: #2d3748;
}


/* Sidhuvud */
.report-header {
  padding: 20px 20px 40px;
  text-align: center;
}

.report-title {
  font-size: 2.2rem;
  font-weight: 800; 
  color: #1a202c;
  margin-bottom: 8px;
  letter-spacing: -0.03em; 
}

.report-subtitle {
  color: #718096;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/*  Formulärsektion */

.form-section {
  display: flex;
  justify-content: center;
  padding: 0 20px 60px;
}

.form-container {
  width: 100%;
  max-width: 1100px; 
  background-color: #cbe5e1;
  border-radius: 24px;
  padding: 40px;
  box-sizing: border-box;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); 
  border: 1px solid #e2e8f0;
}


.map-panel-wrapper {
  display: flex;
  width: 100%;
  height: 500px; 
  gap: 15px;     
  margin-bottom: 30px;
  position: relative;
}

/*  Karta */
.map-container {
  flex: 1;          
  height: 100%; 
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #cbd5e0;
  z-index: 1;
  position: relative;  
}

.map-panel-wrapper :deep(.allreports-recent-report-panel) {
  width: 340px;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Nearby reports */
.recent-report { /*obs ändra namn sen*/ 
  position: absolute;
  top: 20px;
  right: 20px;
  width: 260px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px); 
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


/*  Form Controls  */
.form-field {
  margin-bottom: 28px;
}

.form-label {
  font-weight: 600; 
  font-size: 0.9rem;
  text-transform: uppercase; 
  letter-spacing: 0.05em;
  margin-bottom: 10px;
  color: #718096; 
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

/*  Knappar  */
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
  background-color: #1ebc9c; 
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
  width: auto; 
}

/*  Bilder & Preview  */
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
  background: #f0f9f7; 
  padding: 20px;
  border-radius: 16px;
  border: 1px dashed #1ebc9c;
}




/* ===== Mobilanpassning ===== */
@media (max-width: 768px) {
 
    .form-container {
    padding: 20px;
    border-radius: 0; 
  }
  
  .map-container {
    height: 350px;
    padding: 0; 
  }

  .map-panel-wrapper {
    height: auto; 
    flex-direction: column; 
    position: relative;
  } 

  .map-panel-wrapper :deep(.allreports-recent-report-panel) {
    position: absolute;
    top: 0;
    right: 0;
    width: 70%;              
    height: 100%;          
    z-index: 1000;
    background-color: rgba(238, 238, 238, 0.95);
    border-radius: 10px;     
    box-shadow: -4px 0 15px rgba(0, 0, 0, 0.2);
  }

  .recent-report {
    display: none; 
  }

  .report-header {
    padding: 0px;
  }

  .report-title {
    font-size: 1.8rem;
    margin-bottom: 25px;
  }

  .search-group {
  display: grid;
  grid-template-columns: 1fr auto; 
  gap: 10px;
}

  .location-btn {
  grid-column: 1 / -1; 
}

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

</style>