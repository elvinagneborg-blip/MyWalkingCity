<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend/ui.labels laddas innan sidan ritas upp-->
    <p> {{ uiLabels.loadingMWC }} </p>
  </div>

  <main v-else>
  <section class="form-section">
    <form class="form-container" @submit.prevent="handleSignUp"> 

      <div class="signUpText">
        <h1 class="signUpTitle"> {{ uiLabels.signUpTitle }} </h1>
        <p class="signUpDescription"> {{ uiLabels.signUpDescription }}</p>
      </div>

      
      <label class="form-label"> {{ uiLabels.fillInEmail }} <span v-if="emailError" class="error-star">*</span> </label> 
        <input type="email" v-model="email" :placeholder="uiLabels.emailPlaceholder" class="form-input" /> <!--Vmodel för att html och script ska kunna snacka med varann-->
      
      <label class="form-label"> {{ uiLabels.fillInPassword }} <span v-if="passwordError" class="error-star">*</span> </label> 
        <input type="password" v-model="password" :placeholder= "uiLabels.passwordSignUp" class="form-input" />
      
      <label class="form-label"> {{ uiLabels.fillInUsername }} <span v-if="usernameError" class="error-star">*</span></label> 
        <input type="text" v-model="username" :placeholder="uiLabels.usernameSignUp" class="form-input" /> 
      
      
      <!-- Choice of avatar -->
      <label class="form-label"> {{ uiLabels.chooseAvatar }} <span v-if="avatarError" class="error-star">*</span> </label> 
        <div class="avatar-options">
          <button
            v-for="avatar in avatars"
            :key="avatar"
            type="button"
            class="avatarButton"
            :class="{ selected: avatarUrl === avatar}"
            @click="avatarUrl = avatar"
            >
            <img 
            :src="avatar" 
            alt="Avatar option" 
            class="avatar-option-image" />
          </button>
        </div>

      <!-- Create an account button-->
      <button type="submit" class="submit-button"> {{ uiLabels.signUp }} </button>

      <!-- Link to log in-->
      <div class="login-switch-container">
        <p class="switch-login-text"> {{ uiLabels.alreadyHaveAccount }} </p>
        <button class="login-button" @click="goToLogin"> {{ uiLabels.logIn }} </button>
      </div>
    </form>
  </section>

  <!--Popup for error messages / success messages -->
  <div v-if="showPopup" class="popup-overlay">
    <div class="popup-box">
      <h2 class="popup-title"> {{ popupTitle }} </h2>
      <p class="popup-message"> {{ popupMessage }} </p>

      <button class="popup-button" @click="goToHome"> OK </button>
    </div>
  </div>

  </main>
</template>

<script setup>
//---- Imports ----
  import { ref, watch } from 'vue'              //för att kunna ha reaktiva variabler och övervaka dem
  import { useRouter } from 'vue-router'
  import io from 'socket.io-client'             //kontakt med server
  import { supabase } from '@/utils/supabase' 

//---- Setup ----
  const props = defineProps(['backendURL', 'currentLang'])    //ta emot språkval från app.vue
  const socket = io(props.backendURL)
  const router = useRouter()

//---- UI and language ----
  const uiLabels = ref({})                      //Språkknappar/uiLabels
  
  socket.on("uiLabels", (labels) => { 
    uiLabels.value = labels
  })

  watch(() => props.currentLang, (newLang) => { //vakta språkvalet, ligger alltid och lyssnar
    socket.emit("getUILabels", newLang || "en"); },        //Hämtar uiLabels enl. valt språk
    { immediate: true })                       //Språket laddas direkt när sidan laddas, istället för att vänta på att språket ska ändras 1a gngen


//---- Form Data ----
  //Connected to v-model in HTML 
  const username = ref('')
  const email = ref('')
  const password = ref('')
  const avatarUrl = ref('')

  //Avatar images taken from DiceBear API
  const avatars = [
  'https://api.dicebear.com/9.x/personas/svg?seed=Anna',
  'https://api.dicebear.com/9.x/personas/svg?seed=Lucas',
  'https://api.dicebear.com/9.x/personas/svg?seed=Sara',
  'https://api.dicebear.com/9.x/personas/svg?seed=Felix'
  ]

//---- Form Errors ----
  //Decides wheter or not * should appear (empty form-space)
  const usernameError = ref(false)
  const emailError = ref(false)
  const passwordError = ref(false)
  const avatarError = ref(false)

//---- Pop-ups ----
  const showPopup = ref(false)
  const popupMessage = ref('')
  const popupTitle = ref('')
 
  //Show pop-up with title and message
  function openPopup(title, message) {
    popupTitle.value = title
    popupMessage.value = message
    showPopup.value = true
  }

//---- Navigation ----
  const goToLogin = () => {
    router.push({ name: 'LogIn' })
  }

  const goToHome = () => {
    showPopup.value = false //close down popup so it does not follow to homepage
    if (popupTitle.value == uiLabels.value.popupSuccessTitle) { //To ensure that user only is directed to homepage if sign up was a success
      router.push({name: 'StartMWC'})
    }
  }

//Sign upp acount
  async function handleSignUp() {
    
  //check if a field is missing input 
    usernameError.value = !username.value  
    emailError.value = !email.value
    passwordError.value = !password.value 
    avatarError.value = !avatarUrl.value

    if (usernameError.value || emailError.value || passwordError.value || avatarError.value) {
      openPopup( 
        uiLabels.value.popupMissingFieldsTitle,
        uiLabels.value.popupMissingFieldsMessage
      )
    return
    }
    
  //SupaBase sign up 
    const { data, error } = await supabase.auth.signUp({ //Await, koden väntar tills vi får svar
      email: email.value,
      password: password.value,
      options: {
        data: {
        language: props.currentLang || 'en' // Påbörjade denna när jag försökte ändra i Supabase email men märkte att det tog tid, så ifall vi vill anpassa språket i utskicket lämnar jag denna kvar
        }
      }
    })

  //Error for SupaBase standard
    if (error) {
      openPopup(
        uiLabels.value.popupErrorTitle,
        uiLabels.value.popupSignUpError + error.message)
      return
    }
  
//Get user from SupaBase profile - table 
  const user = data.user

  //If user is missing
    if (!user) {
      openPopup(
        uiLabels.value.popupErrorTitle,
        uiLabels.value.popupUserCreateFailed
      )
    return
  }

  const userId = user.id;
  const newUsername = username.value;

  //uppdatera all gamla rapporrer som matcher eposten
  await supabase
    .from('reports')
    .update({
      user_id: userId,
      username: newUsername 
    })
    .eq('email', email.value)

  //samma med boosts
  await supabase
    .from('boosts')
    .update({ 
      user_id: userId
    })
    .eq('email', email.value)

  const { data: allReports } = await supabase  
    .from('reports')
    .select('report_id')
    .eq('user_id', userId) // hämtar alla rapporter

  const { data: allBoosts } = await supabase  
    .from('boosts')
    .select('boost_id')
    .eq('user_id', userId) //samma här
  
  const initialPoints = (allReports?.length || 0) * 10 + (allBoosts?.length || 0) * 5;

  //Update SuperBase profile-table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      username: newUsername,
      avatar_url: avatarUrl.value,
      total_points: initialPoints //om man har gjort rapporter eller boost vill jag att man ska få poängen när man skapar konto
    })
    .eq('user_id', userId)

    if (profileError) {
  // Username already exists
    if (profileError.message.includes('profiles_username_key')) {
      openPopup(
      uiLabels.value.popupErrorTitle,
      uiLabels.value.usernameAlreadyExists
    )
// Username already exists
    } else {
      openPopup(
        uiLabels.value.popupErrorTitle,
        uiLabels.value.popupProfileSaveFailed
    )
}

return
}

  // Sign - up success
  openPopup(
    uiLabels.value.popupSuccessTitle,
    uiLabels.value.popupConfirmEmail
  )
}
</script>


<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}


/* == Sign up - Intro text*/
.signUpText {
  background: rgba(30, 188, 156, 0.12);
  border: 1px solid rgba(30, 188, 156, 0.25);

  padding: 24px 20px;
  border-radius: 10px;

  margin-bottom: 30px;
  text-align: center;

  width: 100%;
  box-sizing: border-box;
}

.signUpTitle {
  font-size: 2.2rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 10px 0;
}

.signUpDescription {
  font-size: 1rem;
  color: #444;
  line-height: 1.5;
  margin: 0;
}

.form-input {
  margin-bottom: 20px;
}

.form-container {
  margin-top: 40px;
}

.error-star {
  color: red;
  font-weight: bold;
  margin-left: 4px;
}

/* == Avatar section == */
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
  border: 3px solid transparent; /* ingen turkos ring innan man klickar */
  padding: 0;
  background: none; /*tar bort standardbakgrund*/
  cursor: pointer;
  overflow: hidden; /*ser till så att bilden klipps korrekt*/
}

.avatarButton.selected {
  border-color: #1EBC9C; /* ringen runt när avataren blir klickad på */
}

.avatar-option-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}  

/* == Primary buttons == */


/* == Switch to login section ==*/
.login-switch-container {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.switch-login-text {
  font-size: 1rem;
  margin: 0;
}

.login-button {
  background-color: #1EBC9C;
  color: white;
  border: none;
  padding: 12px 40px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  width: auto;
  min-width: 180px;
}

/* == Popup == */

.popup-overlay { /*mörka lagret som täcker hela sidan */
  position: fixed;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  background: rgba(0, 0, 0, 0.45);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 999;
}

.popup-box {
  background: white;
  padding: 30px 25px;
  border-radius: 18px;

  width: 90%;
  max-width: 360px;

  text-align: center;

  box-shadow: 0 10px 30px rgba(0,0,0,0.2);

  animation: popupFade 0.2s ease;
}

.popup-message {
  font-size: 1rem;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.5;
}

.popup-button {
  background-color: #1EBC9C;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 28px;
  cursor: pointer;
  font-size: 1rem;
}

.popup-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1EBC9C;

  margin-bottom: 14px;
}


/* === Anpassad skärmbred === */

/*Webbläsare / större skärm än movbil*/
@media (min-width: 769px){
  .avatarButton {
    width: 100px;
    height: 100px;

  }

}

/* Mobilskärm*/
@media (max-width: 768px) {
  .login-container {
    padding: 40px;
    min-height: auto;
  }

  .login-form {
    width: 100%;
  }

  .login-input {
    padding: 15px;
  }

  .login-button {
    width: auto;
    min-width: 180px;
    padding: 12px 40px;
  }

  .login-switch-container {
    width: 100%;
  }
}
</style>