<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p>Laddar Uppsala City...</p>
  </div>

  <main v-else class="feedback-page">
  

  <section class="feedback-container">
    <h2 class="feedback-title"> {{uiLabels.thankYouText}} </h2>
    <h3 class="feedback-subtitle"> {{uiLabels.whatHappensNow}} </h3>
    <p class="feedback-text"> {{ uiLabels.feedbackProblem }} </p>

    <div class="createAccount-button-container">
      <router-link to="/login/" class="btn createAccount" > {{uiLabels.createAccount}} </router-link> 
      <router-link to="/login/" class="btn LogIn" > {{uiLabels.logIn}} </router-link> 
    </div>

  </section>

  
  </main>
</template>


<script setup>
//Imports
  import { ref, onMounted, watch } from 'vue' //för att kunna ha reaktiva variabler och övervaka dem
  import io from 'socket.io-client' //kontakt med server
  import { useRouter } from 'vue-router'
  import WebbHeader from '@/components/WebbHeader.vue'
  import MapComponent from "@/components/MapComponent.vue";
  import { supabase } from '@/utils/supabase'
  import L from 'leaflet'

  //Setup and Props (Input)
  const socket = io("localhost:3000")
  const props = defineProps(['currentLang']) //ta emot språkval från app.vue

  //Data
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
  const photo = ref(null) 
  const selectedFile = ref(null)
  const router = useRouter()
  const showPopup = ref(false) 
  const imagePreview = ref(null)
  const addressSearch = ref('')
  const reportMap = ref(null)
  

  function updateCoords({ lat, lng }) {
  formData.value.latitude = lat
  formData.value.longitude = lng
  console.log(`Uppdaterade koordinater: ${lat}, ${lng}`)
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
 async function handleSubmit() {
  isSubmitting.value = true
  const imageUrl = await uploadImage() // 1. Ladda upp bilden först (om användaren valt en)
  const reportData = { // 2. Förbered datan som ska till databasen
    ...formData.value,
    image_url: imageUrl // Här lägger vi till länken vi just fick
  }
  const { error } = await supabase // 3. Skicka till reports-tabellen
    .from('reports')
    .insert([reportData])

  if (error) {
    alert("Kunde inte skicka: " + error.message)
  } else {
    alert("Allt klart! Bild och rapport sparad.")
    router.push('/allreports')
  }
  
  isSubmitting.value = false
}

async function searchAddress() {
  // ... din fetch-kod från tidigare ...
  if (data.length > 0) {
    const { lat, lon } = data[0]
    // Anropa kartans funktion för att flytta markören dit
    reportMap.value.setLocation(parseFloat(lat), parseFloat(lon))
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

  const handleDone = () => { 
    category.value = ''
    description.value = ''
    photo.value = null
    showPopup.value = false
    // Omdirigerar tillbaka till startsidan där listan uppdateras
    router.push({ name: 'StartMWC' })
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


</script>




<!-- CSS-->
<style scoped>
.btn 
{
  display: inline-block;
  padding: 12px 24px;
  margin: 10px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
}
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
.feedback-header {
  padding: 16px;
}

.feedback-title {
  margin-bottom: 8px;
}

.feedback-subtitle {
  margin: 0;
}


.submit-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background-color: #2f2f2f;
  color: white;
  cursor: pointer;
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