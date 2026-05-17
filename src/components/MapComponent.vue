<template>
    <div ref="mapContainer" class="map-container"> </div> <!--ref för JS, class för CSS-->
</template>

<script setup>
import { onMounted, ref, watch } from "vue" /* onMounted kör kod när komponenten har laddats, ref används för referens */
import L from "leaflet" /* importerar leaflet - biblioteket */
import "leaflet/dist/leaflet.css"

const props = defineProps(['allReports'])

const mapContainer = ref(null); /* div elementet --> är null i början för att kunna kopplas till HTML elementet  */
const emit = defineEmits(['location-changed']);
let map = null; /* variabel för själva kartan */
let marker = null; /* variabel för markören */
let allReportsLayer = null;

//Allreports layer
const renderAllReportsMarkers = () => {
  if (!map || !allReportsLayer || !props.allReports) {
    console.log("Avbröt ritning: Något saknas (map, layer eller props)");
    return;
  } //Säkerhetskontroll, om inget finns, gör ingenting (viktigt för andra views som använder denna component)
  allReportsLayer.clearLayers() //rensa lagret så det inte blir diubletter

  props.allReports.forEach(report => {
    if (report.latitude && report.longitude) {
      const isHighlight = report.type === 'highlight'
      const markerColor = isHighlight ? '#2ecc71' : '#e74c3c'

      const reportMarker = L.circleMarker([report.latitude, report.longitude], {
        radius: 7,
        fillColor: markerColor,
        color: '#ffffff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.9
      })

      if (report.title) {
        reportMarker.bindPopup(`<strong>${report.title}</strong>`)
      }

      reportMarker.addTo(allReportsLayer)
    }
  })
}

watch(() => props.allReports, () => {
  renderAllReportsMarkers()
}, {deep: true}) //lyssnar på rapporterna från databasen

//

const setLocation = (lat, lng) => {
  const newPos =  [lat, lng]
  map.setView(newPos, 16)
  marker.setLatLng(newPos)
  emit('location-changed', { lat, lng })
}

defineExpose({ setLocation })


onMounted(() => {
  map = L.map(mapContainer.value).setView([59.8586, 17.6389], 13) /* skapar kartan och sätter startpositionen till centrala Uppsala, tar bort zoomkontrollerna */
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  allReportsLayer = L.layerGroup().addTo(map) //Aktiverar lagret på kartan

  marker = L.marker([59.8586, 17.6389], { draggable: true }).addTo(map)

  marker.on('dragend', (e) => {
    const { lat, lng } = e.target.getLatLng();
    setLocation(lat, lng)
  })

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    setLocation(lat, lng)
  })

  renderAllReportsMarkers()
})


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