-- Update the existing function to work better with new structure
CREATE OR REPLACE FUNCTION public.update_weekly_leaderboard(profile_id uuid, xp_gained integer DEFAULT 0, quiz_points integer DEFAULT 0, duel_win boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_week_start DATE;
  total_points INTEGER;
BEGIN
  -- Get current week start (Monday)
  current_week_start := date_trunc('week', CURRENT_DATE)::DATE;
  
  -- Upsert leaderboard entry
  INSERT INTO public.weekly_leaderboards (user_id, week_start_date, xp_earned, quiz_score, duels_won)
  VALUES (profile_id, current_week_start, xp_gained, quiz_points, CASE WHEN duel_win THEN 1 ELSE 0 END)
  ON CONFLICT (user_id, week_start_date)
  DO UPDATE SET
    xp_earned = weekly_leaderboards.xp_earned + xp_gained,
    quiz_score = weekly_leaderboards.quiz_score + quiz_points,
    duels_won = weekly_leaderboards.duels_won + CASE WHEN duel_win THEN 1 ELSE 0 END,
    updated_at = now();
  
  -- Calculate total score and update
  SELECT xp_earned + quiz_score + (duels_won * 100) INTO total_points
  FROM public.weekly_leaderboards 
  WHERE user_id = profile_id AND week_start_date = current_week_start;
  
  -- Update total score
  UPDATE public.weekly_leaderboards
  SET total_score = total_points
  WHERE user_id = profile_id AND week_start_date = current_week_start;
END;
$$;

-- Create a trigger to automatically update weekly leaderboard when XP is awarded
CREATE OR REPLACE FUNCTION public.auto_update_weekly_leaderboard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update weekly leaderboard when XP changes
  IF NEW.xp != OLD.xp THEN
    PERFORM public.update_weekly_leaderboard(NEW.id, NEW.xp - OLD.xp, 0, false);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_weekly_on_xp_change ON public.profiles;
CREATE TRIGGER update_weekly_on_xp_change
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_weekly_leaderboard();