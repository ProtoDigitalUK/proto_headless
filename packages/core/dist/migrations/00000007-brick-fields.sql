CREATE TABLE IF NOT EXISTS lucid_collection_bricks (
  id SERIAL PRIMARY KEY,
  brick_type TEXT NOT NULL,
  brick_key TEXT NOT NULL,
  page_id INT REFERENCES lucid_pages(id) ON DELETE CASCADE,
  singlepage_id INT REFERENCES lucid_singlepages(id) ON DELETE CASCADE,
  
  brick_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS lucid_groups (
  group_id SERIAL PRIMARY KEY,
  collection_brick_id INT REFERENCES lucid_collection_bricks(id) ON DELETE CASCADE,
  group_order INT  NOT NULL,
  ref TEXT
);

CREATE TABLE IF NOT EXISTS lucid_fields (
  fields_id SERIAL PRIMARY KEY,
  collection_brick_id INT REFERENCES lucid_collection_bricks(id) ON DELETE CASCADE,
  group_id INT REFERENCES lucid_groups(id) ON DELETE CASCADE,
  repeater_key TEXT,

  key TEXT NOT NULL,
  type TEXT NOT NULL,

  text_value TEXT,
  int_value INT,
  bool_value BOOLEAN,
  json_value JSONB,
  page_link_id INT REFERENCES lucid_pages(id) ON DELETE SET NULL,
  media_id INT REFERENCES lucid_media(id) ON DELETE SET NULL
);
