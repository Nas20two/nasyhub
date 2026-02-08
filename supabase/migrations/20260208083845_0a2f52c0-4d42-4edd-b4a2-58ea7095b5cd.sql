-- Create the first-admin bootstrap function
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign admin if no admin exists yet and the user just confirmed their email
  IF NEW.email_confirmed_at IS NOT NULL 
     AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'admin');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_user_confirmed_first_admin
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_first_admin();

-- Manually assign admin role to the existing user (since they're already confirmed)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'nasiruddin.syed@hotmail.com'
  AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');