<template>
    <div ref="mapContainer" class="map-container"> </div> <!--ref för JS, class för CSS-->
</template>

<script setup>
import { onMounted, ref } from "vue"; /* onMounted kör kod när komponenten har laddats, ref används för referens */
import L from "leaflet"; /* importerar leaflet - biblioteket */
import "leaflet/dist/leaflet.css";

    const mapContainer = ref(null); /* div elementet --> är null i början för att kunna kopplas till HTML elementet  */
    const emit = defineEmits(['location-changed']);
    let map = null; /* variabel för själva kartan */
    let marker = null; /* variabel för markören */

    onMounted(() => {
  map = L.map(mapContainer.value).setView([59.8586, 17.6389], 13)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  // Skapa markören
  marker = L.marker([59.8586, 17.6389], { draggable: true }).addTo(map)

  // Varje gång markören flyttas, berätta det för föräldern
  marker.on('dragend', (e) => {
    const { lat, lng } = e.target.getLatLng();
    
  emit('location-changed', { lat, lng });
  })
})

const setLocation = (lat, lng) => {
  const newPos =  [lat, lng]
  map.setView(newPos, 16)
  marker.setLatLng(newPos)
  emit('location-changed', { lat, lng })
}

defineExpose({ setLocation })
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 75vh; /* Leaflet kräver height */
  border-radius: 24px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .map-container {
    height: 70vh;
    min-height: 420px;
    border-radius: 0;
  }
}  
</style>    



