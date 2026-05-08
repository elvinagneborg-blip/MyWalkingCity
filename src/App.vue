<!-- "The boss" -->
 <!-- vi vill skapa en variabel som kommer ihåg vilket språk vi valt-->
  <!--Routerview är all våra views-->

 <template>
  <WebbHeader :session="session" :currentLang="lang" @toggle-lang="switchLanguage" />  <!--lyssnar på togglelang från knappen i headern-->
  <RouterView :session="session" :currentLang="lang"/> <!--Skickar ner lang till sidan som syns just nu-->
 </template>


<script setup>
  import { ref, onMounted } from 'vue'
  import { RouterView } from 'vue-router'
  import WebbHeader from './components/WebbHeader.vue'
  import { supabase } from '@/utils/supabase'


  const lang = ref('sv')
  const session = ref(null) // Håller koll på om vi är inloggade (null = utloggade)

  const switchLanguage = () => {
    lang.value = lang.value === "en" ? "sv" : "en";
  }

  onMounted(() => {
    // Kolla om det finns en användare sparad i webbläsaren sen innan
    supabase.auth.getSession().then(({ data }) => {
      session.value = data.session
    })
    // Lyssna om någon loggar in eller ut
    supabase.auth.onAuthStateChange((_event, _session) => {
      session.value = _session
    })
  })

</script>


<style>

</style>
