import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

async function testConnections() {
  console.log('=== TESTING SUPABASE CONNECTION ===');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Supabase URL:', supabaseUrl);
  console.log('Anon Key Present:', Boolean(anonKey));
  console.log('Service Role Key Present:', Boolean(serviceRoleKey));

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('ERROR: Missing Supabase credentials in .env.local');
  } else {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Test querying profiles table
      const { error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .limit(1);

      if (profilesError) {
        console.log('Query "profiles" table result:', profilesError.message);
        if (profilesError.code === '42P01') {
          console.log('-> Note: Table "profiles" does not exist yet. Migrations need to be applied in Supabase SQL editor.');
        }
      } else {
        console.log('SUCCESS: Connected to Supabase! "profiles" table is accessible.');
      }

      // Check auth connection
      const { data: users, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
      if (authError) {
        console.log('Supabase Auth error:', authError.message);
      } else {
        console.log('SUCCESS: Supabase Auth Admin API is working! User count in project:', users?.users?.length ?? 0);
      }
    } catch (err) {
      console.error('Supabase connection error:', err);
    }
  }

  console.log('\n=== TESTING CLOUDINARY CONNECTION ===');
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('Cloud Name:', cloudName);
  console.log('API Key Present:', Boolean(apiKey));
  console.log('API Secret Present:', Boolean(apiSecret));

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('ERROR: Missing Cloudinary credentials in .env.local');
  } else {
    try {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });

      const pingResult = await cloudinary.api.ping();
      console.log('Cloudinary Ping Result:', pingResult);
      if (pingResult.status === 'ok') {
        console.log('SUCCESS: Connected to Cloudinary! Cloud Name:', cloudName);
      }
    } catch (err) {
      console.error('Cloudinary connection error:', err);
    }
  }
}

testConnections();
