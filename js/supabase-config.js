// Substitua as strings abaixo pelas suas chaves reais do painel do Supabase
const supabaseUrl = 'https://dqyizvvipuksxiszanlt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxeWl6dnZpcHVrc3hpc3phbmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc1MzgsImV4cCI6MjA4MDQxMzUzOH0.-32650_i6iNhfbPpoi3mEuCwgz8edeWrPfKwPfeXuw0';

// Usamos 'var' em vez de 'const' aqui para evitar o erro "Identifier has already been declared"
var supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
