<template>
    <main class="report-page">
       
      <!--Allmän header för alla sidor  -->
      <header class="site-header">
        <h1 class="site-title">Turquoise My Walking City Bar</h1>
      </header>
  
      <!--Header specifik för sidan -->
      <section class="report-header">
        <h2 class="report-title">Add a highlight!</h2>
        <p class="report-subtitle">Current location</p>
      </section>
  
      <!-- Sektion för kart-området -->
       <section class="map-section">
          <div class="map-container">
              <!-- Test bild för kartan för uppdattning -->
              <img src="/img/test-map.png" alt="Map preview" class="map-image" />
  
              <!-- Recent reports i hörnet av kartan -->
              <aside class="recent-report">
                <h3 class="recent-reports-title">Recent reports</h3>
                <ul class="recent-reports-list">
                      <li> Culture festival </li>
                      <li> Parade </li>
                      <li> Lovely park </li>
                  </ul>
              </aside>
            </div>
        </section>
  
       <!-- Beskrivningsrutan -->
       <section class="form-section">
        <div class="form-container">
  
          <div class="form-field">
            <label for="category" class="form-label"> Category </label>
            <select id="category" class="form-control" v-model="category">
              <option disabled value="">Choose category</option>
              <option> Culture </option>
              <option> Nature </option>
              <option> Events </option>
              <option> Must-see </option>
              <option> Food and drinks </option>
              <option>Other</option>
              </select>
          </div>
  
        <div class="form-field">
          <label for="description" class="form-label"> Describe your problem</label>
            <textarea
              id="description"
              class="form-input"
              placeholder="Describe the highlight"
              rows="5"
              v-model="description"
            ></textarea>
        </div>
  
        <div class="form-field">
          <label for="photo" class="form-label">Photo</label>
          <label for="photo" class="form-control file-control">
            <span class="file-control-text">Upload or take a photo</span>
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
        Send in your highlight!
      </button>
  
      <!-- Popup-fönstret -->
      <div v-if="showPopup" class="popup-overlay">
        <div class="popup-box">
        <p class="popup-text">Thank you for caring about our city!</p>
          <h3 class="popup-title">What happens now?</h3>
            <p class="popup-description">
              Your highlight is sent to Uppsala municipality who will make sure it gets posted (?)!
            </p>
        <button class="popup-button" @click="handleDone"> Done </button>
        </div>
      </div>
      </div>
      </section>
    </main>
  </template>
  
  <!--JS-->
  <script setup>
    import { ref } from 'vue' // ref skapar variabler som Vue håller koll på 
    import { useRouter } from 'vue-router'// För att kunna navigera mellan sidor 
  
    const router = useRouter()
    const showPopup = ref(false) // säger att popupen inte ska synas - default 
  
    //För att kunna nollställa formuläret efter submit 
    const category = ref('') //default kategori börjar som tom 
    const description = ref('') //default beskrivning börjar som tom
    const photo = ref(null) //default inget foto 
  
    function handleSubmit() { //körs när användaren klickar på submit knappen 
    showPopup.value = true
    }
  
    function handleDone() { //körs när användaren klickar på "done" i submit pop-up --> nollställ
    category.value = ''
    description.value = ''
    photo.value = null
    showPopup.value = false
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
  
  /* ===== Header ===== */
  .site-header {
    background-color: #2bb3a3;
    padding: 16px;
    color: white;
  }
  .site-title {
    margin: 0;
    font-size: 20px;
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