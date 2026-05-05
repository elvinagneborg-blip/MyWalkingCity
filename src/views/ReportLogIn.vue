<template>
  <WebbHeader />
  <main class="login-container">
    <div class="login-form">
      <input type="text" placeholder="Username" class="login-input" />
      <input type="password" placeholder="Password" class="login-input" />
      <button class="button-report" @click="handleLogin"> {{ uiLabels.logIn }} </button>
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
  </main>
</template>

<script setup>
  //Imports
  import { ref, onMounted } from 'vue' //för att kunna ha reaktiva variabler och övervaka dem
  import { useRouter } from 'vue-router'
  import io from 'socket.io-client' //kontakt med server
  import WebbHeader from '@/components/WebbHeader.vue' //Headerkomponenten

  //Data
  const socket = io("localhost:3000")
  const router = useRouter()
  const uiLabels = ref({})
  const lang = ref("en")

  //Socket listeners
  socket.on("uiLabels", (labels) => {
    uiLabels.value = labels
  })
  
  //Methods
  const switchLanguage = () => {
    lang.value = lang.value === "en" ? "sv" : "en";
    socket.emit("getUILabels", lang.value)
  }
  const handleLogin = () => {
    // Skicka vidare användaren
    router.push({ name: 'ReportView' }) 
  }
  //Startup and Init (On Load)
  onMounted(() => { 
    socket.emit("getUILabels", lang.value)
  })
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