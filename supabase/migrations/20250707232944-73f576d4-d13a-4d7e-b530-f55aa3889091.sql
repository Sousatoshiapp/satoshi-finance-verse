-- Fix trophy image URLs to use correct paths
UPDATE public.tournaments 
SET trophy_image_url = CASE 
  WHEN theme = 'neural' THEN '/src/assets/trophies/neural-crown.jpg'
  WHEN theme = 'quantum' THEN '/src/assets/trophies/quantum-sphere.jpg'  
  WHEN theme = 'crypto' THEN '/src/assets/trophies/genesis-crystal.jpg'
  WHEN theme = 'empire' THEN '/src/assets/trophies/empire-throne.jpg'
  WHEN theme = 'matrix' THEN '/src/assets/trophies/matrix-core.jpg'
  ELSE trophy_image_url
END;