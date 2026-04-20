<template>
    <!--ALLMÄN HEADER FÖR ALLA SIDOR -->
  <main class="report-page">
    <header class ="webb-header">
        <div class="top-bar">
            <h1> Turquoise My Walking City Bar </h1>
        </div>
    </header>

    <!--HEADER FÖR SIDAN -->
    <section class="page-header">
        <h2> Report a problem </h2>
        <p> Current location </p>
    </section>

    <!-- KARTAN -->
     <section class="map-section">
        <div class="map-box">
            <div class="map-placeholder">
                MAP INSERTED HERE
            </div>

        <aside class="recent-report">
            <h3> Recent reports </h3>
                <ul>
                    <li> Pothole </li>
                    <li> Broken Bench </li>
                    <li> Ramp missing </li>
                </ul>
            </aside>
        </div>
     </section>


  </main>
</template>
  
<style>
.report-page {
  margin: 0;
  font-family: Arial, sans-serif;
}

/* HEADER */
.webb-header {
  background-color: #2bb3a3; /* turkos */
  padding: 16px;
  color: white;
}

.top-bar h1 {
  margin: 0;
  font-size: 20px;
}

/* PAGE HEADER */
.page-header {
  padding: 16px;
}

.page-header h2 {
  margin-bottom: 8px;
}

/* MAP SECTION */
.map-section {
  padding: 16px;
}

/* Rutan runt kartan */
.map-box {
  border: 2px dashed #aaa;
  border-radius: 12px;
  padding: 16px;
}

/* Själva "kartan" */
.map-placeholder {
  height: 400px;
  background-color: #f0f0f0;
  border-radius: 8px;

  display: flex;
  justify-content: center;
  align-items: center;

  color: #666;
  font-size: 18px;
}
</style>