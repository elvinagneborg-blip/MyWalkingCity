<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p> {{ uiLabels.loadPage }} </p>
  </div>
  <main v-else>
  <section class="login-container">

    <div class="login-form">
      <label class="signup-label"> {{ uiLabels.fillInUsername }} </label> <!-- Se till att ändra-->
        <input type="text" v-model="username" :placeholder="uiLabels.usernameSignUp" class="login-input" /> 
      
      <label class="signup-label"> {{ uiLabels.fillInEmail }}  </label> <!-- Se till att ändra-->
        <input type="email" v-model="email" :placeholder="uiLabels.emailSignUp" class="login-input" /> <!--Vmodel för att html och script ska kunna snacka med varann-->
      
      <label class="signup-label"> {{ uiLabels.fillInPassword }} </label> <!-- Se till att ändra-->
        <input type="password" v-model="password" :placeholder= "uiLabels.passwordSignUp" class="login-input" />
      
      <label class="signup-label"> {{ uiLabels.chooseAvatar }}  </label> <!-- Se till att ändra-->
        <div class="avatar-options">
          <button
            v-for="avatar in avatars"
            :key="avatar"
            type="button"
            class="avatarButton"
            :class="{ selected: avatarUrl == avatar}"
            @click="avatarUrl = avatar"
            >
            <img :src="avatar" alt="Avatar option" class="avatar-option-image" />
          </button>
        </div>


      
      <button class="button-report" @click="handleSignUp"> {{ uiLabels.signUp }} </button>
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
  const props = defineProps(['backendURL', 'currentLang'])    //ta emot språkval från app.vue
  const socket = io(props.backendURL)

  //UI and language
  const uiLabels = ref({})                      //Språkknappar/uiLabels

  socket.on("uiLabels", (labels) => {           //Lyssnare för uiLabels
    uiLabels.value = labels
  })

  watch(() => props.currentLang, (newLang) => { //vakta språkvalet, ligger alltid och lyssnar
    socket.emit("getUILabels", newLang || "en");        //Hämtar uiLabels enl. valt språk
  }, { immediate: true })                       //Språket laddas direkt när sidan laddas, istället för att vänta på att språket ska ändras 1a gngen

  //Sign up
  const username = ref('')
  const email = ref('')
  const password = ref('')
  const avatarUrl = ref('')

  const avatars = [
  'https://api.dicebear.com/9.x/personas/svg?seed=Anna',
  'https://api.dicebear.com/9.x/personas/svg?seed=Lucas',
  'https://api.dicebear.com/9.x/personas/svg?seed=Sara',
  'https://api.dicebear.com/9.x/personas/svg?seed=Felix'
  ]

  async function handleSignUp() { //Async för att allt inte ska frysa medan vi pratar med databasen
    if (!username.value || !email.value || !password.value || !avatarUrl.value) {
      alert("Fyll i användarnamn, email och lösenord samt välj avatar")
    return}
    
//Skapar själva kontot i supabase
    const { data, error } = await supabase.auth.signUp({ //Await, koden väntar tills vi får svar
    email: email.value,
    password: password.value,
  })
    if (error) {
      alert("Problem with sign up: " + error.message)
      return
    }
  
//Hämtar den nya användaren från supabase
const user = data.user

if (!user) {
  alert("Kunde inte skapa användare")
  return
}

const { error: profileError } = await supabase
  .from('profiles')
  .update({
    username: username.value,
    avatar_url: avatarUrl.value,
    total_points: 0
  })
  .eq('user_id', user.id)

if (profileError) {
  alert("Kontot skapades, men profilen kunde inte sparas: " + profileError.message)
  return
}

alert("Kolla din e-post för att bekräfta kontot!")
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

  .avatar-options {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.avatarButton {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid transparent;
  padding: 0;
  background: none;
  cursor: pointer;
  overflow: hidden;
}

.avatarButton.selected {
  border-color: #1EBC9C;
}

.avatar-option-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}  


}
</style>