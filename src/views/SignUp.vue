<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p> {{ uiLabels.loadPage }} </p>
  </div>
  <main v-else>
  <section class="login-container">

    <div class="login-form">
      <div class="signUp-Text">
        <h1 class="signUpTitle"> {{ uiLabels.signUpTitle }} </h1>
        <p class="signUpDescription"> {{ uiLabels.signUpDescription }}</p>
      </div>

      <label class="signup-label"> 
        {{ uiLabels.fillInUsername }} 
        <span v-if="usernameError" class="error-star">*</span>
      </label> 
        <input type="text" v-model="username" :placeholder="uiLabels.usernameSignUp" class="login-input" /> 
      
      <label class="signup-label"> 
        {{ uiLabels.fillInEmail }}  
        <span v-if="emailError" class="error-star">*</span>
      </label> 
        <input type="email" v-model="email" :placeholder="uiLabels.emailSignUp" class="login-input" /> <!--Vmodel för att html och script ska kunna snacka med varann-->
      
      <label class="signup-label"> 
        {{ uiLabels.fillInPassword }} 
        <span v-if="passwordError" class="error-star">*</span>
      </label> 
        <input type="password" v-model="password" :placeholder= "uiLabels.passwordSignUp" class="login-input" />
      
      <label class="signup-label"> 
        {{ uiLabels.chooseAvatar }}  
        <span v-if="avatarError" class="error-star">*</span>
      </label> 

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

      <div class="login-switch-container">
        <p class="switch-login-text">
          {{ uiLabels.alreadyHaveAccount }}
        </p>
        <button class="login-button" @click="goToLogin">
          {{ uiLabels.logIn }}
        </button>
    </div>
    </div>
  </section>

  <!--Popup-->
  <div v-if="showPopup" class="popup-overlay">
    <div class="popup-box">
      <h2 class="popup-title">
        {{ popupTitle }}
      </h2>
      <p class="popup-message">
        {{ popupMessage }}
      </p>

      <button class="popup-button" @click="goToHome">
        OK
      </button>
    </div>
  </div>

  </main>
</template>

<script setup>
  //Imports
  import { ref, watch } from 'vue'              //för att kunna ha reaktiva variabler och övervaka dem
  import { useRouter } from 'vue-router'
  import io from 'socket.io-client'             //kontakt med server
  import { supabase } from '@/utils/supabase' 

  //Setup and Props (Input)
  const props = defineProps(['backendURL', 'currentLang'])    //ta emot språkval från app.vue
  const socket = io(props.backendURL)
  const router = useRouter()

  //Popup 
  const showPopup = ref(false)
  const popupMessage = ref('')
  const popupTitle = ref('')

  //Byt till login
  const goToLogin = () => {
    router.push({ name: 'LogIn' })
  }

  //Byt till home
  const goToHome = () => {
    showPopup.value = false
    if (popupTitle.value == uiLabels.value.popupSuccessTitle) {
      router.push({name: 'StartMWC'})
    }
  }

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

  const usernameError = ref(false)
  const emailError = ref(false)
  const passwordError = ref(false)
  const avatarError = ref(false)

  const avatars = [
  'https://api.dicebear.com/9.x/personas/svg?seed=Anna',
  'https://api.dicebear.com/9.x/personas/svg?seed=Lucas',
  'https://api.dicebear.com/9.x/personas/svg?seed=Sara',
  'https://api.dicebear.com/9.x/personas/svg?seed=Felix'
  ]

  function openPopup(title, message) {
    popupTitle.value = title
    popupMessage.value = message
    showPopup.value = true
}
  async function handleSignUp() {
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
    
//Skapar själva kontot i supabase
    const { data, error } = await supabase.auth.signUp({ //Await, koden väntar tills vi får svar
    email: email.value,
    password: password.value,
  })
    if (error) {
      openPopup(
        uiLabels.value.popupErrorTitle,
        uiLabels.value.popupSignUpError + error.message)
      return
    }
  
//Hämtar den nya användaren från supabase
const user = data.user

if (!user) {
  openPopup(
    uiLabels.value.popupErrorTitle,
    uiLabels.value.popupUserCreateFailed
  )
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
  openPopup(
    uiLabels.value.popupErrorTitle,
    uiLabels.value.popupProfileSaveFailed + profileError.message
  )
  return
}

  openPopup(
    uiLabels.value.popupSuccessTitle,
    uiLabels.value.popupConfirmEmail
  )
  
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

.signUp-Text {
  background: rgba(30, 188, 156, 0.12);
  border: 1px solid rgba(30, 188, 156, 0.25);
  backdrop-filter: blur(8px);

  padding: 24px 20px;
  border-radius: 18px;

  margin-bottom: 30px;
  text-align: center;

  width: 100%;
  box-sizing: border-box;
}

.signup-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #111;

  margin: 0 0 10px 0;
}

.signup-description {
  font-size: 1rem;
  color: #444;
  line-height: 1.5;

  margin: 0;
}

.popup-overlay {
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

.error-star {
  color: red;
  font-weight: bold;
  margin-left: 4px;
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