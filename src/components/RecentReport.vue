<template>
    <div :class="['report-card', !report.image_url ? 'no-image' : '', isExpanded ? 'card-expanded' : '']">
      
      <div class="category-container">
        <span v-if="report.type === 'problem'" class="report-icon problem-icon">⚠️</span>
        <span v-else class="report-icon highlight-icon">👍</span>

        <p :class="['report-category', report.type === 'problem' ? 'red-bg' : 'green-bg']">
          {{ report.category }}
        </p>
      </div>

      <div class="delete-and-date">
          <button 
            v-if="props.showDelete" 
            type="button"
            class="mini-delete-btn" 
            @click.stop="emit('delete-click', report.report_id)">
            ✖️
          </button>
          <small class="report-date">{{ new Date(report.created_at).toLocaleDateString() }}</small>
      </div>

      <div class="report-info">
        <p class="report-title"> {{ report.title }} </p>
        <p ref="descriptionRef" :class="['report-description', isExpanded ? 'expanded' : '']">
          {{ report.description }}
        </p>

        <button v-if="hasOverflowingText" type="button" class="toggle-description-btn" @click="isExpanded = !isExpanded">
          {{ isExpanded ? 'Visa mindre ▲' : 'Visa mer ▼' }}
        </button>
      </div>
        
      <img 
          v-if="report.image_url" 
          :src="report.image_url" 
          class="report-image"
          alt="Rapportbild"
      />

      <div class="report-footer">
        <p class="report-location clickable-location" @click="handleLocationClick">📍 {{ report.address || 'Okänd adress' }}</p>
        <button class="boost-action-btn" @click="openBoostModal(report.report_id, props.session, report.type)" :disabled="isBoosting">
            {{ isBoosting ? '...' : '🚀 Boost' }}
        </button>
      </div>
    </div>
</template>


<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useBoost } from '@/composables/useBoost' //för att kunna använda boost funktionen

const { openBoostModal, isBoosting } = useBoost()
const props = defineProps(['report', 'session', 'showDelete'])
const router = useRouter()

const handleLocationClick = () => {
  if (router.currentRoute.value.path === '/' || router.currentRoute.value.name === 'StartMWC') {
    router.push({
      path: '/allreports',
      query: { selectedReport: props.report.report_id } 
    })
  } else {
   
    emit('click-location', props.report.report_id) 
  }
}

const isExpanded = ref(false) //ifall beskrivningen är öppen eller ej
const hasOverflowingText = ref(false) 
const descriptionRef = ref(null)      
const emit = defineEmits(['click-location', 'delete-click'])


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
    "category    deleteAndDate"
    "info       image"
    "footer      footer";
   gap: 10px;
  width: 100%; 
  height: auto;
  min-height: 205px;
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
    "category    deleteAndDate"
    "info       info"
    "footer      footer";
}

.category-container {
  grid-area: category;     
  display: flex;          
  align-items: center;     
  gap: 8px;                
  justify-self: start;    
}

.report-icon {
  font-size: 1rem;      
  line-height: 1;
}

.report-category {  
  margin: 0;
  font-size: 0.8rem;
  justify-self: start;
  text-align: left;
  background-color: #27c4b4b4;
  border-radius: 50px;
  padding: 5px;  
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
  margin: 0; 
  text-align: left;
  padding-top: 5px; 
  align-self: start; 
  line-height: 1.4;
  font-size: 14px;

  display: -webkit-box;
  -webkit-line-clamp: 3; 
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.report-image {
 grid-area: image;
 width: 100%;
 max-width: 150px; 
 height: auto;
 max-height: 110px;
 object-fit: cover;
 align-self: center;
 justify-self: end;
}

.report-footer {
  grid-area: footer;
  border-top: 1px dashed black;
  display: flex; 
  justify-content: space-between; 
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
    background-color: #ffd700; 
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

.report-description.expanded {
  -webkit-line-clamp: unset; 
  display: block; 
}

.toggle-description-btn {
  background: none;
  border: none;
  color: #27c4b4; 
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

.clickable-location {
  cursor: pointer; 
  transition: color 0.2s;
}

.clickable-location:hover {
  color: #20c7b5; 
  text-decoration: underline; 
}

.mini-delete-btn:hover {
    transform: scale(1.15);
}

/* Container för både kryss och datum */
.delete-and-date {
    grid-area: deleteAndDate;
    display: flex;
    flex-direction: column;
    align-items: flex-end; /* Trycker innehållet till höger i containern */
    justify-content: flex-start;
    gap: 2px;
    justify-self: end;
}

/* Själva datum-texten */
.report-date { 
  margin-top: 12px;
  font-size: 0.8rem;
  color: #666; 
}

.mini-delete-btn {
    background: transparent;
    border: none;
    font-size: 16px;
    cursor: pointer;
}

.mini-delete-btn:hover {
    transform: scale(1.15); 
}

</style>