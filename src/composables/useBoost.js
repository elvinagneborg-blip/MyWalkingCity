import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, addPoints } from '@/utils/supabase' //funktionen för att få och spara poäng

const isModalOpen = ref(false);
const targetReportId = ref(null);
const targetReportType = ref('');
const boostEmail = ref('');
const isBoosting = ref(false);
const currentSession = ref(null);

export function useBoost() {
  const router = useRouter() //

  // Funktion för att öppna popupen (kallas från din boost-knapp)
  function openBoostModal(reportId, session, type) {
    if (!reportId) return //
    
    targetReportId.value = reportId
    targetReportType.value = type
    currentSession.value = session

    // Om användaren redan är inloggad, förifyll mejlen direkt från sessionen!
    if (session && session.user) {
      boostEmail.value = session.user.email //
    }

    isModalOpen.value = true
  }

  // Stäng popupen och nollställ fälten
  function closeBoostModal() {
    isModalOpen.value = false
    boostEmail.value = ''
    targetReportId.value = null
    currentSession.value = null
    targetReportType.value = ''
  }

  // Körs när användaren klickar på "Bekräfta" i din nya popup
  async function submitBoost() {
    if (!boostEmail.value || !targetReportId.value) return

    // Validering av mejladress (från din originalkod)
    if (!boostEmail.value.includes('@') || !boostEmail.value.includes('.')) {
      alert("Vänligen ange en giltig e-postadress.") //
      return
    }

    isBoosting.value = true //
    
    try {
      const { error } = await supabase
        .from('boosts')
        .insert([
          { 
            report_id: targetReportId.value, 
            email: boostEmail.value 
          }
        ]) //

      if (error) {
        // Hantera dubbletter (från din originalkod)
        if (error.code === '23505') {
          alert("Du har redan boostat det här problemet!") //
        } else {
          throw error //
        }
        closeBoostModal()
        return
      }

      // Ge 5 poäng för boosten om användaren är inloggad (från din originalkod!)
      if (currentSession.value && currentSession.value.user) {
        await addPoints(currentSession.value.user.id, 5); //
      }

      // Stäng popupen innan vi skickar iväg användaren
      closeBoostModal()

      // Skicka till feedbacksidan vid framgång (från din originalkod!)
      router.push({ 
        path: '/feedback/', 
        query: { 
            action: 'boost',
            type: targetReportType.value
         } 
      }) //
      
    } catch (err) {
      console.error("Boost misslyckades:", err.message) //
      alert("Något gick fel. Försök igen senare.") //
    } finally {
      isBoosting.value = false //
    }
  }

  return {
    isModalOpen,
    boostEmail,
    isBoosting,
    openBoostModal,
    closeBoostModal,
    submitBoost,
    targetReportType
  }
}