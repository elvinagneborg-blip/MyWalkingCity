import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'vue-router'

export function useBoost() {
  const isBoosting = ref(false)
  const router = useRouter()

  async function handleBoost(reportId, session) {
    if (!reportId) return
    
    let userEmail = ''

    // 1. Kolla om användaren är inloggad
    if (session && session.user) {
      userEmail = session.user.email
    } else {
      // 2. Om inte inloggad, fråga efter mejladress via en prompt
      // (I en framtida version kan du ha en snyggare modal, men prompt funkar bra nu)
      userEmail = window.prompt("Vänligen fyll i din e-postadress för att boosta:")
      
      if (!userEmail) {
        return // Användaren klickade på avbryt
      }

      // Enkel validering av mejladress
      if (!userEmail.includes('@', '.')) {
        alert("Vänligen ange en giltig e-postadress.")
        return
      }
    }

    isBoosting.value = true
    
    try {
      const { error } = await supabase
        .from('boosts')
        .insert([
          { 
            report_id: reportId, 
            email: userEmail // Vi sparar mejladressen i 'email'-kolumnen
          }
        ])

      if (error) {
        // 3. Hantera dubbletter (om databasen säger ifrån)
        if (error.code === '23505') {
          alert("Du har redan boostat det här problemet!")
        } else {
          throw error
        }
        return
      }

      // 4. Skicka till feedbacksidan vid framgång
      router.push({ 
        path: '/feedback/', 
        query: { type: 'boost' } 
      })
      
    } catch (err) {
      console.error("Boost misslyckades:", err.message)
      alert("Något gick fel. Försök igen senare.")
    } finally {
      isBoosting.value = false
    }
  }

  return {
    handleBoost,
    isBoosting
  }
}