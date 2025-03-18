-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'system', 'course', 'survey', 'achievement', 'reminder', etc.
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Add RLS policies for the notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own notifications
CREATE POLICY "Users can read their own notifications" 
    ON public.notifications 
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to update only their own notifications
CREATE POLICY "Users can update their own notifications" 
    ON public.notifications 
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert notifications (for test purposes)
CREATE POLICY "Users can insert notifications" 
    ON public.notifications 
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX notifications_read_idx ON public.notifications(read);
CREATE INDEX notifications_created_at_idx ON public.notifications(created_at);

-- Function to notify on new notification
CREATE OR REPLACE FUNCTION public.handle_new_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_notification',
    json_build_object(
      'type', NEW.type,
      'user_id', NEW.user_id,
      'id', NEW.id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on notification insert
DROP TRIGGER IF EXISTS on_notification_insert ON public.notifications;
CREATE TRIGGER on_notification_insert
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_notification(); 