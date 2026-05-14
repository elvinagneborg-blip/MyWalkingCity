<template>
    <main class="reset-password-container">
        <div class="reset-password-form">

            <!--Description box-->
            <div class="reset-password-text">
                <h1> {{uiLabels.resetPasswordTitle }}</h1>
                <p> {{ uiLabels.resetPasswordDescription }}</p>
            </div>
            
            <!--New password input-->
            <input
                class="login-input"
                type="password"
                v-model="newPassword"
                :placeholder="uiLabels.newPasswordPlaceholder"
                />
  
            <!-- Save new password -->
            <button class="button-report" @click="updatePassword">
                {{ uiLabels.saveNewPassword }}
            </button>
            
        </div>

        <!--Popup-->
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

  //Import 
    import { ref, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import io from 'socket.io-client'
    import { supabase } from '@/utils/supabase'

  //Set Up
    const props = defineProps(['backendURL', 'currentLang'])
    const socket = io(props.backendURL)
    const router = useRouter()
  
  //Ui and language
    const uiLabels = ref({})

    socket.on("uiLabels", (labels) => { 
        uiLabels.value = labels
    })
  
    watch(() => props.currentLang, (newLang) => {
        socket.emit("getUILabels", newLang || "en")
    }, { immediate: true })

  //Popup
    const showPopup = ref(false)
    const popupTitle = ref('')
    const popupMessage = ref('')

    function openPopup(title, message) {
        popupTitle.value = title
        popupMessage.value = message
        showPopup.value = true}
    
    function closePopup() {
        showPopup.value = false
        if (popupTitle.value === uiLabels.value.popupSuccessTitleReset) {
            router.push({ name: 'LogIn' })
        }
    }
  
  //Form data
    const newPassword = ref('')
    const message = ref('')
  
  //Update password 
    async function updatePassword() {
        if (!newPassword.value) {
            openPopup(
                uiLabels.value.popupErrorTitle,
                uiLabels.value.popupFillInNewPassword
            )
        return
        }
  
    //Update password Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    })
  
    if (error) {
        openPopup(
            uiLabels.value.popupErrorTitle,
            error.message
        )
    return
    }

    //Success
    openPopup(
        uiLabels.value.popupSuccessTitleReset,
        uiLabels.value.popupPasswordUpdated
    )
    }
    
</script>

<style scoped>
/* == Page layout ==*/
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 80vh;
  padding: 30px;
}

.reset-password-form {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  max-width: 520px;
}

/*== Intro text =*/
.reset-password-text {
  background: rgba(30, 188, 156, 0.12);
  border: 1px solid rgba(30, 188, 156, 0.25);

  padding: 24px 20px;
  border-radius: 10px;

  margin-bottom: 30px;
  text-align: center;

  width: 100%;
  box-sizing: border-box;
}

.reset-password-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 10px 0;
}

.reset-password-description {
  font-size: 1rem;
  color: #444;
  line-height: 1.5;
  margin: 0;
}

/* == Form field =*/
.login-input {
  width: 85%;
  padding: 15px;
  margin-bottom: 20px;

  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #eef4f4;

  box-sizing: border-box;
}

/*== Primary button ==*/
.button-report {
  background-color: #1EBC9C;
  color: white;

  border: none;
  padding: 17px 80px;
  cursor: pointer;
  border-radius: 5px;

  font-size: 1rem;
}

/*== Popup ==*/
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
}

.popup-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1EBC9C;

  margin-bottom: 14px;
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

@media (min-width: 769px) {
  .button-report {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .reset-password-container {
    padding: 40px;
    min-height: auto;
  }

  .reset-password-form {
    width: 100%;
  }

  .login-input {
    width: 100%;
    padding: 15px;
  }

  .button-report {
    width: 100%;
    padding: 15px 0;
  }
}
</style>