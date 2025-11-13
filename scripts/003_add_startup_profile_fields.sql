-- Add startup profile enhancement columns
ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS mentor_assigned TEXT,
  ADD COLUMN IF NOT EXISTS achievements TEXT,
  ADD COLUMN IF NOT EXISTS skills_needed TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS call_to_action TEXT,
  ADD COLUMN IF NOT EXISTS founder_program TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN public.ideas.mentor_assigned IS 'Mentor assigned to the startup';
COMMENT ON COLUMN public.ideas.achievements IS 'Achievements or traction summary';
COMMENT ON COLUMN public.ideas.skills_needed IS 'Array of skills the startup needs';
COMMENT ON COLUMN public.ideas.call_to_action IS 'Custom call to action text for detail page';
COMMENT ON COLUMN public.ideas.founder_program IS 'Academic year/program of founders';
COMMENT ON COLUMN public.ideas.logo_url IS 'Logo image URL for the startup';
