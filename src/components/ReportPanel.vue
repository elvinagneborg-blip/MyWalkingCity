<template>
  <aside class="allreports-recent-report-panel">
    
    <div class="allreports-recent-report-header">
      <h3 class="allreports-recent-report-title">{{ title }}</h3>
      
      <button
        class="allreports-close-recent-report-panel"
        @click="$emit('close')"
        aria-label="Stäng panel">
        ✖️
      </button>
    </div>

    <div class="report-list">
      
      <div v-if="reports.length === 0">
        <p>{{ emptyMessage || 'Inga rapporter hittades' }}</p>
      </div>
      <RecentReport 
        v-else
        v-for="report in reports" 
        :key="report.id" 
        :report="report"
        :session="session"
      />
      </div>
  </aside>
</template>

<script setup>
import RecentReport from './RecentReport.vue'

const props = defineProps(['title', 'reports', 'session', 'emptyMessage'])

defineEmits(['close'])

</script>

<style scoped>

/* 1. Huvudcontainern för panelen */
.allreports-recent-report-panel {
  min-width: 320px;
  height: 100%;
  background-color: #eeeeee;
  padding: 20px;
  display: flex;
  flex-direction: column; /* Lägger headern och listan under varandra */
  gap: 20px;
  z-index: 1100;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1); /* Ger en mjuk skugga på vänsterkanten */
  box-sizing: border-box; /* Ser till att padding inte gör panelen bredare än 400px */
}

/* 2. Panelens header-rad */
.allreports-recent-report-header {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between; /* Trycker ut rubriken till vänster och krysset till höger */
  align-items: center;
}

.allreports-recent-report-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

/* 3. Stängknappen (Krysset) */
.allreports-close-recent-report-panel {
  background: #20c7b5; /* Din applikations gröna tema-färg */
  color: white;
  border: none;
  border-radius: 50%; /* Gör knappen helt rund */
  width: 36px;
  height: 36px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s;
}

.allreports-close-recent-report-panel:hover {
  background: #17a68a; /* Blir lite mörkare när man hovrar muspekaren över */
}

/* 4. Själva list-containern */
.report-list {
  flex: 1; /* Tvingar listan att ta upp resten av höjden i panelen */
  overflow-y: auto; /* Aktiverar en vertikal scrollbar OM det blir för fullt */
  padding-right: 5px;
}

/* 5. Mobilanpassning (Media Query) */
@media (max-width: 768px) {
  .allreports-recent-report-panel { 
    top: 0;
    right: 0;
    width: 100%;
  }
}

</style>