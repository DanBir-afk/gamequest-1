var supabaseClient = null;
function initSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    if (!window.supabase || !window.supabase.createClient) return null;
    var url = window.SUPABASE_URL;
    var key = window.SUPABASE_KEY;
    if (!url || !key) return null;
    supabaseClient = window.supabase.createClient(url, key);
    return supabaseClient;
}
initSupabaseClient();
