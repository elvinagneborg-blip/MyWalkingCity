<!-- "The boss" -->
 <!-- vi vill skapa en variabel som kommer ihåg vilket språk vi valt-->
  <!--Routerview är all våra views-->

 <template>
  <WebbHeader :currentLang="lang" @toggle-lang="switchLanguage" />  <!--lyssnar på togglelang från knappen i headern-->
  <RouterView :currentLang="lang"/> <!--Skickar ner lang till sidan som syns just nu-->
 </template>


<script setup>
  import { ref } from 'vue'
  import { RouterView } from 'vue-router'
  import WebbHeader from './components/WebbHeader.vue'
 

  const lang = ref('sv')

  const switchLanguage = () => {
    lang.value = lang.value === "en" ? "sv" : "en";
  }


</script>


<style>

</style>
