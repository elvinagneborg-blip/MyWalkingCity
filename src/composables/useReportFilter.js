

import { ref, computed} from 'vue'

export function useReportFilters(allReports, recentReports) { 
    const selectedType = ref('all') //all beror på vilken huvudtyp som är vald 
    const selectedCategory = ref('all')

    const selectType = (type) => { //nollsäller underkategorier när en huvudkategori är vald 
        selectedType.value = type
        selectedCategory.value = 'all'
    }

    const selectCategory = (category) => { //val av underkategori
        selectedCategory.value = category
      }


    const filterReports = (reports) => { //tar emot listan av reports / recent reports 
    return reports.filter(report => {
      if (selectedType.value !== 'all' && report.type !== selectedType.value) { //ifall filtret inte matchat typ 
        return false
      }

      if (selectedCategory.value !== 'all' && report.category !== selectedCategory.value) {//ifall filtret inte matchat kategori 
        return false
      }

      return true
    })
  }

  const filteredReports = computed(() => { //filtrera rapporter
    return filterReports(allReports.value)
  })

  const filteredRecentReports = computed(() => { //filtrera recent reports 
    return filterReports(recentReports.value)
  })

  const availableCategories = computed(() => {
    if (selectedType.value === 'all') { //innehåller bara kategorier från vald huvudtyp 
      return []
    }

    return [...new Set(
      allReports.value
        .filter(report => report.type === selectedType.value)
        .map(report => report.category)
        .filter(Boolean)
    )]
  })

  return {
    selectedType,
    selectedCategory,
    selectType,
    selectCategory,
    filteredReports,
    filteredRecentReports,
    availableCategories
  }
}