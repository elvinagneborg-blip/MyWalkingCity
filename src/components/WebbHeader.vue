<template> <!-- Main ska inte finnas med i komponent då den ska importeras och det bara får finnas en main per view-->
    <header class="web-header">
        <div class="web-header-layout">
            <div class="web-header-left">
                <h1 class="web-header-title"> My Walking City</h1>
            
            <!--Koppla loggan till homepage -->    
                <RouterLink :to="{ name: 'StartMWC' }" class="web-header-logo-link">
                    <img
                        src="/img/cropped-SIC-2.png"
                        class="web-header-logo">
                </RouterLink>
            </div>

            <div class="web-header-right">
                <button @click="$emit('toggle-lang')"> <!--Säger till app.vue att knappen är tryckt-->
                        {{ currentLang === 'sv' ? 'English' : 'Svenska' }} <!--Det som står på knappen, info fås från app.vue-->
                </button>
                
                <div class="web-header-avatar" aria-label="User avatar"></div>

            
            <!--Öppna meny knappen-->
                <button 
                    class="web-header-menu-button" @click="toggleMenu" aria-label="Open menu"> 
                ☰
                </button>
            </div>

            <!-- Nedan kopplar vi ihop navkomponenten med headern-->
             <!-- Allt mellan  <ResponsiveNav> och </ResponsiveNav> hamnar i slot i navkomponenten-->
            <ResponsiveNav :hideNav="!menuOpen"> <!-- Ifall menyn ska va gömd eller ej-->
                <button class="menu-popup-close" @click="closeMenu"> x </button> <!-- kryss för att stänga menyn-->

                <div class="menu-popup-nav">
                    <RouterLink :to="{ name: 'StartMWC' }" class="menu-popup-link" @click="closeMenu">Home</RouterLink> <!-- Tar oss till homepage och stänger ner menyn-->
                    <RouterLink :to="{ name: 'ProfileView' }" class="menu-popup-link" @click="closeMenu">My profile</RouterLink>
                    <RouterLink :to="{ name: 'OptionView' }" class="menu-popup-link" @click="closeMenu">Report</RouterLink>
                    <RouterLink :to="{ name: 'AllReportsView' }" class="menu-popup-link" @click="closeMenu">All reports</RouterLink>
                    
                    <RouterLink :to="{ name: 'AllReportsView' }" class="menu-popup-link" @click="closeMenu">
                        Recent reports (kopplas nu till allreports)
                    </RouterLink>
                    <RouterLink :to="{ name: 'StartMWC' }" class="menu-popup-link" @click="closeMenu">
                        How does it work? (kopplas nu homepage)
                    </RouterLink>
                </div>
            </ResponsiveNav>
        </div>
    </header>
</template>

<script setup>
//Imports
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import ResponsiveNav from './ResponsiveNav.vue'

//Data
const menuOpen = ref(false)

//Emits (Output)
const emit = defineEmits(['toggle-lang']) //Så att knappen får skicka info till app.vue

//Props (Input)
defineProps(['currentLang']) //Så att knappen kan ta emot språket från app.vue


//Methods
const toggleMenu = () => { /* Utgår från att den är stängd, men sedan växlar den värde */
    menuOpen.value = !menuOpen.value
}
const closeMenu = () => {
    menuOpen.value = false
}
</script>


<style scoped>

.web-header{
    width: 100%;
    background-color: #27c4b5;
    border-bottom: 2px solid #000; 
    position: relative;
}

.web-header-layout {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: clamp(12px, 3vw, 24px) clamp(16px, 5vw, 40px);
}


/*== Vänstra sidan av headern =*/
.web-header-left{
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
}

.web-header-title {
    margin: 0;
    font-size: clamp(1.4rem, 5vw, 2.8rem);
    font-weight: 700;
    line-height: 1.1;
}

.web-header-logo-link{
    display: inline-block;
    width: fit-content;
}

.web-header-logo {
    display: block;
    width: clamp(90px, 22vw, 150px);
    height: auto;
}

/* === Högra sidan av headern === */

.web-header-right {
    display: flex;
    align-items: center;
    gap: clamp(10px, 3vw, 24px);
}

.web-header-avatar {
    width: clamp(44px, 12vw, 84px);
    height: clamp(44px, 12vw, 84px);
    background-color: #9ed8ff;
    border-radius: 50%;
}

/*== Meny knappen ==*/

.web-header-menu-button {
    font-size: clamp(1.6rem, 6vw, 2.6rem);
    background: none;
    border: none;
    cursor: pointer;
    line-height: 1;
    padding: 4px;
}

</style>