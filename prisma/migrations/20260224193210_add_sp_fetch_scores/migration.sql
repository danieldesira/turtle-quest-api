CREATE OR REPLACE FUNCTION fetch_scores(
  outcome_param text,
  juniors_only boolean,
  items integer,
  page integer
)
RETURNS TABLE (
  player_name text,
  profile_pic_r2_key text,
  player_age integer,
  level integer,
  duration integer,
  points integer,
  outcome text,
  created_at timestamp
) AS $$
BEGIN
  -- sanitize inputs
  IF items IS NULL OR items <= 0 THEN
    items := 20;
  ELSIF items > 100 THEN
    items := 100;
  END IF;

  IF page IS NULL OR page <= 0 THEN
    page := 1;
  END IF;

  RETURN QUERY
  SELECT
    p.name::text,
    p.profile_pic_r2_key::text,
    EXTRACT(YEAR FROM age(p.date_of_birth))::integer,
    s.level::integer,
    s.duration,
    s.points,
    s.outcome::text,
    s.created_at
  FROM public.scores s
  JOIN public.players p ON s.player_id = p.id
  WHERE
    (outcome_param IS NULL OR s.outcome::text = outcome_param)
    AND (juniors_only = false OR EXTRACT(YEAR FROM age(p.date_of_birth)) < 16)
  ORDER BY s.outcome::text, s.level DESC, s.points DESC, s.created_at DESC
  LIMIT items
  OFFSET (page - 1) * items;
END;
$$ LANGUAGE plpgsql;