<template>
  <div v-if="isModalOpen" class="modal-overlay" @click.self="closeBoostModal">
    <div class="modal-card">
      <button type="button" class="close-btn" @click="closeBoostModal">✕</button>
      
      <div class="modal-header">
        <span class="modal-icon">{{ targetReportType === 'problem' ? '🚨' : '🌟' }}</span>
        <h3>{{ targetReportType === 'problem' ? uiLabels.boostTitleProblem : uiLabels.boostTitleHighlight }}</h3>
        <p>{{ targetReportType === 'problem' ? uiLabels.boostDescriptionProblem : uiLabels.boostDescriptionHighlight }}</p>
      </div>

      <form @submit.prevent="submitBoost">
        <div class="form-field">
          <input 
            type="email" 
            v-model="boostEmail" 
            :placeholder="uiLabels.emailPlaceholder"
            class="modal-input"
            required
          />
        </div>

        <button type="submit" class="modal-submit-btn" :disabled="isBoosting">
          {{ isBoosting ? 'Boostar...' : 'Bekräfta Boost! 🎉' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue' 
import io from 'socket.io-client' 
import { useBoost } from '@/composables/useBoost'

const props = defineProps(['backendURL', 'currentLang'])
const socket = io(props.backendURL)
const uiLabels = ref({}) 

socket.on("uiLabels", (labels) => {
  uiLabels.value = labels
}) 

watch(() => props.currentLang, (newLang) => {
  socket.emit("getUILabels", newLang || "en")
}, { immediate: true }) 

const { 
    isModalOpen, 
    boostEmail, 
    isBoosting, 
    closeBoostModal, 
    submitBoost,
    targetReportType
} = useBoost()

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5); /* Mörkar ner resten av hemsidan */
  backdrop-filter: blur(5px);    /* Snygg suddig effekt i bakgrunden */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999; /* Säkerställ att den ligger över absolut allt */
}

.modal-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  position: relative;
  text-align: center;
  /* En skön studsande pop-in animation */
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 15px;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 10px;
  color: #1a202c;
}

.modal-header p {
  color: #718096;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 25px;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #a0aec0;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #4a5568;
}

.form-field {
  margin-bottom: 20px;
}

.modal-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #edf2f7;
  border-radius: 12px;
  background-color: #f8fafc;
  font-size: 1rem;
}

.modal-input:focus {
  outline: none;
  border-color: #1ebc9c;
  background-color: white;
}

.modal-submit-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background-color: #1ebc9c;
  color: white;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-submit-btn:hover {
  background-color: #17a68a;
  transform: translateY(-1px);
}

.modal-submit-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>