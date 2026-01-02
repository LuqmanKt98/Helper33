import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUser(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;

    const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (error || !user) return null;

    // Fetch profile to get role and other metadata
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return { ...user, ...profile };
}
