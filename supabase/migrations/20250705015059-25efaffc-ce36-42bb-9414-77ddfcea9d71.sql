-- Adiciona 27 novos acessórios cyberpunk 3D à loja
INSERT INTO public.products (name, description, image_url, price, category, rarity, level_required, effects, is_available, duration_hours) VALUES

-- Headgear & Face
('Neural AR Visor', 'Visor de realidade aumentada que projeta dados financeiros diretamente na visão.', '/src/assets/accessories/neural-visor.jpg', 120, 'accessory', 'rare', 8, '{"data_overlay": true, "market_analysis": 25}', true, null),
('Cyber Protection Mask', 'Máscara cibernética com filtros de ar e interface neural.', '/src/assets/accessories/cyber-mask.jpg', 85, 'accessory', 'uncommon', 6, '{"protection": 20, "stealth_bonus": 15}', true, null),
('Bio Scanner Goggles', 'Óculos com múltiplas lentes para análise biométrica avançada.', '/src/assets/accessories/bio-scanner.jpg', 95, 'accessory', 'rare', 7, '{"analysis_bonus": 30, "detection_range": 200}', true, null),
('Data Processing Crown', 'Coroa real feita de cristais de dados flutuantes.', '/src/assets/accessories/data-crown.jpg', 300, 'accessory', 'legendary', 15, '{"processing_power": 50, "royal_status": true}', true, null),
('Cyber Mohawk Implant', 'Implante capilar com fibras óticas brilhantes.', '/src/assets/accessories/cyber-mohawk.jpg', 65, 'accessory', 'uncommon', 4, '{"style_points": 25, "attitude_boost": 20}', true, null),

-- Body Armor & Clothing
('Quantum Chest Armor', 'Armadura torácica com núcleos de energia quântica.', '/src/assets/accessories/quantum-chest-armor.jpg', 180, 'accessory', 'epic', 12, '{"defense": 40, "energy_regen": 15}', true, null),
('Neon Light Jacket', 'Jaqueta de couro com tiras LED integradas.', '/src/assets/accessories/neon-jacket.jpg', 110, 'accessory', 'rare', 5, '{"visibility": 30, "cool_factor": 25}', true, null),
('Holographic Cape', 'Capa translúcida com padrões digitais fluindo.', '/src/assets/accessories/holo-cape.jpg', 140, 'accessory', 'epic', 10, '{"stealth_mode": true, "dramatic_effect": 35}', true, null),
('Stealth Cloaking Device', 'Dispositivo de camuflagem com padrões digitais.', '/src/assets/accessories/stealth-cloak.jpg', 220, 'accessory', 'epic', 14, '{"invisibility": 60, "detection_avoidance": 40}', true, null),

-- Arms & Hands
('Power Combat Gauntlets', 'Luvas blindadas com garras de energia.', '/src/assets/accessories/power-gauntlets.jpg', 100, 'accessory', 'rare', 9, '{"attack_power": 35, "grip_strength": 50}', true, null),
('Energy Shield Generator', 'Gerador de escudo montado no pulso.', '/src/assets/accessories/energy-shield.jpg', 160, 'accessory', 'epic', 11, '{"shield_strength": 45, "energy_absorption": 30}', true, null),
('Data Interface Bracelet', 'Computador de pulso com display holográfico.', '/src/assets/accessories/data-bracelet.jpg', 75, 'accessory', 'uncommon', 3, '{"data_access": true, "hacking_bonus": 20}', true, null),

-- Legs & Feet
('Anti-Gravity Boots', 'Botas com propulsores anti-gravidade.', '/src/assets/accessories/gravity-boots.jpg', 150, 'accessory', 'epic', 10, '{"flight_mode": true, "speed_boost": 40}', true, null),
('Exoskeleton Boots', 'Botas com reforço mecânico nas pernas.', '/src/assets/accessories/exo-boots.jpg', 90, 'accessory', 'rare', 7, '{"jump_height": 50, "stability": 30}', true, null),

-- Back & Wings
('Mechanical Cyber Wings', 'Asas mecânicas com penas holográficas.', '/src/assets/accessories/cyber-wings.jpg', 250, 'accessory', 'legendary', 16, '{"flight_capability": true, "angel_mode": 60}', true, null),
('Tech Command Backpack', 'Mochila futurística com arrays de antena.', '/src/assets/accessories/tech-backpack.jpg', 120, 'accessory', 'rare', 8, '{"storage_capacity": 40, "communication_range": 100}', true, null),

-- Neck & Collar
('Neural Interface Collar', 'Colar com nós de interface cerebral.', '/src/assets/accessories/neural-collar.jpg', 135, 'accessory', 'epic', 9, '{"neural_boost": 35, "mind_link": true}', true, null),

-- Weapons & Tools
('Plasma Energy Sword', 'Espada de energia com lâmina de plasma.', '/src/assets/accessories/plasma-sword.jpg', 200, 'accessory', 'epic', 13, '{"energy_damage": 55, "cutting_power": 70}', true, null),
('Power Core Utility Belt', 'Cinto utilitário com núcleos de energia.', '/src/assets/accessories/power-belt.jpg', 80, 'accessory', 'uncommon', 5, '{"utility_access": true, "power_storage": 25}', true, null),

-- Jewelry & Small Items
('Holographic Earrings', 'Brincos digitais com efeitos de partículas.', '/src/assets/accessories/holo-earrings.jpg', 45, 'accessory', 'common', 2, '{"style_enhancement": 15, "holo_effects": true}', true, null),
('Quantum Particle Rings', 'Anéis com aceleradores de partículas miniaturizados.', '/src/assets/accessories/quantum-rings.jpg', 110, 'accessory', 'rare', 8, '{"quantum_manipulation": 30, "particle_effects": true}', true, null),
('Time Dilator Watch', 'Relógio que dobra o espaço-tempo.', '/src/assets/accessories/time-watch.jpg', 280, 'accessory', 'legendary', 18, '{"time_manipulation": true, "temporal_effects": 50}', true, null),

-- Implants & Body Mods
('Cyber Optic Implant', 'Implante ocular robótico com zoom.', '/src/assets/accessories/cyber-eye.jpg', 170, 'accessory', 'epic', 12, '{"vision_enhancement": 45, "targeting_system": true}', true, null),
('Spinal Neural Implant', 'Implante espinhal com conectores neurais.', '/src/assets/accessories/spinal-implant.jpg', 320, 'accessory', 'legendary', 20, '{"neural_processing": 60, "superhuman_reflexes": true}', true, null),
('Glowing Circuit Tattoos', 'Tatuagens com circuitos que brilham.', '/src/assets/accessories/cyber-tattoos.jpg', 55, 'accessory', 'uncommon', 3, '{"circuit_display": true, "tech_aesthetics": 20}', true, null),

-- Special Effects
('Digital Energy Aura', 'Campo de energia digital que envolve o usuário.', '/src/assets/accessories/digital-aura.jpg', 240, 'accessory', 'legendary', 15, '{"energy_field": 50, "intimidation_factor": 40}', true, null),
('Holographic Companion Pet', 'Pet robô com pelagem holográfica.', '/src/assets/accessories/holo-pet.jpg', 90, 'accessory', 'rare', 6, '{"companionship": true, "luck_bonus": 15}', true, null);