import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting cleanup of expired announcements...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete expired announcements
    const { data: deletedAnnouncements, error } = await supabase
      .from('announcements')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id, title, user_id');

    if (error) {
      console.error('Error deleting expired announcements:', error);
      throw error;
    }

    const deletedCount = deletedAnnouncements?.length || 0;
    console.log(`Successfully deleted ${deletedCount} expired announcements`);

    if (deletedCount > 0) {
      console.log('Deleted announcements:', deletedAnnouncements.map(a => ({
        id: a.id,
        title: a.title,
        user_id: a.user_id
      })));
    }

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount,
        deletedAnnouncements: deletedAnnouncements?.map(a => a.id) || [],
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Cleanup failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});