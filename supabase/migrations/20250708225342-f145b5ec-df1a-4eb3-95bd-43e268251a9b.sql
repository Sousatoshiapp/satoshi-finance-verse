-- Update user level if XP indicates they should be at a higher level
UPDATE profiles 
SET level = calculate_user_level(xp)
WHERE level != calculate_user_level(xp);