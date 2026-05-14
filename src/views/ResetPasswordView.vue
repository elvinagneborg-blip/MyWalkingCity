<template>
    <main class="reset-password-container">
        <div class="reset-password-form">
            <h1>Återställ lösenord</h1>
  
            <input
                type="password"
                v-model="newPassword"
                placeholder="Nytt lösenord"
                class="login-input"
                />
  
            <button class="button-report" @click="updatePassword">
                Spara nytt lösenord
            </button>
  
            <p v-if="message">{{ message }}</p>
      </div>
    </main>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '@/utils/supabase'
  
  const router = useRouter()
  
  const newPassword = ref('')
  const message = ref('')
  
  async function updatePassword() {
    if (!newPassword.value) {
        message.value = 'Fyll i ett nytt lösenord.'
        return
    }
  
    const { error } = await supabase.auth.updateUser({
        password: newPassword.value
    })
  
    if (error) {
        message.value = 'Kunde inte uppdatera lösenordet: ' + error.message
        return
    }
  
    message.value = 'Lösenordet har uppdaterats.'
  
    setTimeout(() => {
        router.push({ name: 'LogIn' })
        }, 1500)
    }
  </script>