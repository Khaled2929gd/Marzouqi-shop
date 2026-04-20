-- Swift Shoe Shop - Seed data
-- Run after 01_schema_and_policies.sql

insert into public.products (
  name,
  brand,
  description,
  price,
  original_price,
  image_url,
  images,
  category,
  sizes,
  rating,
  review_count,
  stock,
  featured
)
select
  seed.name,
  seed.brand,
  seed.description,
  seed.price,
  seed.original_price,
  seed.image_url,
  seed.images,
  seed.category,
  seed.sizes,
  seed.rating,
  seed.review_count,
  seed.stock,
  seed.featured
from (
  values
    (
      'Air Jordan 1 Retro High',
      'Nike',
      'Model high-top iconique b cuir premium w confort mzyan kul nhar.',
      189.99::numeric,
      219.99::numeric,
      '/images/shoe-1.png',
      jsonb_build_array('/images/shoe-1.png'),
      'Basket',
      jsonb_build_array(38, 39, 40, 41, 42, 43),
      4.80::numeric,
      324,
      22,
      true
    ),
    (
      'Yeezy Boost 350 V2',
      'Adidas',
      'Upper knit khfif m3a cushioning Boost bach tkon merta7 tul nhar.',
      239.99::numeric,
      279.99::numeric,
      '/images/shoe-2.png',
      jsonb_build_array('/images/shoe-2.png'),
      'Style yawmiy',
      jsonb_build_array(39, 40, 41, 42, 43, 44),
      4.70::numeric,
      218,
      18,
      true
    ),
    (
      'Dunk Low Panda',
      'Nike',
      'Colorway low-top classique, sahl tlebso m3a ay look dyal nhar.',
      129.99::numeric,
      null::numeric,
      '/images/shoe-3.png',
      jsonb_build_array('/images/shoe-3.png'),
      'Style yawmiy',
      jsonb_build_array(37, 38, 39, 40, 41, 42),
      4.60::numeric,
      410,
      31,
      false
    ),
    (
      'New Balance 550',
      'New Balance',
      'Style vintage inspire mn terrain, b confort li kaynfa3 l isti3mal yawmiy.',
      139.99::numeric,
      159.99::numeric,
      '/images/shoe-4.png',
      jsonb_build_array('/images/shoe-4.png'),
      'Casual',
      jsonb_build_array(38, 39, 40, 41, 42, 43),
      4.50::numeric,
      167,
      27,
      false
    ),
    (
      'Air Max 97 Silver Bullet',
      'Nike',
      'Upper reflectif b layers m3a air unit kamla bach yban style.',
      209.99::numeric,
      239.99::numeric,
      '/images/shoe-5.png',
      jsonb_build_array('/images/shoe-5.png'),
      'Course',
      jsonb_build_array(39, 40, 41, 42, 43, 44),
      4.65::numeric,
      142,
      14,
      true
    ),
    (
      'Converse Chuck 70 High',
      'Converse',
      'Canvas classique high-top b cushioning ahsan w details retro.',
      89.99::numeric,
      null::numeric,
      '/images/shoe-6.png',
      jsonb_build_array('/images/shoe-6.png'),
      'Casual',
      jsonb_build_array(36, 37, 38, 39, 40, 41, 42),
      4.40::numeric,
      198,
      45,
      false
    ),
    (
      'Gel-Kayano 30',
      'ASICS',
      'Chaussure stability l running, b foam n3im w transition smooth.',
      179.99::numeric,
      null::numeric,
      '/images/shoe-7.png',
      jsonb_build_array('/images/shoe-7.png'),
      'Course',
      jsonb_build_array(39, 40, 41, 42, 43),
      4.75::numeric,
      121,
      16,
      true
    ),
    (
      'Puma Suede Classic',
      'Puma',
      'Icone streetwear b suede n3im w lignes retro nadfin.',
      99.99::numeric,
      119.99::numeric,
      '/images/shoe-8.png',
      jsonb_build_array('/images/shoe-8.png'),
      'Style yawmiy',
      jsonb_build_array(38, 39, 40, 41, 42, 43),
      4.35::numeric,
      87,
      24,
      false
    )
) as seed(
  name,
  brand,
  description,
  price,
  original_price,
  image_url,
  images,
  category,
  sizes,
  rating,
  review_count,
  stock,
  featured
)
where not exists (
  select 1
  from public.products p
  where lower(p.name) = lower(seed.name)
    and lower(p.brand) = lower(seed.brand)
);

-- Optional sample orders (insert only when orders table is empty)
do $$
declare
  p1 record;
  p2 record;
begin
  if exists (select 1 from public.orders) then
    return;
  end if;

  select id, name, image_url, price into p1 from public.products order by id asc limit 1;
  select id, name, image_url, price into p2 from public.products order by id asc offset 1 limit 1;

  if p1.id is null or p2.id is null then
    return;
  end if;

  insert into public.orders (
    customer_name,
    customer_email,
    customer_phone,
    address,
    city,
    status,
    items,
    subtotal,
    delivery,
    discount,
    total
  )
  values
    (
      'Alex Carter',
      'alex.carter@example.com',
      '+1 555 018 472',
      '25 Market Street, 10001',
      'New York',
      'processing',
      jsonb_build_array(
        jsonb_build_object(
          'productId', p1.id,
          'productName', p1.name,
          'productImage', p1.image_url,
          'size', 42,
          'quantity', 1,
          'price', p1.price::numeric
        )
      ),
      p1.price::numeric,
      5.00,
      0.00,
      (p1.price::numeric + 5.00)
    ),
    (
      'Maya Johnson',
      'maya.johnson@example.com',
      '+1 555 019 731',
      '148 Lake Avenue, 94105',
      'San Francisco',
      'pending',
      jsonb_build_array(
        jsonb_build_object(
          'productId', p2.id,
          'productName', p2.name,
          'productImage', p2.image_url,
          'size', 41,
          'quantity', 2,
          'price', p2.price::numeric
        )
      ),
      (p2.price::numeric * 2),
      5.00,
      10.00,
      ((p2.price::numeric * 2) + 5.00 - 10.00)
    );
end $$;
