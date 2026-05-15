<template>
    <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p>Laddar My Walking City...</p>
  </div>
<main v-else>
<section class="profile-page"> 
  
    <!--Header specifik för sidan -->
    <section class="profile-header">
        <h2 class="profile-title"> {{ uiLabels.levelUp }} </h2>
            <p class="profile-subtitle">
                {{ uiLabels.profileLevelDescription }}
            </p>
    </section>

    <!--Personal developement information -->
    <section class="personal-dev-container">
        <div class="personal-dev-text">
            <h2 class="profile-username"> {{ profile?.username || props.session.user.email }} </h2>

            <dl class="personal-dev-info">
                <div class="personal-dev-row"> 
                    <dt class="personal-dev-label"> {{uiLabels.memberSince}} </dt>
                    <dd class="personal-dev-value"> {{ props.session?.user.created_at ? new Date(props.session.user.created_at).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Laddar...' }}  </dd> <!--behålla frågetecknena?-->
                </div>

                <div class="personal-dev-row">
                    <dt class="personal-dev-label"> {{uiLabels.reports}} </dt>
                    <dd class="personal-dev-value"> {{ userReports.filter(r => r.type === 'problem').length }} </dd>
                </div>

                <div class="personal-dev-row">
                    <dt class="personal-dev-label"> {{uiLabels.highlights}} </dt>
                    <dd class="personal-dev-value"> {{ userReports.filter(r => r.type === 'highlight').length }} </dd>
                </div>

                <div class="personal-dev-row">
                    <dt class="personal-dev-label">Poäng</dt>
                    <dd class="personal-dev-value"> {{ profile?.total_points ?? 0 }} </dd>
                </div>

            </dl>
        </div>

    <!-- Avatar (lägg till när vi har koll på vad vi gör med datastorage / val av avatar)-->
        <div class="avatar-wrapper">
            <img
                v-if="profile?.avatar_url"
                class="avatar-image"
                :src="profile.avatar_url"
                alt="Profile avatar"
            />
        </div>
    </section>

    <!-- Level section -->
    <section class="levels-section">
        <div class="current-level">
            <div class="current-level-top">
                <div class="current-level-avatar"></div>
                <div class="current-level-text">
                    <h2> Level {{ currentLevel }}</h2>
                        <p>{{ currentTitle }}</p>
                </div>
            </div>

<!-- Progress bar som går fram med poäng -->
            <div class="progress-area">
                <div class="progress-bar">
                    <div 
                        class="progress-fill"
                        :style="{ width: progressToNextLevel + '%' }">
                    </div>
                </div>

                <div class="progress-labels">
                    <span>Level {{ currentLevel }}</span>
                    <span>Level {{ nextLevel }}</span>
                </div>
            </div>

<!-- Statistiken som står under leveln -->
            <div class="stats-row">
                <div class="mini-stat">
                    <span class="stat-number">{{ userReports.filter(r => r.type === 'problem').length }}</span>
                    <span class="stat-label">{{uiLabels.reports}}</span>
                </div>
            
                <div class="mini-stat">
                    <span class="stat-number">0</span>
                    <span class="stat-label">{{uiLabels.done}}</span>
                </div>

                <div class="mini-stat">
                    <span class="stat-number">{{ userReports.filter(r => r.type === 'highlight').length }}</span>
                    <span class="stat-label">{{uiLabels.highlights}}</span>
                </div>
            </div>
        </div>

<!-- Kommande level -->
        <div class="next-level-locked">
            <div class="locked-icon">🔒</div>
                <h2>Level {{ nextLevel }}</h2>
                    <p>{{ nextLevelTitle }}</p>

            <div class="progress-area">
                <div class="progress-bar empty"></div>
                    <div class="progress-labels">
                        <span>{{ nextLevel }}</span>
                        <span>{{ levelAfterNext }}</span>
                    </div>
             </div>
        </div>
    </section>


    <!--My reports-->
    <section class="my-reports-section">
        <h2 class="reports-title"> {{ uiLabels.myReports }} </h2>

        <div class="reports-filter-box">
            <button class="filter-button" :class="{ active: currentFilter === 'all' }" @click="currentFilter = 'all'"> 
            {{ uiLabels.all }} </button>
        
            <button class="filter-button" :class="{ active: currentFilter === 'problem' }" @click="currentFilter = 'problem'"> 
            {{ uiLabels.problems }} </button>
        
            <button class="filter-button" :class="{ active: currentFilter === 'highlight' }" @click="currentFilter = 'highlight'"> 
            {{ uiLabels.highlights }}  </button>
        </div>


        <div class="reports-list">
            <p v-if="userReports.length === 0">
                Du har inte skickat in några rapporter än
            </p>

            <article v-else v-for="report in filteredReports" :key="report.id" class="report-container"> <!--beroende på "filter" så loopar den igenom en specifik lista av rapporter-->
                <div class="report-header">
                    <span class="report-tag"> {{ report.category }} </span>
                    <small>{{ new Date(report.created_at).toLocaleDateString() }}</small>
                </div>

                <h3 class="report-text"> {{ report.description }} </h3>
               
                <img class="reports-image" 
                    v-if="report.image_url" 
                    :src="report.image_url" 
                    alt="Rapportbild"
                />
            </article>
        </div>
    </section>

<!-- Contact information -->
    <section class="contact-section">
        <h2 class="contact-title"> {{ uiLabels.contactInfo }} </h2>

        <div class="contact-container">
            <dl class="contact-list">
                <div class="contact-row" >
                    <dt class="contact-label">Name</dt>
                    <dd class="contact-value"> ?? </dd>
                </div>

                <div class="contact-row" >
                    <dt class="contact-label">Email</dt>
                    <dd class="contact-value"> {{ props.session.user.email }} </dd>
                </div>

                <div class="contact-row" >
                    <dt class="contact-label">Phone</dt>
                    <dd class="contact-value"> ?? </dd>
                </div>  

                <div class="contact-row" >
                    <dt class="contact-label">City</dt>
                    <dd class="contact-value"> ?? </dd>
                </div>
            </dl>
        </div>
    </section>
</section>
</main>
</template>

<script setup>
  //Imports
    import { ref, onMounted, watch, computed } from 'vue' //för att kunna ha reaktiva variabler och övervaka dem
    import io from 'socket.io-client'                     //kontakt med server
    import { supabase } from '@/utils/supabase' 

  //Setup and Props (Input)
    const props = defineProps(['backendURL', 'currentLang', 'session']) //ta emot språkval från app.vue
    const socket = io(props.backendURL)
  
  //UI and language
    const uiLabels = ref({})

    socket.on("uiLabels", (labels) => {
        uiLabels.value = labels
    })

    watch(() => props.currentLang, (newLang) => { //vakta språket
    socket.emit("getUILabels", newLang || "en");
  }, { immediate: true });                      //Språket laddas direkt när sidan laddas
  
  //Profile
    const profile = ref(null) //datan från profile tabellen 
    
    const fetchProfile = async () => {
        if (!props.session) return //kollar att användaren är inloggad

        const { data, error } = await supabase
            .from('profiles') //hämta från profil tabellen
            .select('username, avatar_url, total_points')
            .eq('user_id', props.session.user.id) //hämtar från den raden
            .single() //vill ha exakt en rad och inte en array 

       if (error) {
        console.log('Kunde inte hämta profil:', error.message)
    return
    }

    profile.value = data
    }

    //Level system 
    const points = computed(() => profile.value?.total_points ?? 0)

    //Namnger lite levlar här
    const levelTitles = {
        1: 'Resident',
        2: 'Super Resident',
        3: 'Legendary Resident',
        4: 'City Hero',
    }

    const currentLevel = computed(() => {
        if (points.value >= 25) return 3; //vi kör detta som max i prototypen
        if (points.value >= 10) return 2;
        return 1; //startar alltid på level 1
    })

    //bara för att ta ut namnet ur levelTitles
    const currentTitle = computed(() => {
        return levelTitles[currentLevel.value]
    })

    //nästa level också
    const nextLevelTitle = computed(() => {
        return levelTitles[currentLevel.value + 1]
    })

    const nextLevel = computed(() => {
        return currentLevel.value + 1
    })

    const levelAfterNext = computed(() => {
        return nextLevel.value + 1
    })

    const progressToNextLevel = computed(() => {
        if (currentLevel.value === 1) {
            //10 poäng för level 2
            return (points.value / 10) * 100;
        } else if (currentLevel.value === 2) {
            //jag tänker 15 för level 3 så vi tar bort de för första leveln
            const pointsInCurrentLevel = points.value - 10;
            return ((points.value - 10) / 15) * 100; //10-25 poäng för level 2
        }
    })

  //User reports
    const userReports = ref([])
    const currentFilter = ref('all') // Standardvärde är att visa alla

    const fetchUserReports = async () => {
        if (!props.session) return //KOllar om man är inoggad
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('user_id', props.session.user.id) //hämta mina rapporter
                .order('created_at', {ascending: false});
        if (!error) {
        userReports.value = data
        }
  }

  const filteredReports = computed(() => {
    // Om filtret är 'all', skicka tillbaka hela listan
    if (currentFilter.value === 'all') {
     return userReports.value
    }
    // Annars, filtrera fram de som matchar (notera små bokstäver 'problem'/'highlight')
    return userReports.value.filter(report => report.type === currentFilter.value)
    })

  //Lifecycle hooks
  onMounted(() => {
    fetchProfile() //Tillagd för att ladda in det som står under profile tabellen 
    fetchUserReports()
  })

</script>

<!-- CSS basic -->

<style scoped>
* { box-sizing: border-box;
}

/* ===== Profile page ===== */
.profile-page {
    background-color: #f5f5f5;
    min-height: 100vh;
    font-family: Arial, sans-serif;
    color: #111;
    padding-bottom: 32px;
}

/* ===== Allmän sektion bredd ===== */
.personal-dev-container,
.levels-section,
.my-reports-section,
.contact-section {
    width: min(92%, 700px);
    margin-left: auto;
    margin-right: auto;
}
 /* ===== Profile header ===== */
.profile-header {
    text-align: center;
    padding: 32px 20px 24px;
}

.profile-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin: 0 0 12px;
    font-weight: 700;
}

.profile-subtitle {
    margin: 0 auto;
    max-width: 500px;
    font-size: clamp(1rem, 2.5vw, 1.1rem);
    line-height: 1.4;
}
/* ===== Personal info container ===== */
.personal-dev-container {
    background-color: #cfe3de;
    margin-top: 0;
    margin-bottom: 24px;
    padding: clamp(18px, 4vw, 28px);
    border-radius: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: clamp(14px, 3vw, 32px);
}

.profile-username {
    margin: 0 0 16px 0;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    font-weight: 700;
}

.personal-dev-info {
    margin: 0;
}

.personal-dev-row {
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
    gap: 8px;
    margin: 16px 0;
}

.personal-dev-label {
    font-weight: 700;
    font-size: clamp(1rem, 2.5vw, 1.1rem);
    color: #111;
    margin: 0;
}

.personal-dev-value {
    font-size: clamp(1rem, 2.5vw, 1.1rem);
    color: #111;
    margin: 0;
}

.avatar-wrapper {
    width: clamp(110px, 22vw, 160px);
    height: clamp(110px, 22vw, 160px);
    border-radius: 50%;
    background-color: #8bb8d9;
    flex-shrink: 0; /* nu inställd så att avataren inte krymper vid brist på utrymme*/
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 50%;
}

/* ===== Levels section ===== */
.levels-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-top: 0;
    margin-bottom: 0;
}

/* ===== Current level + next level containers ===== */
.current-level,
.next-level-locked {
    background-color: #d9d9d9;
    border-radius: 24px;
    padding: clamp(18px, 4vw, 28px);
    position: relative;
}

.current-level-top {
    display: flex;
    align-items: center;
    gap: clamp(12px, 3vw, 20px);
    margin-bottom: 24px;
}

.current-level-avatar {
    width: clamp(60px, 16vw, 90px);
    height: clamp(60px, 16vw, 90px);
    border-radius: 50%;
    background-color: #8bb8d9;
    flex-shrink: 0;
}

.current-level-text {
    min-width: 0;
}

.current-level h2,
.next-level-locked h2 {
    margin: 0 0 8px;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
}

.current-level p,
.next-level-locked p {
    margin: 0 0 20px;
    font-size: clamp(1rem, 2.8vw, 1.2rem);
}

/* ===== Progress ===== */
.progress-area {
    margin-bottom: 24px;
}

.progress-bar {
    width: 100%;
    height: clamp(12px, 2vw, 16px);
    background-color: white;
    border-radius: 999px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: #63a89b;
    border-radius: 999px;
}

.progress-bar.empty {
    background-color: #ececec;
}

.progress-labels {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: clamp(0.9rem, 2vw, 0.95rem);
    font-weight: 600;
}

/* ===== Stats row ===== */
.stats-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
}

.mini-stat {
    background-color: #5aa596;
    color: white;
    border-radius: 14px;
    padding: clamp(10px, 2vw, 16px) clamp(8px, 2vw, 12px);
    flex: 1; /*ta upp lika mycket plats som de andra*/
    text-align: center;
    min-width: 0;
}

.stat-number {
    display: block;
    font-size: clamp(1.2rem, 3vw, 1.5rem);
    font-weight: bold;
    margin-bottom: 4px;
}

.stat-label {
    display: block;
    font-size: clamp(0.9rem, 2vw, 1rem);
    line-height: 1.2;
}


/* ===== Locked level ===== */
.next-level-locked {
    overflow: hidden;
}

.next-level-locked::after { /* lägger till element efter innehållet (inte html)*/ 
    content: "";
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.25);
    z-index: 1; /*skugga ovanför innehållet för att markera att den ännu inte är påslagen*/
}

.locked-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    color: #333;
    z-index: 2; /* ser till så att emojin för låser ligger överst på lagret och inte döljs av skuggning */
}


/* ===== My reports ===== */
.my-reports-section {
    margin-top: 40px;
}

.reports-title {
    text-align: center;
    color: #20b89f;
    font-size: clamp(1.8rem, 4vw, 2.2rem);  
    font-weight: 700;
    margin: 0 0 24px;
    position: relative;
}

.reports-title::after {
    content: "";
    display: block;
    width: min(180px, 45%);
    height: 2px;
    background-color: #20b89f;
    margin: 10px auto 0;
}

/* ===== Reports filter ===== */
.reports-filter-box {
    background-color: white;
    border-radius: 999px;
    padding: 10px 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    margin-bottom: 32px;
}

.filter-button {
    background: none;
    border: none;
    font-size: clamp(0.95rem, 2.5vw, 1.1rem);
    color: #111;
    padding: 10px 24px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
}

.filter-button:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 20%;
    height: 60%;
    width: 1px;
    background-color: #b8ddd7;
}

.filter-button.active {
    font-weight: 500;
}

/* ===== Reports list ===== */
.reports-list {
    display: flex;
    flex-direction: column;
    gap: 22px;
}

.report-container {
    background-color: #cfe3de;
    border-radius: 24px;
    padding: clamp(18px, 4vw, 28px);
}

.report-tag {
    display: inline-block;
    background-color: #58a89b;
    color: white;
    font-size: clamp(0.9rem, 2vw, 1rem);
    padding: 8px 24px;
    border-radius: 999px;
    margin-bottom: 24px;
    min-width: 110px;
    text-align: center;
}

.report-text {
    margin: 0;
    font-size: clamp(1.4rem, 4vw, 2.1rem);
    line-height: 1.1;
    font-weight: 500;
    color: #0d7868;
}

.report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.reports-image {
    max-width: 200px;
}

/* ===== Contact information ===== */
.contact-section {
    margin-top: 48px;
    margin-bottom: 60px;
}

.contact-title {
    text-align: center;
    color: #20b89f;
    font-size: clamp(1.8rem, 4vw, 2rem);
    font-weight: 700;
    margin: 0 0 24px;
}

.contact-container {
    background-color: #cfe3de;
    border-radius: 24px;
    padding: clamp(18px, 4vw, 28px);
    min-height: 260px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 18px;
}

.contact-list{
    margin:0;
}

.contact-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.contact-row:last-child{
    border-bottom: none;
}

.contact-label {
    font-weight: 700;
    font-size: clamp(1rem, 2.5vw, 1.1rem);
    color: #111;
}

.contact-value {
    font-size: clamp(0.95rem, 2.3vw, 1.05rem);
    color: #2f2f2f;
    text-align: right;
    word-break: break-word;
}

/* ===== Telefon - evenutellt anpassa till flera olika skärmar ===== */
@media (max-width: 600px) {
    .profile-header {
        padding: 24px 16px 20px;
    }

    .personal-dev-container {
        gap: 14px;
    }

    .profile-username {
        margin-bottom: 14px;
    }

    .personal-dev-text p {
        margin: 12px 0;
    }

    .current-level-top {
        gap: 14px;
        margin-bottom: 18px;
    }

    .stats-row {
        gap: 10px;
    }

    .mini-stat {
        padding: 12px 8px;
    }

    .reports-filter-box {
        padding: 8px 10px;
    }

    .filter-button {
        padding: 10px 14px;
    }

    .report-tag {
        min-width: 90px;
        padding: 6px 18px;
        margin-bottom: 18px;
    }

    .contact-list {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .contact-value {
        text-align: left;
    }

}
</style>

