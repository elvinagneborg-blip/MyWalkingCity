<template>
    <div ref="mapContainer" class="map-container"> </div> <!--ref för JS, class för CSS-->
</template>

<script setup>
import { onMounted, ref, watch } from "vue" /* onMounted kör kod när komponenten har laddats, ref används för referens */
import L from "leaflet" /* importerar leaflet - biblioteket */
import "leaflet/dist/leaflet.css"

const props = defineProps(['allReports', 'showReportId'])

const markersMap = {} //alla markörer sparas med deras id

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

  for (const key in markersMap) delete markersMap[key] //tömmer våra markersmap

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

const icon = report.type === 'problem' ? '⚠️' : '👍'
      const bgClass = report.type === 'problem' ? 'popup-red-bg' : 'popup-green-bg'
      const formattedDate = new Date(report.created_at).toLocaleDateString()
      const addressText = report.address || 'Okänd adress'
      
      // Kontrollera om det finns en bild, annars lämnar vi tomt eller sätter en klass
      const imageHtml = report.image_url 
        ? `<img src="${report.image_url}" class="popup-report-image" alt="Rapportbild"/>` 
        : ''
      const cardModifierClass = report.image_url ? '' : 'popup-no-image'

      const popupContent = `
        <div class="popup-report-card ${cardModifierClass}">
          <div class="popup-category-container">
            <span class="popup-report-icon">${icon}</span>
            <p class="popup-report-category ${bgClass}">${report.category}</p>
          </div>
          
          <small class="popup-report-date">${formattedDate}</small>

          <div class="popup-report-info">
            <p class="popup-report-title">${report.title || ''}</p>
            <p class="popup-report-description">${report.description || ''}</p>
          </div>

          ${imageHtml}

          <div class="popup-report-footer">
            <p class="popup-report-location">📍 ${addressText}</p>
          </div>
        </div>
      `

      // Bind popupen med det nya utseendet och sätt en maxbredd som passar
      reportMarker.bindPopup(popupContent, {
        maxWidth: 320,
        minWidth: 280
      })

      reportMarker.addTo(allReportsLayer)

      if (report.report_id) { //spara markörens id
        markersMap[report.report_id] = reportMarker
      }
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

//när man klickat på en location från recent reports
watch(() => props.showReportId, (newId) => {
  if (newId && markersMap[newId]) {
    const markerToFocus = markersMap[newId]
    
    // 1. Hämta positionen för just denna plupp
    const latLng = markerToFocus.getLatLng()
    
    // 2. Flytta kartan och zooma in (t.ex. till nivå 16)
    map.setView(latLng, 16)
    
    // 3. Öppna popup-rutan automatiskt så att man kan läsa rapporten!
    markerToFocus.openPopup()
  }
})



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


/* Nollställ Leaflets egna inbyggda padding i popup-bubblan, deep används för att vi har scoped, om vi tar bort scoped å kan vi ta bort deep */
:deep(.leaflet-popup-content) {
  margin: 0;
  line-height: inherit;
}

:deep(.leaflet-popup-content-wrapper) {
  padding: 0;
  overflow: hidden;
  border-radius: 12px;
}

/* Själva kortet */
:deep(.popup-report-card) {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas: 
    "category    date"
    "info       image"
    "footer      footer";
  gap: 8px;
  width: 100%;
  padding: 12px;
  align-items: start;
  background-color: #c8efeb5d;
  box-sizing: border-box;
}

/* Layout om bild saknas */
:deep(.popup-report-card.popup-no-image) {
  grid-template-columns: 2fr 1fr;
  grid-template-areas: 
    "category    date"
    "info       info"
    "footer      footer";
}

:deep(.popup-category-container) {
  grid-area: category;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-self: start;
}

:deep(.popup-report-icon) {
  font-size: 0.9rem;
  line-height: 1;
}

:deep(.popup-report-category) {  
  margin: 0;
  font-size: 0.75rem;
  text-align: left;
  border-radius: 50px;
  padding: 3px 8px;
}

:deep(.popup-red-bg) {
  background-color: rgba(235, 41, 41, 0.228); 
}

:deep(.popup-green-bg) {
  background-color: rgba(15, 203, 115, 0.366); 
}

:deep(.popup-report-info) {
  grid-area: info;
  padding: 5px 0;
}

:deep(.popup-report-title) {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 4px 0;
  text-align: left;
}

:deep(.popup-report-description) { 
  margin: 0;
  text-align: left;
  line-height: 1.3;
  font-size: 12px;
  color: #333;
  max-height: 80px;         /* Sätter en maxhöjd på textrutan */
  overflow-y: auto;         /* Lägger till skroll-list om texten är för lång */
  padding-right: 4px;
}

:deep(.popup-report-date) { 
  grid-area: date; 
  align-self: start;
  justify-self: end;
  margin: 0;
  font-size: 11px;
  color: #666;
}

:deep(.popup-report-image) {
  grid-area: image;
  max-width: 80px; 
  max-height: 80px;
  object-fit: contain;
  align-self: center;
  justify-self: end;
  border-radius: 4px;
}

:deep(.popup-report-footer) {
  grid-area: footer;
  border-top: 1px dashed #5e716f5d;
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 6px;
}

:deep(.popup-report-location) {
  text-align: left;
  font-size: 11px;
  margin: 0;
}
</style>    