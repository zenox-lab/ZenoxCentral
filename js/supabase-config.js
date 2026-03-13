// Substitua as strings abaixo pelas suas chaves reais do painel do Supabase
const supabaseUrl = 'https://dqyizvvipuksxiszanlt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxeWl6dnZpcHVrc3hpc3phbmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc1MzgsImV4cCI6MjA4MDQxMzUzOH0.-32650_i6iNhfbPpoi3mEuCwgz8edeWrPfKwPfeXuw0';

// Usamos 'var' em vez de 'const' aqui para evitar o erro "Identifier has already been declared"
var supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase conectado com sucesso!");

// --- SCRIPT DE LOGIN AUTOMÁTICO INVISÍVEL ---
async function loginAutomatico() {
    // Ele verifica se você já tem uma sessão ativa
    const { data: { session } } = await supabase.auth.getSession();
    
    // Se não tiver, ele faz o login sozinho na mesma hora
    if (!session) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'SEU_EMAIL_DE_LOGIN_AQUI', // Coloque o email que você usou para criar a conta no Supabase
            password: 'SUA_SENHA_AQUI'        // Coloque a sua senha do Supabase
        });

        if (error) {
            console.error("Erro no login automático:", error.message);
        } else {
            console.log("Login automático realizado com sucesso!");
            // Cria a chave falsa para o seu sistema antigo achar que você passou pela tela de login
            sessionStorage.setItem('zenox_access_granted', 'true');
        }
    } else {
        sessionStorage.setItem('zenox_access_granted', 'true');
    }
}

// Executa o login invisível assim que a página carrega
loginAutomatico();
