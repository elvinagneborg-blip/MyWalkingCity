<template> <!-- Main ska inte finnas med i komponent då den ska importeras och det bara får finnas en main per view-->
     <header class="web-header">
        <div class="web-header-layout">

            <!--Left side of header-->
            <div class="web-header-left">
                <h1 class="web-header-title"> My Walking City </h1>
            
            <!--Logo as route to homepage-->    
                <RouterLink :to="{ name: 'StartMWC' }" class="web-header-logo-link">
                    <img
                        src="/img/cropped-SIC-2.png"
                        class="web-header-logo">
                </RouterLink>
            </div>

            <!--Right side of hedaer-->
            <div class="web-header-right">

                <!--Language button-->
                <button @click="$emit('toggle-lang')"> <!--Säger till app.vue att knappen är tryckt-->
                        {{ currentLang === 'sv' ? 'English' : 'Svenska' }} <!--Det som står på knappen, info fås från app.vue-->
                </button>
                
                <div>
                <!--If user is not logged in-->
                    <div v-if="!session">
                        <button  @click="router.push('/login')"> <!--KOllar om man är inloggad-->
                            {{uiLabels.logInHeader}}
                        </button>
                        <button  @click="router.push('/signup')"> <!--KOllar om man är inloggad-->
                            {{uiLabels.signUpHeader}}
                        </button>
                    </div>

                <!--If user is logged in-->
                    <div v-else>
                        <button @click="handleLogout"> 
                        {{uiLabels.logOutHeader}}
                        </button>
                        
                        <img
                            v-if="avatarUrl"
                            :src="avatarUrl"
                            class="web-header-avatar"
                            alt="User avatar"
                        >
                    </div>
                </div>

            <!--Open Menu -->
                <button 
                    class="web-header-menu-button" @click="toggleMenu" aria-label="Open menu"> 
                ☰
                </button>
            </div>

            <!--MENY -->

            <!-- Nedan kopplar vi ihop navkomponenten med headern-->
            
            <!-- Allt mellan  <ResponsiveNav> och </ResponsiveNav> hamnar i slot i navkomponenten-->
            <ResponsiveNav :hideNav="!menuOpen"> <!-- Ifall menyn ska va gömd eller ej-->
                <button class="menu-popup-close" @click="closeMenu"> x </button> <!-- kryss för att stänga menyn-->

                <div class="menu-popup-nav">
                    <RouterLink :to="{ name: 'StartMWC' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.routeHome}}</RouterLink> <!-- Tar oss till homepage och stänger ner menyn-->
                    
                    <!--If user is not logged in-->
                    <template v-if="session">
                        <RouterLink :to="{ name: 'ProfileView' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.routeProfile}}</RouterLink>
                    </template>

                    <!--If user is not logged in-->
                    <template v-else> 
                        <RouterLink :to="{ name: 'LogIn' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.logInHeader}}</RouterLink>
                        <RouterLink :to="{ name: 'SignUp' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.signUpHeader}}</RouterLink>
                    </template>
                    <RouterLink :to="{ name: 'OptionView' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.routeReport}}</RouterLink>
                    <RouterLink :to="{ name: 'AllReportsView' }" class="menu-popup-link" @click="closeMenu">{{uiLabels.routeAllReport}}</RouterLink>
                    
                    <RouterLink :to="{ name: 'AllReportsView' }" class="menu-popup-link" @click="closeMenu">
                        {{uiLabels.routeRecentReport}}
                    </RouterLink>
                    <RouterLink :to="{ name: 'StartMWC' }" class="menu-popup-link" @click="closeMenu">
                        {{uiLabels.routeHowTo}}
                    </RouterLink>
                </div>
            </ResponsiveNav>
        </div>
    </header>
</template>




<script setup>  

//Imports 
import { ref, watch } from 'vue'
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

//Avatar
const avatarUrl = ref(null)

    //Hämta avataren
const getAvatar = async () => {
    avatarUrl.value = null

    if (!props.session?.user?.id) return
    
    const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', props.session.user.id)
        .single()

    if (error) {
        console.log('Kunde inte hämta avatar:', error.message)
    return
    }
    
    avatarUrl.value = data?.avatar_url || null
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