<template> <!-- Main ska inte finnas med i komponent då den ska importeras och det bara får finnas en main per view-->
     <header class="web-header">

        <div class="web-header-layout">

            <!--Left side of header: title + logo-->
            <RouterLink :to="{ name: 'StartMWC' }" class="web-header-left">
                <h1 class="web-header-title"> My Walking City </h1>
                <img
                src="/img/cropped-SIC-2.png"
                class="web-header-logo" >
            </RouterLink>

            <!--Right side of header: menu, headerbutton, avatar -->
             <div class="web-header-right">

             <!--Utloggad layout-->
                <div v-if="!session" class="header-logged-out">
                    <div class="header-auth-buttons">

                        <!--Log in / skapa konto knapp -->
                        <button class="header-button" @click="router.push('/login')">
                            {{ uiLabels.logInHeader }}
                        </button>

                        <button class="header-button" @click="router.push('/signup')">
                            {{ uiLabels.signUpHeader }}
                        </button>
                    </div>

                    <!--Språkknapp-->
                    <div class="header-tools">
                        <button class="header-button" @click="$emit('toggle-lang')">
                            {{ currentLang === 'sv' ? '🇸🇪 SVE' : '🇬🇧 EN' }}
                        </button>

                    <!-- Meny knapp -->
                     <button
                        class="web-header-menu-button"
                        :class="{ 'menu-button-active': menuOpen }"
                        @click="toggleMenu"
                        aria-label="Open menu"
                        >
                        ☰
                    </button>
                </div>
            </div>

            <!-- Inloggad layout -->
            <div v-else class="header-logged-in">
          
                <!--Logga ut knapp -->
                <button class="header-button" @click="handleLogout">
                    {{ uiLabels.logOutHeader }}
                </button>

                <!--Avatar-->
                <RouterLink v-if="avatarUrl" :to="{ name: 'ProfileView' }" class="header-avatar-container">
                    <img
                        :src="avatarUrl"
                        class="web-header-avatar"
                        alt="User avatar"
                    >
                    <span v-if="currentLevel === 2" class="header-hat">🎩</span>
                    <span v-if="currentLevel === 3" class="header-hat crown">👑</span>
                </RouterLink>

                <!-- Meny knapp och språkknapp-->
                <div class="header-tools">
                    <button class="header-button" @click="$emit('toggle-lang')">
                        {{ currentLang === 'sv' ? '🇸🇪 SVE' : '🇬🇧 EN' }}
                    </button>

                    <button
                    class="web-header-menu-button"
                    :class="{ 'menu-button-active': menuOpen }"
                    @click="toggleMenu"
                    aria-label="Open menu"
                    > ☰
                    </button>
                </div>
            </div>
        </div>
    
        <!--Bakgrund bakom menyn -->
        <div
            v-if="menuOpen"
            class="menu-backdrop"
            @click="closeMenu"
        ></div>

        <!--Pop up menyn-->
        <ResponsiveNav :hideNav="!menuOpen"> <!-- Ifall menyn ska va gömd eller ej-->
            <button class="menu-popup-close" @click="closeMenu"> x </button> <!-- kryss för att stänga menyn-->
            
            <!--Länkarna inne i popup menyn-->
            <div class="menu-popup-nav">
                <!--Startsida (samma för båda)-->
                <RouterLink :to="{ name: 'StartMWC' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.routeHome}}</RouterLink> <!-- Tar oss till homepage och stänger ner menyn-->
                    
                <!--If user is not logged in: visa profil -->
                <template v-if="session">
                    <RouterLink :to="{ name: 'ProfileView' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.routeProfile}}</RouterLink>
                </template>

                <!--If user is not logged in: visa logga in / sign up -->
                <template v-else> 
                    <RouterLink :to="{ name: 'LogIn' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.logInHeader}}</RouterLink>
                    <RouterLink :to="{ name: 'SignUp' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.signUpHeader}}</RouterLink>
                </template>

                    <RouterLink :to="{ name: 'OptionView' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.routeReport}}</RouterLink>
                    <RouterLink :to="{ name: 'AllReportsView' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.routeAllReport}}</RouterLink>
                
                <!--Övriga länkar/ knappar -->    
                <RouterLink :to="{ name: 'StartMWC', hash: '#howItWorks-section' }" class="menu-popup-link" @click="closeMenu">
                    {{uiLabels.routeHowTo}}
                </RouterLink>
                </div>
            </ResponsiveNav>
        </div>
    </header>
</template>


<script setup>  

//Imports 
import { ref, watch, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import io from 'socket.io-client'
import ResponsiveNav from './ResponsiveNav.vue'
import { supabase } from '@/utils/supabase'

//Propos and emitts 
const props = defineProps([
  'session',
  'currentLang',
  'backendURL'
])

defineEmits(['toggle-lang'])

//Setup
const router = useRouter()
const socket = io(props.backendURL)

//Ui language
const uiLabels = ref({})
socket.on('uiLabels', (labels) => {
  uiLabels.value = labels
})

watch(
  () => props.currentLang,
  (newLang) => {
    socket.emit('getUILabels', newLang || 'en')
  },
  { immediate: true }
)

//Menu
const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

//Ser till så att man inte kan scrolla i bakgrunden när menyn är utfälld
watch(menuOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

//Avatar
const avatarUrl = ref(null) //sparar URL till profilbild
const totalPoints = ref(0)

    //Hämta avataren och poäng
const getAvatar = async () => {
    avatarUrl.value = null
    totalPoints.value = 0

    if (!props.session?.user?.id) return
    
    const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, total_points')
        .eq('user_id', props.session.user.id)
        .single()

    if (error) {
        console.log('Kunde inte hämta avatar:', error.message)
    return
    }
    
    avatarUrl.value = data?.avatar_url || null
    totalPoints.value = data?.total_points || 0

    }

        //Om användaren är inloggad --> hämta avatar
    watch(
        () => props.session,
            () => {
            getAvatar()
            },
        { immediate: true }
        )

//Authentication
const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
}

const currentLevel = computed(() => {
  const pts = totalPoints.value
  if (pts >= 25) return 3
  if (pts >= 10) return 2
  return 1
})

</script>

<style scoped>

/*== Header - stora == */
.web-header {
    width: 100%;
    background-color: #27c4b5;
    border-bottom: 2px solid #0a8276;
    position: relative;
    min-width: 0; /* viktigt */
}

.web-header-layout {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1px clamp(6px, 2vw, 10px);
    min-height: 110px;
}

/* == Left side == */
.web-header-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    text-decoration: none;
    min-width: 0;
}
.web-header-title {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 2.2rem);
    font-weight: 700;
    line-height: 1;
    font-family: 'Poppins', sans-serif;
    color: #0b3733;
}

.web-header-logo {
    display: block;
    width: clamp(100px, 12vw, 120px);
    height: auto;
}

/* === Right side === */
.web-header-right {
    margin-left: auto;
    min-width: 0;
    flex-shrink:0;
}

/* == Utloggad layout == */
.header-logged-out {
    display: flex;
    align-items: center;
    gap: 25 px;
}

.header-auth-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateY(22px);
}

/* == Inloggad layout == */
.header-logged-in {
    display: flex;
    align-items: center;
    gap: 22px;
}

.header-logged-in > 
.header-button {
    transform: translateY(22px);
  }

/* == Header tools: spårk / meny knapp == */
.header-tools {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-width: 90px;
}

/* == Header buttons == */
.header-button {
    border: 1px solid rgba(4, 203, 183, 0.75);
    border-radius: 999px;
    background-color: rgba(127, 253, 241, 0.75);
    color: #111;
    padding: 6px 14px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
}

.header-button:hover {
    background-color: white;
}

/* == Menyknappen == */
.web-header-menu-button {
    font-size: 2rem;
    background: none;
    color: #0b3733;
    border: none;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    position: relative;
    z-index: 2100;
}

.menu-button-active {
  background-color: rgb(179, 229, 235);
  border-radius: 10px;
  padding: 4px 6px 6px;
}

/* == Avatar == */
.web-header-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #9ed8ff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(15px);
}
.header-avatar-container {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}

.header-hat {
  position: absolute;
  font-size: 1.3rem;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

/* ==  Menu backdrop == */
.menu-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(5px);
    z-index: 1500;
}

html, 
body {
  overflow-x: hidden;
}

/* == Telefonskärm ==*/
@media (max-width: 768px) {

.web-header-layout {
    min-height: 96px;
    padding: 8px 8px;
} 

.web-header-left {
    flex: 1;
    gap: 2px;    
}

.web-header-title {
    font-size: 1.7rem;
    line-height: 1;
    white-space: nowrap;
}

.web-header-logo {
    width: 88px;
}

.header-logged-out,
.header-logged-in {
    gap: 8px;
}

.header-auth-buttons {
    gap: 5px;
    transform: translateY(22px);
}

.header-button {
    padding: 5px 10px;
    min-width: auto;
    font-size: 0.80rem;
}

.header-tools {
    min-width: auto;
    gap: 13px;
}

.web-header-menu-button {
    font-size:2rem;
    right: auto;
}

.web-header-avatar {
    width: 52px;
    height: 52px;
    transform: translateY(18px);
}
.header-hat {
    font-size: 1rem !important;
    top: 11px !important; 
}

}

</style>