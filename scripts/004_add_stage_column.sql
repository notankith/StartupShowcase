-- Add stage column to ideas table
ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'Ideation';

ALTER TABLE public.ideas
  ADD CONSTRAINT ideas_stage_check CHECK (stage IN ('Ideation','Prototype','MVP','Market-ready'));

COMMENT ON COLUMN public.ideas.stage IS 'Current development stage of the startup idea';
