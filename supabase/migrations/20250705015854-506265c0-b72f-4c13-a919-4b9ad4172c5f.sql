-- Adiciona pacotes de Beetz para venda com Stripe
INSERT INTO public.products (name, description, image_url, price, category, rarity, level_required, effects, is_available, duration_hours) VALUES

-- Pacotes de Beetz com preços em centavos para Stripe (BRL)
('Pacote Starter Beetz', '100 Beetz para começar sua jornada financeira.', '/src/assets/boosts/mega-points-amplifier.jpg', 990, 'beetz', 'common', 1, '{"beetz_amount": 100}', true, null),
('Pacote Pro Beetz', '500 Beetz para acelerar seu progresso.', '/src/assets/boosts/neural-xp-booster.jpg', 3990, 'beetz', 'uncommon', 1, '{"beetz_amount": 500}', true, null),
('Pacote Elite Beetz', '1.000 Beetz para traders experientes.', '/src/assets/boosts/quantum-energy-drink.jpg', 6990, 'beetz', 'rare', 1, '{"beetz_amount": 1000}', true, null),
('Pacote Master Beetz', '2.500 Beetz para dominação total.', '/src/assets/boosts/wisdom-elixir.jpg', 14990, 'beetz', 'epic', 1, '{"beetz_amount": 2500}', true, null),
('Pacote Legend Beetz', '5.000 Beetz para os verdadeiros lendários.', '/src/assets/boosts/streak-shield.jpg', 24990, 'beetz', 'legendary', 1, '{"beetz_amount": 5000}', true, null);