<template>
    <div :class="['report-card', !report.image_url ? 'no-image' : '']">
        <p :class="['report-category', report.type === 'problem' ? 'red-bg' : 'green-bg']">{{ report.category }}</p>
        <div class="report-info">
          <p class="report-title">Titel</p>
          <p class="report-description">{{ report.description }}</p>
        </div>
        <small class="report-date">{{ new Date(report.created_at).toLocaleDateString() }}</small>
        <img 
                    v-if="report.image_url" 
                    :src="report.image_url" 
                    class="report-image"
                    alt="Rapportbild"
                />
        <div class="report-footer">
          <p class="report-location">Location</p>
          <button class="boost-action-btn" @click="handleBoost(report.report_id, props.session)" :disabled="isBoosting">
              {{ isBoosting ? '...' : '🚀 Boosta' }}
          </button>
        </div>
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
    "category    date"
    "info       image"
    "footer      footer";
   gap: 10px;
  width: 100%; /* Ändrat från 20% så den syns ordentligt */
  max-width: 600px;
  min-height: 180px; /* Använd min-height istället för height */
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 12px;
  align-items: start;
  border: 1px solid;
  background-color: #c8efeb5d;
}

.no-image {
  grid-template-columns: 2fr 1fr;
  grid-template-areas: 
    "category    date"
    "info       image"
    "footer      footer";
}

.report-category { 
  grid-area: category; 
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
  margin-top: -5px;
}

.report-description { 
  margin: 0; /* Ta bort margin-top för att få upp den helt */
  text-align: left;
  padding-top: 5px; /* Lägg till lite padding om det blir för trångt */
  align-self: start; /* Tvingar elementet till toppen av sin cell */
  line-height: 1.4;
  font-size: 16px;
}


.report-date { 
  grid-area: date; 
  align-self: start; /* Tvingar upp datumet till toppen av kortet */
  justify-self: end; /*trycker ut datumet till höger*/
  margin: 0;
}

.report-image {
 grid-area: image;
  max-width: 200px;
  max-height: 150px;
}

.report-footer {
  grid-area: footer;
  border-top: 1px solid black;
  display: flex; /* så de hamnar brevid varandra och inte under*/
  justify-content: space-between; /*de hamnar på varsin sida*/


}

.report-location {
  text-align: left;
  align-self: center;
  font-size: 11px;
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



</style>