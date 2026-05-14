<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p> {{ uiLabels.loadPage }}</p>
  </div>

  <main v-else>
  <section class="login-container">
    <div class="login-form">

      <div class="logInText">
        <h1 class="logInTitle"> {{ uiLabels.logInTitle }} </h1>
        <p class="logInDescription"> {{ uiLabels.logInDescription }}</p>
      </div>

      <!-- Fill in space for email and password -->
      <label class="login-label"> {{ uiLabels.fillInEmailLogIn }} <span v-if="emailLogInError" class="error-star">*</span></label> 
        <input type="email" v-model="email" :placeholder="uiLabels.emailSignUp" class="login-input" />
      
      <label class="login-label"> {{ uiLabels.fillInPasswordLogIn }} <span v-if="passwordLogInError" class="error-star">*</span></label> 
        <input type="password" v-model="password" :placeholder="uiLabels.passwordSignUp" class="login-input" />

      <!-- Forgot password -->  
      <div class="forgot-password-section">
        <p class="forgot-password-text"> {{ uiLabels.forgotPassword }} </p>
        <button class="forgot-password-button" @click="handleForgotPassword"> {{ uiLabels.sendVerification }} </button>
      </div>

      <!--Log in button -->
      <button class="button-report" @click="handleLogin"> {{ uiLabels.logIn }} </button>
    </div>

      <!-- Link to log in-->
    <div class="login-switch-container">
        <p class="switch-signup-text"> {{ uiLabels.dontHaveAnAccount }} </p>
        <button class="login-button" @click="goToSignUp"> {{ uiLabels.signUp }} </button>
    </div>


  </section>


  <!--Pop up -->
  <div v-if="showPopup" class="popup-overlay">
  <div class="popup-box">
    <h2 class="popup-title"> {{ popupTitle }} </h2>
    <p class="popup-message"> {{ popupMessage }} </p>

    <button class="popup-button" @click="closePopup"> OK </button>
  </div>
</div>

  </main>
</template>

<script setup>
  //Imports
  import { ref, watch } from 'vue' //för att kunna ha reaktiva variabler och övervaka dem
  import { useRouter } from 'vue-router'
  import io from 'socket.io-client' //kontakt med server
  import { supabase } from '@/utils/supabase' 

  //Setup and Props (Input)
  const router = useRouter()
  const props = defineProps(['backendURL', 'currentLang']) //ta emot språkval från app.vue
  const socket = io(props.backendURL)

   //UI and language
  const uiLabels = ref({})                      //Språkknappar/uiLabels

  socket.on("uiLabels", (labels) => {           //Lyssnare för uiLabels
    uiLabels.value = labels
  })

  watch(() => props.currentLang, (newLang) => {   //vakta språkvalet, ligger alltid och lyssnar
    socket.emit("getUILabels", newLang || "en");  //Hämtar uiLabels enl. valt språk
  }, { immediate: true })                         //Språket laddas direkt när sidan laddas, istället för att vänta på att språket ska ändras 1a gngen


  //Form data
  const email = ref('')
  const password = ref('')

  //Form error
  const emailLogInError = ref(false)
  const passwordLogInError = ref(false)

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

  function closePopup() {
    showPopup.value = false
  }

  //navigation
  const goToSignUp = () => {
    router.push({ name: 'SignUp' })
  }

  //Log in account
  async function handleLogin() {

    //Check if field is missing input
    emailLogInError.value = !email.value
    passwordLogInError.value = !password.value

    if (emailLogInError.value || passwordLogInError.value) {
      openPopup(
        uiLabels.value.popupMissingFieldsTitle,
        uiLabels.value.popupMissingFieldLogIn)
      return
    }

    //Supabase log in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    //Error for supabase log in
    if (error) {
      openPopup(
      uiLabels.value.popupErrorTitle,
      uiLabels.value.popupLoginWrongCredentials
    )
    } else {

    // Log in success 
    router.push({ name: 'StartMWC' }) 
  }}

//Forgot password
  async function handleForgotPassword() {

    //Check if email is missing
    emailLogInError.value = !email.value
      if (emailLogInError.value) {
        openPopup(
          uiLabels.value.popupMissingFieldsTitle,
          uiLabels.value.popupFillInEmailForReset
        )

  return
}
const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: window.location.origin + '/reset-password'
  })

  if (error) {
    openPopup(
      uiLabels.value.popupErrorTitle,
      uiLabels.value.popupResetPasswordError
    )
    return
  }
  openPopup(
    uiLabels.value.popupSuccessTitle,
    uiLabels.value.popupResetPasswordSent
  )
}

</script>


<style scoped>

/* == Log in- Intro text*/
.logInText {
  background: rgba(30, 188, 156, 0.12);
  border: 1px solid rgba(30, 188, 156, 0.25);

  padding: 24px 20px;
  border-radius: 10px;

  margin-bottom: 30px;
  text-align: center;

  width: 100%;
  box-sizing: border-box;
}

.logInTitle {
  font-size: 2.2rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 10px 0;
}

.logInDescription {
  font-size: 1rem;
  color: #444;
  line-height: 1.5;
  margin: 0;
}

/* == Form field == */
.login-input {
  width: 85%;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #eef4f4; 
  box-sizing: border-box; 
}



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

@media (max-width: 768px) {
  .login-container {
    padding: 20px;
  }
  
  .login-form, 
  .social-login {
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