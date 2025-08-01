CREATE OR REPLACE FUNCTION mint_collectible_atomic(
  p_user_id UUID,
  p_collectible_id UUID,
  p_mint_price INTEGER,
  p_token_id TEXT
) RETURNS JSON AS $$
DECLARE
  v_user_points INTEGER;
  v_current_supply INTEGER;
  v_total_supply INTEGER;
BEGIN
  BEGIN
    SELECT p.points, ci.current_supply, ci.total_supply
    INTO v_user_points, v_current_supply, v_total_supply
    FROM profiles p, collectible_items ci
    WHERE p.id = p_user_id AND ci.id = p_collectible_id
    FOR UPDATE; -- Lock rows to prevent race conditions

    IF v_user_points < p_mint_price THEN
      RETURN json_build_object('success', false, 'error', 'Insufficient beetz');
    END IF;

    IF v_current_supply >= v_total_supply THEN
      RETURN json_build_object('success', false, 'error', 'Item sold out');
    END IF;

    INSERT INTO user_collectibles (user_id, collectible_id, token_id)
    VALUES (p_user_id, p_collectible_id, p_token_id);

    UPDATE profiles 
    SET points = points - p_mint_price
    WHERE id = p_user_id;

    UPDATE collectible_items
    SET current_supply = current_supply + 1
    WHERE id = p_collectible_id;

    RETURN json_build_object('success', true);

  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
  END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION purchase_marketplace_item_atomic(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_seller_id UUID,
  p_user_collectible_id UUID,
  p_price_beetz INTEGER,
  p_platform_fee_beetz INTEGER
) RETURNS JSON AS $$
DECLARE
  v_buyer_points INTEGER;
  v_seller_points INTEGER;
  v_listing_active BOOLEAN;
BEGIN
  BEGIN
    SELECT bp.points, sp.points, ml.is_active
    INTO v_buyer_points, v_seller_points, v_listing_active
    FROM profiles bp, profiles sp, marketplace_listings ml
    WHERE bp.id = p_buyer_id 
      AND sp.id = p_seller_id 
      AND ml.id = p_listing_id
    FOR UPDATE; -- Lock rows to prevent race conditions

    IF NOT v_listing_active THEN
      RETURN json_build_object('success', false, 'error', 'Listing no longer active');
    END IF;

    IF v_buyer_points < p_price_beetz THEN
      RETURN json_build_object('success', false, 'error', 'Insufficient beetz');
    END IF;

    UPDATE user_collectibles
    SET user_id = p_buyer_id,
        is_listed_for_sale = false,
        sale_price_beetz = null
    WHERE id = p_user_collectible_id;

    UPDATE marketplace_listings
    SET is_active = false
    WHERE id = p_listing_id;

    INSERT INTO marketplace_sales (
      listing_id, buyer_id, seller_id, price_beetz, platform_fee_beetz
    ) VALUES (
      p_listing_id, p_buyer_id, p_seller_id, p_price_beetz, p_platform_fee_beetz
    );

    UPDATE profiles
    SET points = points - p_price_beetz
    WHERE id = p_buyer_id;

    UPDATE profiles
    SET points = points + (p_price_beetz - p_platform_fee_beetz)
    WHERE id = p_seller_id;

    RETURN json_build_object('success', true);

  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
  END;
END;
$$ LANGUAGE plpgsql;
