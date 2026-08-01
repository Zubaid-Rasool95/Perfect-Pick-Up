-- =============================================================================
-- Perfect Pick Up — demo seed data
-- Safe to re-run: everything keys off the vendor slug.
-- =============================================================================

insert into public.vendors
  (slug, name, tagline, cuisine, description, hero_image_url, address_line, city, postcode,
   lat, lng, phone, rating, rating_count, price_level, prep_time_mins, min_order_cents,
   service_fee_cents, is_active, is_featured)
values
  ('lartisan-brasserie', 'L''Artisan Brasserie', 'Modern French, wood-fired',
   'French',
   'A candlelit room off West Adams where the grill never cools. Dry-aged beef, hand-rolled pasta, and a wine list with opinions.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAHif4AVCZKJ3BeAF1s_0OXzZgltCNW3CAgowOe-C_cPjXZ1C7DUF8LKrdT1W04u4i0ggEGjNyDUeRWOogCZ2lkrxAHygict3wB5PlUjUFzP0gYgEk0c0Rm8z2asmMWvMJ3adN_w4a25o01TgeLiupWhPzmLXuKEbPtKisJMsohVVD715nSO7hOer1M-_r3ntTpkQvqqgwhH1SE5ZCDmc9TNEwOg-PVshDLGcUdETZNVctL7fk9xRJgIssvZ_MlD9f_i8-BKzcnPOAP',
   '882 West Adams Blvd', 'New York', '10014',
   40.7359, -74.0036, '+1 (212) 555-0182', 4.9, 1284, 4, 25, 2500, 850, true, true),

  ('kaito-omakase', 'Kaito Omakase', 'Twelve seats, one menu',
   'Japanese',
   'Edomae sushi counter hidden behind an unmarked door. Fish flown in four mornings a week.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAYX3vvTaLW4RAK5Ho9jhZdTqO9paxjCK2yiecfGubQwZTXHkd2YCG0N6cxjwl2iH_kMsew4PIjgdvRjhXPtW-S-RDteFTJ8JRYbkyJwBvBpfk7Ng0Nl03tngHWbLTbGNW4EaV0tQElthz9Y7C5fKQ5YuSKFV0kvKD-GS0y38nIwKhqkEqnrG7yMPHTtEkXNeJcB-wNwUyCawTUDUZa22R2Z9pbcl31GMro4O0sznZh3zShSYHCbNbLW92sYfZ5Gb9lTE5TWzQ9UPBl',
   '17 Cornelia Street', 'New York', '10014',
   40.7318, -74.0029, '+1 (212) 555-0110', 4.8, 642, 4, 35, 4000, 1200, true, true),

  ('roselle-trattoria', 'Roselle Trattoria', 'Pasta, made at 6am',
   'Italian',
   'Family-run since 1974. Everything rolled, cut, and sauced the morning you eat it.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAcPcUg0kvLKjrBT-BQePGn5PaMsfcWRkdNaVXxAdPpD5_w0fGevFlrbJblEcRxMIto9K8iUEEpR3giiNssfG4ePf7Qc5xyDJ95ZoBm-jJ0Y4ZILNVqmO6byyAhe23dEhQhVX540jPx4yr61amTTMqWjzY2k0wtlom-HB--lmE9JXE_sFOysygtrJjSQvuMjLAUS7Gz7txjxyHM93Ywb4NvQXk9EWK5lr2O5IWQZSAhSDbBTJXe__UXRvTWV8njLFVrG5VydNppMaqB',
   '204 Mulberry Street', 'New York', '10012',
   40.7215, -73.9963, '+1 (212) 555-0147', 4.7, 2130, 3, 20, 1500, 650, true, true),

  ('ember-and-ash', 'Ember & Ash', 'Live fire, nothing else',
   'Steakhouse',
   'Whole-animal butchery over Basque-style coals. The chops are the reason to come.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuArV1bYOlrEZbCNuFarwR4LXyZmbaFDEWI1O3NqhDAhl6bQDgF1tPzByus4Z-iyM3qfD2KC0Ut49Z33xWMqW5qtD-jqEu7Zd3fCIk9JdujU2s35VmqiQkVU0E2dCDTvfWAf0LDCEwj-K7042YHDdVGV5RnnrUaN9gXR7N6g8uDoljiM0A9hBj4vGu0XQkNJxLNryCzeT6dNKF2MA44FX0qNRWzH_JS2Ik-MWag9HGYZpaOO-DBBTb06dCYPtyxZKl4yV6gdOSi16ikA',
   '55 Gansevoort Street', 'New York', '10014',
   40.7395, -74.0079, '+1 (212) 555-0166', 4.9, 878, 4, 30, 3000, 950, true, false),

  ('the-golden-hour', 'The Golden Hour', 'Coastal Mediterranean',
   'Mediterranean',
   'Rooftop dining room with a citrus-heavy menu and a very serious martini programme.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuB5QtsdMgiOpNu73En_JXYHQ6MOI8bY8o8KyTE2jbq1zQ_1W6jWHxJBczj6XM0K0GLfKRWa8XWwaylyChTkonsvO5BBYHP66C7cSmF-r64xMNdY_oR-P7Nanl3oEr31ItwSBRas3fK58at_J5oprOPZiTF5xlSitTNEvrcswFdE1DOKN7jh-v0vUawgN9aRUWwmhlW5Eybl8LIt1Zvl6s1NVPwE8y9r-MnH040M6x3tQKIBAQZnXY_-8lf8QsfwDoy-63IQYrl2OY5-',
   '410 Bowery', 'New York', '10012',
   40.7256, -73.9919, '+1 (212) 555-0193', 4.6, 1547, 3, 22, 2000, 750, true, false),

  ('saffron-house', 'Saffron House', 'North Indian, charcoal tandoor',
   'Indian',
   'Clay-oven breads and slow-simmered curries from a kitchen that has not changed its spice grinder in thirty years.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuB90N-9U9Xo-5a6Iz2iWS58mKlhGC2_3dgiFdFmbrtHHgJjYmirFnmbWG8dnvziBATyvwRCPW7tcwzmlHA4-9dbJ6hTQ3KuyRAF1paaRY3Hblqpvk-Id9aLTzIKisRBoC9CnkXeSs-tWxPzfSv1_TLMWyZZB2FF28yh5ekPjN9sJzZkpeG8VT8wq08SKZ6TE1j1I9WqIaOb1jzO7H3OCXTqrJIlcn6IXkr1OPaF0YPcbR5GLLGLf7dupuPj3ozPtgUCdeJKCQfEVIRt',
   '128 Lexington Avenue', 'New York', '10016',
   40.7443, -73.9821, '+1 (212) 555-0128', 4.8, 3012, 2, 18, 1200, 550, true, false)
on conflict (slug) do nothing;

-- Trading hours: open Tue–Sun, 11:00–23:00.
insert into public.vendor_hours (vendor_id, day_of_week, opens_at, closes_at)
select v.id, d, time '11:00', time '23:00'
from public.vendors v
cross join generate_series(0, 6) as d
where d <> 1
on conflict (vendor_id, day_of_week) do nothing;

-- -----------------------------------------------------------------------------
-- Menus
-- -----------------------------------------------------------------------------
do $$
declare
  v_vendor  uuid;
  v_starters uuid;
  v_mains    uuid;
  v_sides    uuid;
  v_desserts uuid;
begin
  -- ---- L'Artisan Brasserie -------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'lartisan-brasserie';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Starters', 0) returning id into v_starters;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Mains', 1) returning id into v_mains;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Sides', 2) returning id into v_sides;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Desserts', 3) returning id into v_desserts;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, image_url, is_signature, position) values
      (v_vendor, v_starters, 'Steak Tartare', 'Hand-cut sirloin, cured yolk, sourdough crisps.', 2200,
       'https://lh3.googleusercontent.com/aida-public/AB6AXuBFzR8BycyiWE9mPSHrR-cBsNXfI4Qcp6tcp3NaD3s2K1ILDBvKMzUleOwZSJIvlGQxPH18pEOyCh8Ltojn5msAJDypx-6KRfqp_ahK_ECBGU06xxC-vl0i9MKOYOAx5V7sz1nq_gnlEtpyb9vkSq7IQRBKQmXQspr-V2fdCWW_UZn7_BNucrDf2XhNcSOYwrD9QQXdvH4GlvOraSS2qfmR0E0hPoEk5ms-aoSWXGlaaRYHn7DNVgXmwuiDP3lHkB9ZuMRl8QZVREew', false, 0),
      (v_vendor, v_starters, 'Escargots de Bourgogne', 'Garlic-parsley butter, warm baguette.', 1900, null, false, 1),
      (v_vendor, v_mains, 'Truffle Wagyu Burger', 'A5 wagyu, black truffle aioli, aged comté, brioche.', 3400,
       'https://lh3.googleusercontent.com/aida-public/AB6AXuBTnC054VcQ5Vfu8QBsEeeCASDpkmGEbHhVWmsVev_SvksIc9dtxTCkFTFy-0SThWpw0_Egc0OrRHItEMBfd10yM09WdC0v5NC7BhY-tsPvB9umBuAvstr8x8OSIqRV-tbB-wBKzS6u-DOqE6HdR0ZGvpqaC_hV_F8aR-wooT9FwLY4zkv7cDHEnT3z6Fu9kYjgOxcoL_1ec_TX7zLjAScUY_qy6lkPQTQ113P3o1PQ9aqcsfWThnazCQWip684dgUHv0hrJrBdtGhF', true, 0),
      (v_vendor, v_mains, 'Duck à l''Orange', 'Whole roasted leg, bitter orange, pommes purée.', 4200,
       'https://lh3.googleusercontent.com/aida-public/AB6AXuBuHNFwVW3i47S434b1VmBd6dYOZUTnj1-F-JOOxZDvtxHNyFP0txAx0wTJfxIgCl7Lkg8hXZPYHGKo8RpxQlLVIfax4s8zURkGCI8XEWXI-VuhgxqPUrwEasGK8_tp2FnLftD5ETvHdN6dmcgQQuhojovWh7K8B9St1MfJZXfDadZwVpymSgMXAakYNSty6SFQ1Kdc34BAL35lDuMJzkvrQpbSKcwrQfDCiut_Vktn_ue16zhnsyFc6XJw6t3DoIc4jWhbSrvkk8i6', false, 1),
      (v_vendor, v_mains, 'Dover Sole Meunière', 'Filleted tableside-style, brown butter, capers.', 5600, null, false, 2),
      (v_vendor, v_sides, 'Parmesan Truffle Fries', 'Triple-cooked, 24-month parmesan, truffle aioli.', 1200,
       'https://lh3.googleusercontent.com/aida-public/AB6AXuByJyleCqS7G-vA5n6B3o-ksYIHnBQ5UwlEGYnVeqCVKqvCsDZ99RmMbIWOt__WPkU-rJgeH1dtzbz7KC9OhX73q2yj_HgXGEKkshw3ZL6jBGZaRy_psWBtKopdh_dCvxHbIMAafcaiyydU6sVjeDoR6eEtrsYGDiUOAPFj19dgJ7TKG41V1pP-ohicCurnYZ52SPBWP2unLxQ5PJMXxTZQWyCurapRKYYoflMeuE0XICem5TxI1Q73OliqUNp761cM82R1nG21KhRS', true, 0),
      (v_vendor, v_sides, 'Haricots Verts', 'Almond, shallot, brown butter.', 900, null, false, 1),
      (v_vendor, v_desserts, 'Crème Brûlée', 'Tahitian vanilla, torched to order.', 1400, null, false, 0);

    -- Every column is table-qualified: both menu_items and the VALUES alias
    -- expose a `name`, so a bare reference would be ambiguous.
    insert into public.menu_item_options (menu_item_id, option_group, name, price_delta_cents, is_default, position)
    select mi.id, 'Temperature', t.name, 0, t.name = 'Medium Rare', t.pos
    from public.menu_items mi,
         (values ('Rare', 0), ('Medium Rare', 1), ('Medium', 2), ('Well Done', 3)) as t(name, pos)
    where mi.vendor_id = v_vendor and mi.name = 'Truffle Wagyu Burger';

    insert into public.menu_item_options (menu_item_id, option_group, name, price_delta_cents, is_default, position)
    select mi.id, 'Extras', t.name, t.delta, false, t.pos
    from public.menu_items mi,
         (values ('No Onions', 0, 0), ('Extra Aioli', 150, 1), ('Add Foie Gras', 1800, 2)) as t(name, delta, pos)
    where mi.vendor_id = v_vendor and mi.name = 'Truffle Wagyu Burger';
  end if;

  -- ---- Kaito Omakase -------------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'kaito-omakase';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Counter Menu', 0) returning id into v_mains;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'À la Carte', 1) returning id into v_sides;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, is_signature, position) values
      (v_vendor, v_mains, 'Omakase — 16 Course', 'Chef''s selection, seasonal. Two hours.', 19500, true, 0),
      (v_vendor, v_mains, 'Omakase — 10 Course', 'The abbreviated counter experience.', 12500, false, 1),
      (v_vendor, v_sides, 'Otoro Nigiri', 'Fatty bluefin, two pieces.', 3200, false, 0),
      (v_vendor, v_sides, 'Uni Toast', 'Hokkaido uni, milk bread, wasabi butter.', 2800, true, 1),
      (v_vendor, v_sides, 'Chawanmushi', 'Savoury egg custard, dashi, snow crab.', 1600, false, 2);
  end if;

  -- ---- Roselle Trattoria ---------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'roselle-trattoria';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Antipasti', 0) returning id into v_starters;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Pasta', 1) returning id into v_mains;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Dolci', 2) returning id into v_desserts;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, is_signature, position) values
      (v_vendor, v_starters, 'Burrata & Peach', 'Puglian burrata, grilled peach, basil oil.', 1800, false, 0),
      (v_vendor, v_starters, 'Fritto Misto', 'Calamari, artichoke, lemon.', 2100, false, 1),
      (v_vendor, v_mains, 'Cacio e Pepe', 'Tonnarelli, pecorino romano, black pepper.', 2400, true, 0),
      (v_vendor, v_mains, 'Rigatoni all''Amatriciana', 'Guanciale, San Marzano, chilli.', 2600, false, 1),
      (v_vendor, v_mains, 'Lasagne della Nonna', 'Twelve layers. Sunday only, until it runs out.', 2900, true, 2),
      (v_vendor, v_desserts, 'Tiramisù', 'Made at 6am, served at 6pm.', 1300, false, 0);
  end if;

  -- ---- Ember & Ash ---------------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'ember-and-ash';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'From the Coals', 0) returning id into v_mains;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Sides', 1) returning id into v_sides;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, is_signature, position) values
      (v_vendor, v_mains, 'Dry-Aged Ribeye, 45 Day', '600g bone-in, salt, fire, nothing else.', 8800, true, 0),
      (v_vendor, v_mains, 'Iberico Presa', 'Acorn-fed pork shoulder, pickled mustard seed.', 4600, false, 1),
      (v_vendor, v_mains, 'Whole Turbot', 'For two. Bay leaf, lemon, olive oil.', 9500, false, 2),
      (v_vendor, v_sides, 'Charred Hispi Cabbage', 'Anchovy butter, breadcrumb.', 1400, false, 0),
      (v_vendor, v_sides, 'Beef Fat Potatoes', 'Rosemary, sea salt.', 1200, true, 1);
  end if;

  -- ---- The Golden Hour -----------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'the-golden-hour';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Small Plates', 0) returning id into v_starters;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Large Plates', 1) returning id into v_mains;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, is_signature, position) values
      (v_vendor, v_starters, 'Whipped Feta', 'Hot honey, urfa chilli, sesame flatbread.', 1600, true, 0),
      (v_vendor, v_starters, 'Octopus a la Plancha', 'Smoked paprika, confit potato.', 2400, false, 1),
      (v_vendor, v_starters, 'Marinated Olives', 'Castelvetrano, orange peel, fennel.', 800, false, 2),
      (v_vendor, v_mains, 'Lamb Shoulder', 'Slow-roasted six hours, pomegranate, mint.', 5200, true, 0),
      (v_vendor, v_mains, 'Branzino', 'Whole grilled, salsa verde, charred lemon.', 3800, false, 1);
  end if;

  -- ---- Saffron House -------------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'saffron-house';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'From the Tandoor', 0) returning id into v_starters;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Curries', 1) returning id into v_mains;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Breads & Rice', 2) returning id into v_sides;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, is_signature, position) values
      (v_vendor, v_starters, 'Malai Tikka', 'Cream-marinated chicken, green chilli, cardamom.', 1900, false, 0),
      (v_vendor, v_starters, 'Tandoori Prawns', 'Ajwain, lime, kachumber.', 2400, false, 1),
      (v_vendor, v_mains, 'Butter Chicken', 'Thirty-year-old recipe. Fenugreek, tomato, cream.', 2200, true, 0),
      (v_vendor, v_mains, 'Lamb Rogan Josh', 'Kashmiri chilli, slow-cooked shoulder.', 2600, false, 1),
      (v_vendor, v_mains, 'Dal Makhani', 'Black lentils, twenty-four hours on the stove.', 1800, true, 2),
      (v_vendor, v_sides, 'Garlic Naan', 'Charred in the clay oven.', 600, false, 0),
      (v_vendor, v_sides, 'Saffron Pilau', 'Basmati, whole spice, fried onion.', 800, false, 1);

    insert into public.menu_item_options (menu_item_id, option_group, name, price_delta_cents, is_default, position)
    select mi.id, 'Heat', t.name, 0, t.name = 'Medium', t.pos
    from public.menu_items mi,
         (values ('Mild', 0), ('Medium', 1), ('Hot', 2), ('Chef''s Heat', 3)) as t(name, pos)
    where mi.vendor_id = v_vendor and mi.name in ('Butter Chicken', 'Lamb Rogan Josh');
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Couriers. Each tracking_token is the credential for that courier's phone
-- page at /courier/<token> — regenerate them before going anywhere near
-- production.
-- -----------------------------------------------------------------------------
insert into public.couriers (full_name, phone, vehicle, rating, trips_count, status, avatar_url)
select * from (values
  ('Marcus Vance',  '+1 (212) 555-0301', 'Electric Scooter', 4.9, 1204, 'available'::public.courier_status,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuBJzay_YzY4kT5RVmImFvD2Ah98ES4DfxakCdQhcVVuo1ydCbYcFd6e2bn3ooO2UMa73ZJJwOyGcEYDzkIYIkDo0P499fa5bP8VR1okSsvDRBZjOfFH2BAze-tV0K7CuXeWiRPwGec8j1pGph3txKRPLgn617Lm-Mv_1hufm4vOlJ4SeV04q2zR5c-D8iCV1eLVwUB_JsxI8-pqRnJfhEXFQpqbKh6rTNHdMVnJLzLrBiRBOsehqyuZdTpXf5nCo8N1G_qZkZlMI78o'),
  ('Priya Raman',   '+1 (212) 555-0344', 'Cargo Bike',       4.8,  867, 'available'::public.courier_status, null),
  ('Diego Salazar', '+1 (212) 555-0377', 'Car',              5.0,  432, 'offline'::public.courier_status,   null)
) as c(full_name, phone, vehicle, rating, trips_count, status, avatar_url)
where not exists (select 1 from public.couriers);
