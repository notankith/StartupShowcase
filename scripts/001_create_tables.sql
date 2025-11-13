-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create ideas table
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  solution TEXT NOT NULL,
  market_opportunity TEXT,
  team_description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create idea_files table for uploaded documents
CREATE TABLE IF NOT EXISTS public.idea_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create contact_requests table for public inquiries
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for ideas (students can CRUD their own, public can view approved)
CREATE POLICY "ideas_select_own_all_statuses" ON public.ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ideas_select_approved_public" ON public.ideas FOR SELECT USING (status = 'approved' AND auth.uid() IS NULL);
CREATE POLICY "ideas_select_approved_authenticated" ON public.ideas FOR SELECT USING (status = 'approved');
CREATE POLICY "ideas_insert_own" ON public.ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ideas_update_own" ON public.ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ideas_delete_own" ON public.ideas FOR DELETE USING (auth.uid() = user_id);

-- Admin policies (admins can moderate all ideas)
CREATE POLICY "ideas_admin_all" ON public.ideas FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policies for idea_files
CREATE POLICY "idea_files_select_own" ON public.idea_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_files.idea_id AND ideas.user_id = auth.uid())
  OR
  (SELECT status FROM public.ideas WHERE ideas.id = idea_files.idea_id) = 'approved'
);
CREATE POLICY "idea_files_insert_own" ON public.idea_files FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_files.idea_id AND ideas.user_id = auth.uid())
);
CREATE POLICY "idea_files_delete_own" ON public.idea_files FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_files.idea_id AND ideas.user_id = auth.uid())
);

-- Policies for contact_requests
CREATE POLICY "contact_requests_insert_public" ON public.contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_requests_select_own_ideas" ON public.contact_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = contact_requests.idea_id AND ideas.user_id = auth.uid())
  OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
