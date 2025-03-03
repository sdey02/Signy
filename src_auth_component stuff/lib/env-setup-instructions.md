# Setting up the Service Role Key for Supabase

To fix the Row Level Security (RLS) issue with document uploads, you need to add your Supabase service role key to your `.env.local` file.

## How to get your service role key:

1. Go to your Supabase project dashboard
2. Click on the "Settings" icon in the left sidebar
3. Click on "API" in the submenu
4. In the API Settings page, find the "Project API keys" section
5. Copy the "service_role" key (Warning: This key has admin privileges!)

## Add this to your .env.local file:

```
# Add this line to your existing .env.local file
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **IMPORTANT SECURITY WARNING** ⚠️

The service role key has ADMIN privileges and can bypass Row Level Security. This means it can:
- Read ANY data in your database
- Write to ANY table
- Perform ANY operation

For production, make sure:
1. This key is NEVER exposed to the client-side
2. Keep it only in server-side code
3. Use more restrictive RLS policies when possible instead of bypassing security

## Alternative solutions:

If you don't want to use the service role key, you can:

1. Create a more permissive RLS policy on the "documents" table
2. Create a PostgreSQL function that allows inserting documents with proper authorization
3. Ensure the user is properly authenticated before uploading

For more information, see Supabase documentation on RLS: https://supabase.com/docs/guides/auth/row-level-security 