<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p>Laddar My Walking City...</p>
  </div>
  <main v-else>
  <section class="login-container">

    <div class="login-form">
      <input type="email" v-model="email" placeholder="Your email" class="login-input" /> <!--Vmodel för att html och script ska kunna snacka med varann-->
      <input type="password" v-model="password" placeholder="Your password" class="login-input" />
      <button class="button-report" @click="handleSignUp"> {{ uiLabels.signUp }} </button>
    </div>

    <div class="separator-text">
      {{ uiLabels.or }}
    </div>

    <div class="social-login">
      <button class="social-button button-google">Log in with Google</button>
      <button class="social-button button-apple">Log in with apple</button>
    </div>

    <div class="signup-section">
      <button class="button-how-it-works signup-button"> {{ uiLabels.signUp }} </button>
    </div>
  </section>
  </main>
</template>

<script setup>
  //Imports
  import { ref, watch } from 'vue'              //för att kunna ha reaktiva variabler och övervaka dem
  import io from 'socket.io-client'             //kontakt med server
  import { supabase } from '@/utils/supabase' 

  //Setup and Props (Input)
  const socket = io("localhost:3000")
  const props = defineProps(['currentLang'])    //ta emot språkval från app.vue

  //UI and language
  const uiLabels = ref({})                      //Språkknappar/uiLabels

  socket.on("uiLabels", (labels) => {           //Lyssnare för uiLabels
    uiLabels.value = labels
  })

  watch(() => props.currentLang, (newLang) => { //vakta språkvalet, ligger alltid och lyssnar
    socket.emit("getUILabels", newLang || "en");        //Hämtar uiLabels enl. valt språk
  }, { immediate: true })                       //Språket laddas direkt när sidan laddas, istället för att vänta på att språket ska ändras 1a gngen

  //Sign up
  const email = ref('')
  const password = ref('')

  async function handleSignUp() { //Async för att allt inte ska frysa medan vi pratar med databasen
    const { data, error } = await supabase.auth.signUp({ //Await, koden väntar tills vi får svar
    email: email.value,
    password: password.value,
  })
    if (error) {
      alert("Problem with sign up: " + error.message)
    } else {
      alert("Kolla din e-post för att bekräfta kontot!") //Ändra till UILAbel
    }
  }
</script>


<style scoped>

header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px; 
}
header img {
  height: auto; 
  width: auto;
}
header div {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  min-height: 80vh; 
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
}
.login-input {
  width: 100%;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #f0f0f0; 
  box-sizing: border-box; 
}

.button-report {
  background-color: #1EBC9C;
  color: white;
  border: none;
  padding: 17px 80px; 
  cursor: pointer;
  border-radius: 5px;
  font-size: 1rem;
}

.button-how-it-works {
  background-color: #CBE6E1;
  color: white;
  border: none;
  padding: 17px 80px; 
  cursor: pointer;
  border-radius: 5px;
  font-size: 1rem;
}

.separator-text {
  margin: 30px 0;
  color: #333;
  font-size: 1.1rem;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 15px; 
  margin-bottom: 30px;
  width: 100%;
  max-width: 400px; 
}
.social-button {
  flex: 1; 
  text-align: center;
  background-color: #1EBC9C;
  color: white;
  border: none;
  padding: 17px 20px; 
  cursor: pointer;
  border-radius: 5px;
}

.signup-section {
  width: 100%;
  text-align: center;
}
.signup-button {
  background-color: #1ebc9c85;
  color: white;
  border: none;
  padding: 17px 80px;
  cursor: pointer;
  border-radius: 5px;
}

@media (max-width: 768px) {
  .login-container {
    padding: 20px;
  }
  
  .login-form, .social-login {
    width: 100%; 
    max-width: none;
    padding: 0;
  }
  
  .button-report, .button-how-it-works {
    width: 100%;
    padding: 15px 0;
    margin-bottom: 10px; 
  }
  
  .login-input {
    padding: 15px;
  }
  
  .separator-text {
    margin: 20px 0;
  }
  
  .social-login {
    gap: 10px; 
  }
}
</style>