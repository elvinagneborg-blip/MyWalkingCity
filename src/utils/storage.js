// Funktion för att spara formulärdata i sessionStorage
export const saveSubmission = (submissionData, type) => {
  const existingData = sessionStorage.getItem('mwc_submissions');
  let submissions = existingData ? JSON.parse(existingData) : [];

  const newSubmission = {
    ...submissionData, // Kopiera alla fält från formuläret
    type: type,   
    createdAt: new Date().toLocaleString() // Timestamp for sorting/display
  };

  submissions.unshift(newSubmission);

  sessionStorage.setItem('mwc_submissions', JSON.stringify(submissions));
};