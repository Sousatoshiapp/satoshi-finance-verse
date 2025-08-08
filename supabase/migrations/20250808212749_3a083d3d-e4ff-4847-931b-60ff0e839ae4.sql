-- Fix the get_dashboard_data_optimized function - correct column reference
CREATE OR REPLACE FUNCTION get_dashboard_data_optimized(user_uuid uuid)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    profile_data jsonb;
    district_data jsonb;
    team_data jsonb;
    subscription_data jsonb;
BEGIN
    -- Get profile data
    SELECT jsonb_build_object(
        'id', p.id,
        'user_id', p.user_id,
        'nickname', p.nickname,
        'avatar_url', p.avatar_url,
        'level', p.level,
        'xp', p.xp,
        'beetz', p.beetz,
        'streak', p.streak,
        'district_id', p.district_id,
        'total_wins', p.total_wins,
        'total_losses', p.total_losses,
        'created_at', p.created_at
    ) INTO profile_data
    FROM profiles p
    WHERE p.user_id = user_uuid;

    -- Get district data if user has a district
    SELECT jsonb_build_object(
        'id', d.id,
        'name', d.name,
        'theme', d.theme,
        'description', d.description
    ) INTO district_data
    FROM districts d
    JOIN profiles p ON p.district_id = d.id
    WHERE p.user_id = user_uuid;

    -- Get team data if user is in a team - FIXED: use dt.name instead of dt.team_name
    SELECT jsonb_build_object(
        'id', dt.id,
        'team_name', dt.name,
        'role', dtm.role,
        'joined_at', dtm.joined_at
    ) INTO team_data
    FROM district_team_members dtm
    JOIN district_teams dt ON dt.id = dtm.team_id
    JOIN profiles p ON p.id = dtm.user_id
    WHERE p.user_id = user_uuid;

    -- Get subscription data
    SELECT jsonb_build_object(
        'id', s.id,
        'plan', s.plan,
        'status', s.status,
        'current_period_start', s.current_period_start,
        'current_period_end', s.current_period_end
    ) INTO subscription_data
    FROM subscriptions s
    JOIN profiles p ON p.id = s.user_id
    WHERE p.user_id = user_uuid AND s.status = 'active';

    -- Build final result
    result := jsonb_build_object(
        'profile', COALESCE(profile_data, '{}'::jsonb),
        'district', COALESCE(district_data, '{}'::jsonb),
        'team', COALESCE(team_data, '{}'::jsonb),
        'subscription', COALESCE(subscription_data, '{}'::jsonb)
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;