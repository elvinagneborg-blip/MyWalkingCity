<template>
    <div :class="['report-card', !report.image_url ? 'no-image' : '', isExpanded ? 'card-expanded' : '']">
      <div class="category-container">
        <span v-if="report.type === 'problem'" class="report-icon problem-icon">⚠️</span>
        <span v-else class="report-icon highlight-icon">👍</span>

        <p :class="['report-category', report.type === 'problem' ? 'red-bg' : 'green-bg']">
          {{ report.category }}
        </p>
      </div>

        <div class="report-info">
          <p class="report-title"> {{ report.title }} </p>
          <p ref="descriptionRef" :class="['report-description', isExpanded ? 'expanded' : '']">
            {{ report.description }}</p>

          <button v-if="hasOverflowingText" class="toggle-description-btn" @click="isExpanded = !isExpanded">
            {{ isExpanded ? 'Visa mindre ▲' : 'Visa mer ▼' }}
          </button>
        </div>
        <small class="report-date">{{ new Date(report.created_at).toLocaleDateString() }}</small>
        <img 
                    v-if="report.image_url" 
                    :src="report.image_url" 
                    class="report-image"
                    alt="Rapportbild"
                />
        <div class="report-footer">
          <p class="report-location">📍 {{ report.address || 'Okänd adress' }}</p>
          <button class="boost-action-btn" @click="handleBoost(report.report_id, props.session)" :disabled="isBoosting">
              {{ isBoosting ? '...' : '🚀 Boosta' }}
          </button>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useBoost } from '@/composables/useBoost' //för att kunna använda boost funktionen

const { handleBoost, isBoosting } = useBoost()
const props = defineProps(['report', 'session'])

const isExpanded = ref(false) //ifall beskrivningen är öppen eller ej
const hasOverflowingText = ref(false) // NYTT: Håller koll på om texten faktiskt klipper av
const descriptionRef = ref(null)      // NYTT: En referens till själva <p>-taggen i HTML

// NYTT: Funktion som kollar om texten är längre än vad som får plats på 4 rader
const checkOverflow = () => {
  if (descriptionRef.value) {
    const el = descriptionRef.value
    // Om textens verkliga höjd är större än den synliga höjden klipper den av!
    hasOverflowingText.value = el.scrollHeight > el.clientHeight
  }
}

onMounted(async () => {
  await nextTick() // Vänta tills Vue har ritat ut texten på skärmen, ta bort???
  checkOverflow()
})

</script>

<style scoped>

.report-card {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas: 
    "category    date"
    "info       image"
    "footer      footer";
   gap: 10px;
  width: 100%; /* Ändrat från 20% så den syns ordentligt */
  height: 205px;
  max-width: 600px;
  margin-bottom: 10px;
  padding: 20px;
  border-radius: 12px;
  align-items: start;
  border: 1.5px solid #5e716f5d;
  background-color: #c8efeb5d;
}

.report-card.card-expanded {
  height: auto;
  min-height: 205px;
}

.no-image {
  grid-template-columns: 2fr 1fr;
  grid-template-areas: 
    "category    date"
    "info       info"
    "footer      footer";
}

.category-container {
  grid-area: category;     /* Gör att hela paketet hamnar i "category"-rutan i ditt grid */
  display: flex;           /* Lägger ikonen och textbubblan bredvid varandra */
  align-items: center;     /* Centrerar dem perfekt i höjdled */
  gap: 8px;                /* Ger ett litet avstånd (8 pixlar) mellan ikonen och bubblan */
  justify-self: start;     /* Håller paketet till vänster */
}

.report-icon {
  font-size: 1rem;       /* Gör emojin lite större och tydligare */
  line-height: 1;
}

.report-category {  
  margin: 0;
  font-size: 0.8rem;
  justify-self: start;
  text-align: left;
  background-color: #27c4b4b4;
  border-radius: 50px;
  padding: 5px;  /**/
}

.report-info{
  grid-area: info;
  border-radius: 8px;
  padding: 15px;

}

.report-title {
  font-size: 20px;
  margin: 0;
  text-align: left;
  margin-top: -15px;
}

.report-description { 
  margin: 0; /* Ta bort margin-top för att få upp den helt */
  text-align: left;
  padding-top: 5px; /* Lägg till lite padding om det blir för trångt */
  align-self: start; /* Tvingar elementet till toppen av sin cell */
  line-height: 1.4;
  font-size: 14px;

  display: -webkit-box;
  -webkit-line-clamp: 3; /* Här kan du ändra till 2 eller 4 rader om du vill */
  -webkit-box-orient: vertical;
  overflow: hidden;
}


.report-date { 
  grid-area: date; 
  align-self: start; /* Tvingar upp datumet till toppen av kortet */
  justify-self: end; /*trycker ut datumet till höger*/
  margin: 0;
}

.report-image {
 grid-area: image;
 max-width: 150px; 
 max-height: 110px;
 object-fit: contain;
 align-self: center;
 justify-self: end;
}

.report-footer {
  grid-area: footer;
  border-top: 1px dashed black;
  display: flex; /* så de hamnar brevid varandra och inte under*/
  justify-content: space-between; /*de hamnar på varsin sida*/
  margin-bottom: -10px;
}

.report-location {
  text-align: left;
  align-self: center;
  font-size: 11px;
  margin-top: 20px;
}

.boost-action-btn {
    margin-top: 10px;
    padding: 6px 12px;
    background-color: #ffd700; /* Guld/Gul för boost */
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    font-size: 11px;
    transition: transform 0.2s;
    height: 30px;
}

.boost-action-btn:hover {
    transform: scale(1.05);
}

.boost-action-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}



.red-bg {
  background-color: rgba(235, 41, 41, 0.228); 
}

.green-bg {
  background-color: rgba(15, 203, 115, 0.366); 
}

/* Ser till att texten visar alla rader och inte klipps av vid expansion */
.report-description.expanded {
  -webkit-line-clamp: unset; 
  display: block; 
}

/* Valfritt: Styla "Visa mer/mindre"-knappen så den ser ut som en snygg länk */
.toggle-description-btn {
  background: none;
  border: none;
  color: #27c4b4; /* Snygg färg som passar appens tema */
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  margin-top: 5px;
  display: block;
}

.toggle-description-btn:hover {
  text-decoration: underline;
}


</style>