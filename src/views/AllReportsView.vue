<template>
    <main class="allreports-page">
        <WebbHeader />
  
      <!--Header specifik för sidan -->
    <section class="allreports-header">
        <h2 class="allreports-title"> All reports </h2>
    </section>

    <!-- Sektion för kart-området -->
    <section class="allreports-map-section">
        <div class="allreports-map-container">
            <!-- Test bild för kartan för uppdattning -->
            <img src="/img/test-map.png" class="allreports-map-image" />

            <!--Recent reports knapp -->            
            <button 
                v-if="!showRecentReports"
                class="allreports-recent-report-button"
                @click="showRecentReports = true">
                Recent reports
            </button>

            <!-- Panel med recent reports -->
            <aside
                v-if="showRecentReports"
                class="allreports-recent-report-panel">

                <div class="allreports-recent-report-header">
                    <h3 class="allreports-recent-report-title"> Recent report </h3>
                    <button
                        class="allreports-close-recent-report-panel"
                        @click="showRecentReports = false"
                        aria-label="Close recent report">
                        x
                    </button>
                </div>

                <div class="allreports-recent-report-list">
                    <article class="allreports-recent-report-item">
                        <dl class="allreports-recent-report-text">
                            <dt>Location: </dt>
                            <dd>Polacksbacken 7</dd>

                            <dt>Time of report: </dt>
                            <dd>14 April 08:52</dd>

                            <dt>Description: </dt>
                            <dd>There's a pothole in the road</dd>
                        </dl>
                    </article>
                 </div>
            </aside>
        </div>
    </section>
    </main>
</template>

<!--Basic js -->
<script setup>
import { ref } from "vue"
import WebbHeader from '@/components/WebbHeader.vue'

const showRecentReports = ref(false)

</script>

<!--Basic CSS-->
<style scoped>
    * { box-sizing: border-box;
    }

/* ===== allreports sidan - standard ===== */
.allreports-page {
    background-color: #f5f5f5;
    min-height: 100vh;
    font-family: Arial, sans-serif;
    color: #111;
    padding-bottom: 32px;
}

/* ===== Sidans enga rubrik ===== */
.allreports-header {
    width: min(92%, 900px);
    margin: 0 auto;
    padding: 16px 0;
}

.allreports-title {
    margin: 0; 
}

/* ===== Kart - området ===== */
.allreports-map-section {
    width: 100%;
}

.allreports-map-container {
    position: relative;
    width: 100%;
    height: 75vh; 
    overflow: hidden; /*klippa allt utanför boxen*/
}

.allreports-map-image {
    display: block; /*fyller containen med bilden*/
    width: 100%;
    height: 100%;
    object-fit: cover;/*ser till så att bilden ställer in sig rätt till containern*/
    border-radius: 12px;
}

/* ===== Recent report knapp =====*/
.allreports-recent-report-button {
    position: absolute;
    right: 20px;
    bottom: 20px;
    background-color: #20c7b5;
    color: black;
    border: none;
    border-radius: 999px;
    padding: 14px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer; /*när man hovrar blir de en hand */
}

/* ===== Recent report panel =====*/
.allreports-recent-report-panel {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #eeeeee;
    border-radius: 24px 24px 0 0;
    padding: 20px 20px 28px;
    z-index: 10; /* för att den ska ligga ovanpå kartan, så länge de har största z - index värdet */
}

.allreports-recent-report-header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 24px;
}

.allreports-recent-report-title {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    text-align: center;
}

.allreports-close-recent-report-panel {
    position: absolute;
    right: 0;
    top: 0;
    background: none;
    border: none;
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
}

/* ===== Recent report listan  =====*/

.allreports-recent-report-list {
    display: flex;
    flex-direction: column;
    gap: 28px;
}

.allreports-recent-report-item {
    display: flex;
    align-items: flex-start;
    gap: 24px;
    padding-bottom: 24px;
    border-bottom: 2px solid #d9d9d9;
}

.allreports-recent-report-item:last-child { /*space för nästa report*/
    border-bottom: none;
    padding-bottom: 0;
}

/* ===== Recent report texten i listan =====*/

.allreports-recent-report-text {
    margin: 0;
}

.allreports-recent-report-text dt {
    font-weight: 700;
    display: inline;
}

.allreports-recent-report-text dd {
    display: inline;
    margin: 0 0 10px 6px;
}

.allreports-recent-report-text dd::after { /*för att lägga in en osynlig radbrytning efter varje dd*/
    content: "";
    display: block; /*tvingar på en ny rad*/
}

</style>
