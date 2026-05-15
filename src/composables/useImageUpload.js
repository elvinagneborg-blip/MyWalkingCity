import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export function useImageUpload() {
  const selectedFile = ref(null)
  const selectedFileName = ref('')
  const imagePreview = ref(null)

  function handlePhotoUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    selectedFile.value = file
    selectedFileName.value = file.name
    imagePreview.value = URL.createObjectURL(file)
  }

  function removeImage() {
    selectedFile.value = null
    selectedFileName.value = ''
    imagePreview.value = null
  }

  async function uploadImage() {
    if (!selectedFile.value) return null
    const fileName = `${Date.now()}-${selectedFile.value.name}`

    const { error } = await supabase.storage
      .from('report-images')
      .upload(fileName, selectedFile.value)

    if (error) {
      console.error("Storage error:", error.message)
      return null
    }

    const { data: publicUrlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl
  }

  return {
    selectedFile,
    selectedFileName,
    imagePreview,
    handlePhotoUpload,
    removeImage,
    uploadImage
  }
}