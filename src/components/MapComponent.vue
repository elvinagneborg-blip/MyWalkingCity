<template>
    <div ref="mapContainer" class="map-container"> </div> <!--ref för JS, class för CSS-->
</template>

<script setup>
import { onMounted, ref } from "vue"; /* onMounted kör kod när komponenten har laddats, ref används för referens */
import L from "leaflet"; /* importerar leaflet - biblioteket */
import "leaflet/dist/leaflet.css";

    const mapContainer = ref(null); /* div elementet --> är null i början för att kunna kopplas till HTML elementet  */

    onMounted(() => {
        const map = L.map(mapContainer.value);
        map.setView([59.863, 17.638], 13); /* Själva kartan med startposition i uppsala och zoom*/

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { /* Själva kartbilden */
            maxZoom: 20, /* maximala zoom nivån när man zoomar in */
            attribution: "&copy; OpenStreetMap contributors", /* krävs för källhänvisning till openStreetMap */
        }).addTo(map);
    });
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



