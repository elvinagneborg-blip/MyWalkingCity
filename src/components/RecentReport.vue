<template>
    <div :class="['report-card', report.type === 'problem' ? 'red-bg' : 'green-bg']">
        <h4 class="report-category">{{ report.category }}</h4>
        <p class="report-description">{{ report.description }}</p>
        <small class="report-date">{{ new Date(report.created_at).toLocaleDateString() }}</small>
        <img 
                    v-if="report.image_url" 
                    :src="report.image_url" 
                    class="report-image"
                    alt="Rapportbild"
                />

        <button class="boost-action-btn" @click="handleBoost(report.report_id, props.session)" :disabled="isBoosting">
            {{ isBoosting ? '...' : '🚀 Boosta' }}
        </button>
    </div>
</template>


<script setup>
import { useBoost } from '@/composables/useBoost' //för att kunna använda boost funktionen

const { handleBoost, isBoosting } = useBoost()

const props = defineProps(['report', 'session'])

</script>

<style scoped>

.report-card {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas: 
    "category    image"
    "description image"
    "date        image";
   gap: 10px;
  width: 100%; /* Ändrat från 20% så den syns ordentligt */
  max-width: 600px;
  min-height: 180px; /* Använd min-height istället för height */
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 12px;
  align-items: start;
}

.no-image {
  grid-template-columns: 1fr;
  grid-template-areas: 
    "title"
    "desc"
    "date";
}


.report-card h4 {
  margin-bottom: 5px;
}

.report-category { 
  grid-area: category; 
  margin: 0;
  font-size: 1.1rem;
  /* Ingen align-self center här, då hamnar den i toppen av sin rad */
}

.report-description { 
  grid-area: description; 
  margin: 0; /* Ta bort margin-top för att få upp den helt */
  padding-top: 5px; /* Lägg till lite padding om det blir för trångt */
  align-self: start; /* Tvingar elementet till toppen av sin cell */
  line-height: 1.4;
}

.report-date { 
  grid-area: date; 
  align-self: end; /* Tvingar ner datumet till botten av kortet */
  margin: 0;
}

.report-image {
 grid-area: image;
  max-width: 200px;
  max-height: 150px;
}

.red-bg {
  background-color: rgba(255, 0, 0, 0.4); 
}

.green-bg {
  background-color: rgba(0, 255, 136, 0.4); 
}

.boost-action-btn {
    margin-top: 10px;
    padding: 6px 12px;
    background-color: #ffd700; /* Guld/Gul för boost */
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
    transition: transform 0.2s;
}

.boost-action-btn:hover {
    transform: scale(1.05);
}

.boost-action-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}


</style>