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
        @click-location="$emit('click-location', $event)"
      />
      </div>
  </aside>
</template>

<script setup>
import RecentReport from './RecentReport.vue'

const props = defineProps(['title', 'reports', 'session', 'emptyMessage'])

defineEmits(['close', 'click-location'])

</script>

<style scoped>

.allreports-recent-report-panel {
  min-width: 320px;
  height: 100%;
  background-color: #eeeeee;
  padding: 20px;
  display: flex;
  flex-direction: column; 
  gap: 20px;
  z-index: 1100;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1); 
  box-sizing: border-box; 
}


.allreports-recent-report-header {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between; 
  align-items: center;
}

.allreports-recent-report-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}


.allreports-close-recent-report-panel {
  background: #20c7b5; 
  color: white;
  border: none;
  border-radius: 50%; 
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
  background: #17a68a; 
}

.report-list {
  flex: 1; 
  overflow-y: auto; 
  overflow-x: hidden;
  padding-right: 35px;
}

.report-list :deep(.report-card) {
  height: 160px;
  min-height: 0;      
  padding: 12px 15px;  
}

.report-list :deep(.report-card.card-expanded) {
  height: auto;
  min-height: 0px;  
}

  .report-list :deep(.report-title) {
  font-size: 15px;
}

.report-list :deep(.report-description) {
  font-size: 11px;
  line-height: 1.2;
  padding-top: 2px;
  -webkit-line-clamp: 3 
}

.report-list :deep(.report-info) {
  padding: 5px 10px 5px 0px;
}

.report-list :deep(.report-category) {
  font-size: 0.7rem;
  padding: 3px 6px;
}

.report-list :deep(.report-image) {
  max-height: 65px;    
}

@media (max-width: 768px) {
  .allreports-recent-report-panel { 
    position: absolute;      
    top: 0;
    right: 0;
    width: 70%;              
    min-width: 0;
    height: 100%;       
    
    background-color: rgba(238, 238, 238, 0.95);              
    box-shadow: -4px 0 15px rgba(0, 0, 0, 0.25);
    padding-top: 12px;
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 0px;         
  }

  .allreports-recent-report-title {
    font-size: 16px;
  }

  .allreports-close-recent-report-panel {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

.report-list :deep(.report-info) {
  padding: 10px 10px 5px 5px;
}

.report-list :deep(.report-title) {
  font-size: 0.8rem;
}

.report-list :deep(.report-category) {
  font-size: 0.5rem;
}

.report-list :deep(.report-description) {
  -webkit-line-clamp: 1
}

}
</style>