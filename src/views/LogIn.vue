<template>
  <div v-if="Object.keys(uiLabels).length === 0" class="loading-screen"> <!-- Väntar på att backend laddas innan sidan ritas upp-->
    <p> {{ uiLabels.loadingMWC }}</p>
  </div>

  <main v-else>
  <section class="form-section">
    <form class="form-container" @submit.prevent="handleLogin"> 

      <div class="logInText">
        <h1 class="logInTitle"> {{ uiLabels.logInTitle }} </h1>
        <p class="logInDescription"> {{ uiLabels.logInDescription }}</p>
      </div>

      <!-- Fill in space for email and password -->
      <label class="form-label"> {{ uiLabels.fillInEmailLogIn }} <span v-if="emailLogInError" class="error-star">*</span></label> 
        <input type="email" v-model="email" :placeholder="uiLabels.emailPlaceholder" class="form-input" />
      
      <label class="form-label"> {{ uiLabels.fillInPasswordLogIn }} <span v-if="passwordLogInError" class="error-star">*</span></label> 
        <input type="password" v-model="password" :placeholder="uiLabels.passwordSignUp" class="form-input" @keydown.enter.prevent="handleLogin" />
      <!-- Forgot password -->  
      <div class="forgot-password-section">
        <p class="forgot-password-text"> {{ uiLabels.forgotPassword }} </p>
        <button class="forgot-password-button" @click="handleForgotPassword"> {{ uiLabels.sendVerification }} </button>
      </div>

      <!--Log in button -->
      <button type="submit" class="submit-button"> {{ uiLabels.logIn }} </button>

      <!-- Link to log in-->
    <div class="login-switch-container">
        <p class="switch-signup-text"> {{ uiLabels.dontHaveAnAccount }} </p>
        <button class="login-button" @click="goToSignUp"> {{ uiLabels.signUp }} </button>
    </div>
  </form>


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
    return
    } 
    
    const user = data.user

    if (user) {
      await supabase
        .from('reports')
        .update({ user_id: user.id })
        .eq('email', email.value)
        .is('user_id', null)

    await supabase
      .from('boosts')
      .update({ user_id: user.id })
      .eq('email', email.value)
      .is('user_id', null)

    const { data: myReports } = await supabase
      .from('reports')
      .select('report_id')
      .eq('user_id', user.id)

    const { data: myBoosts } = await supabase
      .from('boosts')
      .select('boost_id')
      .eq('user_id', user.id)

    const totalPoints = (myReports?.length || 0) * 10 + (myBoosts?.length || 0) * 5

    // 4. Uppdatera profilen med korrekt totalpoäng
    await supabase
      .from('profiles')
      .update({ total_points: totalPoints })
      .eq('user_id', user.id)
    }

    // Log in success 
    router.push({ name: 'StartMWC' }) 
  }

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
    
    //Reset link to SupaBase
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

    //Verficiations link successfully sent 
    openPopup(
      uiLabels.value.popupSuccessTitlePassword,
      uiLabels.value.popupResetPasswordSent
      )
}
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

.form-container {
  max-width: 550px;
  margin: 0 auto;
  width: 100%;
  margin-top: 40px;
}

/* == Log in intro text =*/
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

.form-input {
  margin-bottom: 20px;
}

.error-star {
  color: red;
  font-weight: bold;
  margin-left: 4px;
}

/* == Forgot password section == */
.forgot-password-section {
  width: 85%;
  margin-top: -8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.forgot-password-text {
  margin: 0;
  font-size: 0.8rem;
  color: #0e0000;
}

.forgot-password-button {
  background: none;
  border: none;
  padding: 0;
  color: #1EBC9C;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.forgot-password-button:hover {
  color: #169d82;
  text-decoration: underline;
}

/* == Primary button ==*/
.button-report {
  background-color: #1EBC9C;
  color: white;
  border: none;
  padding: 17px 80px; 
  cursor: pointer;
  border-radius: 5px;
  font-size: 1rem;
}

/* == switch to Sign up button == */
.login-switch-container {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.switch-signup-text {
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

.login-button:hover {
  background-color: #17a88b;
  transform: translateY(-1px);

}

/* == Popup ==*/
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
@media (min-width: 769px) {
  .button-report {
    width: 100%;
  }
}

/* Mobiltelefon*/

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

  .button-report {
    width: 100%;
    padding: 15px 0;
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