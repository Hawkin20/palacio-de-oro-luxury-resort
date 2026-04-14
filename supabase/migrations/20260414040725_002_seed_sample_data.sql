/*
  # Seed sample data for Palacio de Oro
  
  ## Data Populated
  - Sample rooms and cottages with descriptions and amenities
  - Restaurant menu items across all categories
  - Featured items and bestsellers highlighted
  - Diverse pricing reflecting luxury experience
*/

-- Seed rooms
INSERT INTO rooms (name, room_type, price_per_night, capacity, status, image_url, description, amenities) VALUES
('Habitación Estándar', 'standard', 150, 2, 'available', 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=600', 'Comfortable room with modern amenities and city views', ARRAY['WiFi', 'AC', 'Flat-screen TV', 'Private bathroom', 'Desk']),
('Habitación Deluxe', 'deluxe', 250, 2, 'available', 'https://images.pexels.com/photos/3651286/pexels-photo-3651286.jpeg?auto=compress&cs=tinysrgb&w=600', 'Spacious deluxe room with premium furnishings and balcony', ARRAY['WiFi', 'AC', '42" Smart TV', 'Luxury bathroom', 'Work area', 'Balcony']),
('Suite Premium', 'suite', 400, 4, 'available', 'https://images.pexels.com/photos/1454496/pexels-photo-1454496.jpeg?auto=compress&cs=tinysrgb&w=600', 'Elegant suite with separate living area and master bedroom', ARRAY['WiFi', 'AC', 'Kitchenette', 'Luxury bathroom', 'Living room', 'Balcony', 'Mini-bar']),
('Villa de Lujo', 'luxury_villa', 750, 6, 'available', 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600', 'Exclusive villa with private infinity pool and garden', ARRAY['WiFi', 'Private pool', 'Full kitchen', 'Multiple bedrooms', 'Living area', 'Private terrace', 'Butler service']);

-- Seed cottages
INSERT INTO cottages (name, cottage_type, price_per_night, capacity, status, image_url, description, amenities) VALUES
('Cabaña Pequeña', 'small', 120, 2, 'available', 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=600', 'Cozy cottage perfect for couples', ARRAY['WiFi', 'AC', 'Private porch', 'Bathroom', 'Mini-kitchen']),
('Cabaña Familiar', 'family', 280, 4, 'available', 'https://images.pexels.com/photos/1454496/pexels-photo-1454496.jpeg?auto=compress&cs=tinysrgb&w=600', 'Spacious cottage ideal for families', ARRAY['WiFi', 'AC', 'Full kitchen', 'Multiple rooms', 'Garden', 'Private patio']),
('Cabaña Barkada', 'barkada', 350, 8, 'available', 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600', 'Large cottage perfect for group gatherings', ARRAY['WiFi', 'AC', 'Full kitchen', 'Multiple bedrooms', 'Large dining area', 'Garden with BBQ', 'Game room']);

-- Seed menu items - Appetizers
INSERT INTO menu_items (name, category, description, price, image_url, is_featured, is_bestseller, available) VALUES
('Camarones al Ajillo', 'appetizers', 'Succulent shrimp sautéed with garlic and butter', 18, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600', true, true, true),
('Tabla de Quesos Premium', 'appetizers', 'Selection of imported Spanish and European cheeses', 22, 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=600', true, false, true),
('Jamón Ibérico con Melón', 'appetizers', 'Thinly sliced Iberian ham with fresh melon', 25, 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=600', false, true, true),
('Croquetas de Jamón', 'appetizers', 'Golden fried ham croquettes with aioli', 12, 'https://images.pexels.com/photos/5737455/pexels-photo-5737455.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true);

-- Seed menu items - Main Course
INSERT INTO menu_items (name, category, description, price, image_url, is_featured, is_bestseller, available) VALUES
('Pato a la Naranja', 'main_course', 'Succulent duck breast with orange reduction', 38, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600', true, true, true),
('Costillas de Cordero', 'main_course', 'Lamb ribs with Mediterranean herbs and red wine sauce', 42, 'https://images.pexels.com/photos/5737455/pexels-photo-5737455.jpeg?auto=compress&cs=tinysrgb&w=600', true, false, true),
('Filete de Res', 'main_course', 'Prime beef steak with truffle butter', 48, 'https://images.pexels.com/photos/2723832/pexels-photo-2723832.jpeg?auto=compress&cs=tinysrgb&w=600', false, true, true),
('Pechuga de Pollo Rellena', 'main_course', 'Chicken breast stuffed with jamón and cheese', 32, 'https://images.pexels.com/photos/5737455/pexels-photo-5737455.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true);

-- Seed menu items - Seafood
INSERT INTO menu_items (name, category, description, price, image_url, is_featured, is_bestseller, available) VALUES
('Paella a la Valenciana', 'seafood', 'Classic Spanish paella with seafood and saffron rice', 45, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600', true, true, true),
('Lubina a la Sal', 'seafood', 'Whole sea bass roasted in salt crust', 50, 'https://images.pexels.com/photos/2284163/pexels-photo-2284163.jpeg?auto=compress&cs=tinysrgb&w=600', true, false, true),
('Camarones Jumbo a la Parrilla', 'seafood', 'Grilled jumbo shrimp with lemon and herbs', 42, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600', false, true, true),
('Ceviche Peruano', 'seafood', 'Fresh fish cured in citrus with avocado', 28, 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true);

-- Seed menu items - Grilled
INSERT INTO menu_items (name, category, description, price, image_url, is_featured, is_bestseller, available) VALUES
('Carne Asada Premium', 'grilled', 'Premium grilled beef with charred vegetables', 52, 'https://images.pexels.com/photos/2723832/pexels-photo-2723832.jpeg?auto=compress&cs=tinysrgb&w=600', true, true, true),
('Pinchos Morunos', 'grilled', 'Marinated meat skewers with Spanish spices', 28, 'https://images.pexels.com/photos/5737455/pexels-photo-5737455.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true),
('Vegetales a la Parrilla', 'grilled', 'Selection of grilled vegetables with garlic oil', 18, 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true);

-- Seed menu items - Desserts
INSERT INTO menu_items (name, category, description, price, image_url, is_featured, is_bestseller, available) VALUES
('Flan Español', 'desserts', 'Silky caramel custard, a Spanish classic', 12, 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=600', true, true, true),
('Churros con Chocolate', 'desserts', 'Crispy churros with thick hot chocolate', 14, 'https://images.pexels.com/photos/5737455/pexels-photo-5737455.jpeg?auto=compress&cs=tinysrgb&w=600', true, false, true),
('Tiramisú Italiano', 'desserts', 'Layers of mascarpone cream and espresso', 13, 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=600', false, true, true),
('Tarta de Santiago', 'desserts', 'Almond cake with powdered sugar', 11, 'https://images.pexels.com/photos/5737455/pexels-photo-5737455.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true);

-- Seed menu items - Cocktails
INSERT INTO menu_items (name, category, description, price, image_url, is_featured, is_bestseller, available) VALUES
('Sangria Premium', 'cocktails', 'Red wine with fresh fruit and brandy', 16, 'https://images.pexels.com/photos/3407817/pexels-photo-3407817.jpeg?auto=compress&cs=tinysrgb&w=600', true, true, true),
('Mojito de la Casa', 'cocktails', 'Rum, mint, lime, and house blend', 15, 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true),
('Margarita de Oro', 'cocktails', 'Tequila, triple sec, lime with gold shimmer', 18, 'https://images.pexels.com/photos/3407817/pexels-photo-3407817.jpeg?auto=compress&cs=tinysrgb&w=600', true, true, true),
('Old Fashioned Español', 'cocktails', 'Brandy, bitters, and Spanish twist', 17, 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true);

-- Seed menu items - Wine
INSERT INTO menu_items (name, category, description, price, image_url, is_featured, is_bestseller, available) VALUES
('Rioja Reserva', 'wine', 'Full-bodied red wine from Spain''s premium region', 45, 'https://images.pexels.com/photos/3407817/pexels-photo-3407817.jpeg?auto=compress&cs=tinysrgb&w=600', true, false, true),
('Albariño Blanco', 'wine', 'Crisp white wine perfect with seafood', 38, 'https://images.pexels.com/photos/3407817/pexels-photo-3407817.jpeg?auto=compress&cs=tinysrgb&w=600', true, false, true),
('Cava Brut', 'wine', 'Spanish sparkling wine for celebrations', 32, 'https://images.pexels.com/photos/3407817/pexels-photo-3407817.jpeg?auto=compress&cs=tinysrgb&w=600', false, true, true),
('Tempranillo Premium', 'wine', 'Bold red with dark fruit notes', 50, 'https://images.pexels.com/photos/3407817/pexels-photo-3407817.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true);

-- Seed menu items - Non-Alcoholic
INSERT INTO menu_items (name, category, description, price, image_url, is_featured, is_bestseller, available) VALUES
('Agua Fresca de Jamaica', 'non_alcoholic', 'Refreshing hibiscus flower drink', 8, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600', true, true, true),
('Jugo de Naranja Recién Exprimido', 'non_alcoholic', 'Fresh squeezed orange juice', 7, 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true),
('Café Espresso', 'non_alcoholic', 'Premium Italian espresso', 5, 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true),
('Agua con Limón Premium', 'non_alcoholic', 'Sparkling water with fresh lime', 6, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600', false, false, true);
