-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup function to run every 30 minutes
SELECT cron.schedule(
  'cleanup-expired-announcements',
  '*/30 * * * *', -- Every 30 minutes
  $$
  select
    net.http_post(
        url:='https://zbsxyvclylkclixwsytr.supabase.co/functions/v1/cleanup-expired-announcements',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpic3h5dmNseWxrY2xpeHdzeXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzIxODEsImV4cCI6MjA1OTk0ODE4MX0.3Y5MYryKBOk1ROx2p0ieI7ZwEXy9r3fQn6Mf65VbIfA"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);