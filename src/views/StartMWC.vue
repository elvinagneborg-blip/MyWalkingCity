<template>
  <header>
    <div>  
      <h1>My Walking City</h1>
      <img src="/img/cropped-SIC-2.png"> 
    </div>
  </header>

  <section class="body-top">
    <h2>Shape Uppsala with a Photo</h2>
    
    <div>
      <p><button>Report</button></p>
      <p><button>How does it Work</button></p>
    </div>

    <div class="stats-container">
      <div>4000<br>Reports</div>
      <div>850<br>Active users</div>
      <div>99%<br>Solved</div>
    </div>
  </section>

  <section class="body-latest-reports">
    <h3>Live feed</h3>
    <h2>Latest reports</h2>
    <div>
      See the latest reports of citizens in Uppsala, <br>
      both improvement and positive observations 
    </div>

    <div class="report-list">
      <div 
        v-for="report in reports" 
        :key="report.id" 
        :class="['report-card', report.type === 'issue' ? 'red-bg' : 'green-bg']">
        <h4>{{ report.title }}</h4>
        <p>{{ report.address }}</p>
      </div>
    </div>
    <h5>See all reports on map</h5>
    </section>
</template>

<script setup>
import { ref } from 'vue';

//De två första är reports, de två sista är highlights.
const reports = ref([
  { id: 1, type: 'issue', title: 'Trasig gatulykta', address: 'Kungsgatan 5' },
  { id: 2, type: 'issue', title: 'Stort hål i cykelbanan', address: 'Storgatan 12' },
  { id: 3, type: 'highlight', title: 'Fin ny blommplantering', address: 'Stadsträdgården' },
  { id: 4, type: 'highlight', title: 'Bra snöröjning idag!', address: 'Svartbäcksgatan 20' }
]);
</script>

<style scoped>
.report-list {
  display: flex;
  flex-direction: column; 
  align-items: center;
  gap: 15px; 
  margin-top: 20px;
}

.report-card {
  width: 20%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 15px;
  border-radius: 8px; /* Lite mjuka hörn */
  color: rgb(42, 91, 42);
}

.report-card h4 {
  margin-bottom: 5px; /* Litet mellanrum mellan titel och adress */
}

.red-bg {
  background-color: rgba(255, 0, 0, 0.4); /* Röd bakgrund med transparens */

}

.green-bg {
  background-color: rgba(0, 255, 136, 0.4); /* Grön bakgrund med transparens */
}
</style>