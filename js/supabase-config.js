// Supabase Configuration
const SUPABASE_URL = 'https://dqyizvvipuksxiszanlt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxeWl6dnZpcHVrc3hpc3phbmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc1MzgsImV4cCI6MjA4MDQxMzUzOH0.-32650_i6iNhfbPpoi3mEuCwgz8edeWrPfKwPfeXuw0';

// Initialize Supabase Client
// Ensure the SDK is loaded before this script runs
let supabase;

if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase initialized successfully");
} else {
    console.error("Supabase SDK not loaded!");
}
