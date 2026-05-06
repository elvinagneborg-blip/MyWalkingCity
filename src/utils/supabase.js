import { createClient } from '@supabase/supabase-js'

// Dessa URL:er och nycklar får ni när ni skapar ert projekt på supabase.com
const supabaseUrl = 'https://cvflzwxjyceyxlrjvwtz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Zmx6d3hqeWNleXhscmp2d3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTA4MjksImV4cCI6MjA5MzQ2NjgyOX0.HjFrf5F_1ocbDCybWflhF6Mvv29c0E6_4R7zPuj9ByA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)