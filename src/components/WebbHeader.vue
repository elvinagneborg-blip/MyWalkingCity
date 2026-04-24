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
                <div class="web-header-avatar" aria-label="User avatar"></div>
            
            <!--Öppna meny knappen-->
                <button 
                    class="web-header-menu-button"
                    @click="toggleMenu"
                    aria-label="Open menu"
                > 
                ☰
                </button>
            </div>

            <!--Stänga meny knappen -->
            <div v-if="menuOpen" class="menu-popup">
                <div class="menu-popup-top">
                    <button 
                    class="menu-popup-close"
                    @click="closeMenu"
                    aria-label="Close menu"
                    >
                    x
                </button>
                </div>
            
            <!--Navigationslänk -> byt options från knappar till navlänk när du har tid-->
                
                <nav class="menu-popup-nav">
                    <RouterLink 
                        :to="{ name: 'StartMWC' }" 
                        class="menu-popup-link">
                        Home
                    </RouterLink>

                    <RouterLink 
                        :to="{ name: 'ProfileView' }" 
                        class="menu-popup-link">
                        My profile
                    </RouterLink>

                    <RouterLink 
                        :to="{ name: 'OptionView' }" 
                        class="menu-popup-link">
                        Report
                    </RouterLink>

                    <RouterLink 
                        :to="{ name: 'AllReportsView' }" 
                        class="menu-popup-link">
                        All reports
                    </RouterLink>

                    <RouterLink 
                        :to="{ name: 'AllReportsView' }" 
                        class="menu-popup-link">
                        Recent reports (kopplas nu till allreports)
                    </RouterLink>

                    <RouterLink 
                        :to="{ name: 'StartMWC' }" 
                        class="menu-popup-link">
                        How does it work? (kopplas nu homepage)
                    </RouterLink>


                </nav>
            </div>
        </div>

    </header>

</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const menuOpen = ref(false)

function toggleMenu(){ /* Utgår från att den är stängd, men sedan växlar den värde */
    menuOpen.value = !menuOpen.value
}

function closeMenu(){
    menuOpen.value = false
}

</script>

<style scoped>

/* === Generell struktur för headern === */
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

/*== Popup meny ==*/ 
.menu-popup {
    position: absolute;
    top: calc(100% + clamp(12px, 2vw, 24px));
    left: clamp(16px, 5vw, 48px);
    right: clamp(16px, 5vw, 48px);

    background-color: #0c7f6d;
    z-index: 200;

    border-radius: 16px 16px 0 0;
    padding: clamp(56px, 10vw, 90px) clamp(16px, 4vw, 32px) clamp(24px, 5vw, 40px);

    max-height: 75vh;
    overflow-y: auto;

    display: flex;
    flex-direction: column;
}

.menu-popup-top {
    position: absolute;
    top: 16px;
    right: 20px;
}

.menu-popup-close {
    border: none;
    background: transparent;
    color: white;
    font-size: 2rem;
    cursor: pointer;
}

.menu-popup-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(22px, 5vw, 42px);
}

.menu-popup-link {
    display: flex;
    justify-content: center;
    align-items: center;

    width: min(70vw, 380px);
    min-height: clamp(58px, 10vw, 86px);

    background-color: #1da892;
    border-radius: 12px;
    border: 2px solid rgba(0,0,0,0.45);

    color: white;
    text-decoration: none;
    font-size: clamp(1.1rem, 4vw, 1.8rem);
    text-align: center;
}

/* == Telegfon ==*/
@media (max-width: 600px) {
    .menu-popup {
        left: 16px;
        right: 16px;
        padding: 70px 16px 32px;
        min-height: calc(100vh - 150px);
    }

    .menu-popup-nav {
        gap: 32px;
    }

    .menu-popup-link {
        width: 75%;
        min-height: 70px;
        font-size: 1.4rem;
        text-align: center;
    }
}

</style>