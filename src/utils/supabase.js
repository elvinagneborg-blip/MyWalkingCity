import { createClient } from '@supabase/supabase-js'

// Dessa URL:er och nycklar får ni när ni skapar ert projekt på supabase.com
const supabaseUrl = 'https://cvflzwxjyceyxlrjvwtz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Zmx6d3hqeWNleXhscmp2d3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTA4MjksImV4cCI6MjA5MzQ2NjgyOX0.HjFrf5F_1ocbDCybWflhF6Mvv29c0E6_4R7zPuj9ByA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const addPoints = async (userId, pointsToAdd) => {
    if (!userId) return;

    try {
        // Hämta nuvarande poäng
        const { data, error: fetchError } = await supabase
            .from('profiles')
            .select('total_points')
            .eq('user_id', userId)
            .single();

        if (fetchError) throw fetchError;

        // Beräkna nya poäng
        const currentPoints = data.total_points || 0;
        const newPoints = currentPoints + pointsToAdd;

        const getLevel = (pts) => {
            if (pts >= 25) return 3;
            if (pts >= 10) return 2;
            return 1;
        };

        const oldLevel = getLevel(currentPoints);
        const newLevel = getLevel(newPoints);

        //använder session storage för så webbläsaren minns till animationerna
        sessionStorage.setItem('pointsAdded', pointsToAdd.toString());
        if (newLevel > oldLevel) {
            sessionStorage.setItem('leveledUp', newLevel.toString());
        }

        // Spara den nya summan i databasen
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ total_points: newPoints })
            .eq('user_id', userId);

        if (updateError) throw updateError;

        return newPoints;
    }   catch (error) {
        console.error(error.message);
    }
}