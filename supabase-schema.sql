-- Supabase Schema for Warehouse Dealer Website
-- Run this in Supabase SQL Editor

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Properties table
CREATE TABLE wd_property (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  description TEXT NOT NULL,
  square_feet INTEGER NOT NULL,
  clear_height TEXT,
  dock_doors INTEGER DEFAULT 0,
  drive_in_doors INTEGER DEFAULT 0,
  acreage DOUBLE PRECISION,
  lease_or_sale TEXT DEFAULT 'Lease' CHECK (lease_or_sale IN ('Lease', 'Sale', 'Both')),
  price_or_rate TEXT,
  available_date TIMESTAMPTZ,
  highlights JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'UnderContract', 'Leased', 'Sold')),
  featured BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property images table
CREATE TABLE wd_property_image (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES wd_property(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE wd_lead (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES wd_property(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'Contact' CHECK (type IN ('Contact', 'RequestInfo', 'ScheduleWalkthrough')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  preferred_date_time TEXT,
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE wd_admin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE wd_session (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES wd_admin(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limiting table
CREATE TABLE wd_rate_limit (
  id TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Property indexes
CREATE INDEX idx_wd_property_status ON wd_property(status);
CREATE INDEX idx_wd_property_city ON wd_property(city);
CREATE INDEX idx_wd_property_featured ON wd_property(featured);
CREATE INDEX idx_wd_property_archived ON wd_property(archived);
CREATE INDEX idx_wd_property_slug ON wd_property(slug);

-- Property image indexes
CREATE INDEX idx_wd_property_image_property_id ON wd_property_image(property_id);
CREATE INDEX idx_wd_property_image_sort_order ON wd_property_image(sort_order);

-- Lead indexes
CREATE INDEX idx_wd_lead_property_id ON wd_lead(property_id);
CREATE INDEX idx_wd_lead_type ON wd_lead(type);
CREATE INDEX idx_wd_lead_status ON wd_lead(status);
CREATE INDEX idx_wd_lead_created_at ON wd_lead(created_at);

-- Session indexes
CREATE INDEX idx_wd_session_admin_id ON wd_session(admin_id);
CREATE INDEX idx_wd_session_expires_at ON wd_session(expires_at);

-- Rate limit indexes
CREATE INDEX idx_wd_rate_limit_expires_at ON wd_rate_limit(expires_at);

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wd_property_updated_at
  BEFORE UPDATE ON wd_property
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wd_lead_updated_at
  BEFORE UPDATE ON wd_lead
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wd_admin_updated_at
  BEFORE UPDATE ON wd_admin
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE wd_property ENABLE ROW LEVEL SECURITY;
ALTER TABLE wd_property_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE wd_lead ENABLE ROW LEVEL SECURITY;
ALTER TABLE wd_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE wd_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE wd_rate_limit ENABLE ROW LEVEL SECURITY;

-- Public read access for properties (non-archived only)
CREATE POLICY "Public can view available properties" ON wd_property
  FOR SELECT USING (archived = false);

-- Public read access for property images
CREATE POLICY "Public can view property images" ON wd_property_image
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wd_property
      WHERE wd_property.id = wd_property_image.property_id
      AND wd_property.archived = false
    )
  );

-- Service role has full access (for API routes)
CREATE POLICY "Service role has full access to properties" ON wd_property
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to property images" ON wd_property_image
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to leads" ON wd_lead
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to admins" ON wd_admin
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to sessions" ON wd_session
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to rate limits" ON wd_rate_limit
  FOR ALL USING (auth.role() = 'service_role');

-- Public can insert leads (for contact forms)
CREATE POLICY "Public can submit leads" ON wd_lead
  FOR INSERT WITH CHECK (true);

-- Public can insert/update rate limits
CREATE POLICY "Public can manage rate limits" ON wd_rate_limit
  FOR ALL USING (true);

-- =============================================
-- SEED DATA (Optional - uncomment to use)
-- =============================================

-- Insert admin user (password: admin123)
-- The hash below is bcrypt hash of 'admin123' with 12 rounds
INSERT INTO wd_admin (email, password_hash, name) VALUES (
  'admin@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VttYLH.Ym.qKIe',
  'Admin User'
);

-- Sample properties
INSERT INTO wd_property (
  title, slug, address, city, state, zip, description,
  square_feet, clear_height, dock_doors, drive_in_doors, acreage,
  lease_or_sale, price_or_rate, available_date, highlights, status, featured
) VALUES
(
  'Premier Distribution Center – 250,000 SF',
  'premier-distribution-center-houston',
  '4500 Industrial Boulevard',
  'Houston', 'TX', '77041',
  'This state-of-the-art distribution center offers exceptional logistics capabilities with direct access to major highways and the Port of Houston. The facility features modern construction, ample trailer parking, and a fully climate-controlled environment.

The property is ideally suited for e-commerce fulfillment, third-party logistics, or regional distribution operations. Recent upgrades include LED lighting throughout, new HVAC systems, and an upgraded fire suppression system.

Located in the heart of Houston''s premier industrial corridor, this facility offers unmatched access to labor, transportation networks, and the greater Houston market.',
  250000, '36'' Clear', 48, 4, 18.5,
  'Lease', '$6.75/SF NNN', '2025-02-01',
  '["Cross-dock configuration", "ESFR sprinkler system", "60'' x 50'' column spacing", "T-5 LED lighting throughout", "185'' truck court depth", "Abundant trailer parking (120+ spaces)", "Recently renovated office space", "Fenced and secured yard"]'::jsonb,
  'Available', true
),
(
  'Class A Manufacturing Facility – 175,000 SF',
  'class-a-manufacturing-facility-dallas',
  '8200 Commerce Drive',
  'Dallas', 'TX', '75247',
  'Premier manufacturing facility featuring heavy power infrastructure, reinforced flooring, and modern amenities. This property is perfect for advanced manufacturing, assembly operations, or food processing.

The building includes significant office build-out with a two-story office component totaling 15,000 SF. The manufacturing area features 8" reinforced concrete floors capable of supporting heavy machinery.

Strategically located near major transportation corridors with excellent access to DFW International Airport and downtown Dallas.',
  175000, '32'' Clear', 24, 6, 14.2,
  'Both', 'Call for Pricing', '2025-03-15',
  '["3,000 amps electrical service", "Heavy floor load capacity (500 PSF)", "Air-conditioned warehouse", "Compressed air throughout", "Overhead bridge cranes (5-ton capacity)", "Rail spur access available", "Full fire suppression system", "15,000 SF modern office space"]'::jsonb,
  'Available', true
),
(
  'Flex Warehouse Space – 45,000 SF',
  'flex-warehouse-space-austin',
  '2100 Tech Center Parkway',
  'Austin', 'TX', '78758',
  'Versatile flex space perfect for growing businesses needing a combination of warehouse, showroom, and office space. This property offers an excellent Austin location with strong visibility from the highway.

The flexible design allows for various configurations to meet your specific operational needs. Ideal for light assembly, distribution, or technology companies requiring secure storage and operational space.

Prime North Austin location with easy access to major highways and close proximity to the Domain and tech corridor.',
  45000, '24'' Clear', 6, 2, 4.5,
  'Lease', '$8.50/SF NNN', '2025-01-15',
  '["Divisible to 15,000 SF", "Grade-level loading", "Move-in ready condition", "Ample parking (4:1,000 ratio)", "10,000 SF finished office", "Great highway visibility", "Monument signage available", "Energy-efficient construction"]'::jsonb,
  'Available', true
);

-- Get property IDs for image insertion
DO $$
DECLARE
  houston_id UUID;
  dallas_id UUID;
  austin_id UUID;
BEGIN
  SELECT id INTO houston_id FROM wd_property WHERE slug = 'premier-distribution-center-houston';
  SELECT id INTO dallas_id FROM wd_property WHERE slug = 'class-a-manufacturing-facility-dallas';
  SELECT id INTO austin_id FROM wd_property WHERE slug = 'flex-warehouse-space-austin';

  -- Insert sample images
  INSERT INTO wd_property_image (property_id, url, alt, sort_order) VALUES
    (houston_id, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200', 'Distribution center exterior', 0),
    (houston_id, 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200', 'Warehouse interior', 1),
    (houston_id, 'https://images.unsplash.com/photo-1565891741441-64926e441838?w=1200', 'Dock doors', 2),
    (dallas_id, 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1200', 'Manufacturing facility exterior', 0),
    (dallas_id, 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=1200', 'Production floor', 1),
    (dallas_id, 'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=1200', 'Office area', 2),
    (austin_id, 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=1200', 'Flex space exterior', 0),
    (austin_id, 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200', 'Interior warehouse', 1);

  -- Insert sample leads
  INSERT INTO wd_lead (property_id, type, name, email, phone, company, message, status) VALUES
    (houston_id, 'RequestInfo', 'John Martinez', 'john.martinez@logistics.com', '(713) 555-0142', 'Swift Logistics Inc.', 'We are looking to expand our distribution operations in the Houston area. The 250,000 SF facility looks perfect for our needs. Please send more information about lease terms and availability.', 'New'),
    (dallas_id, 'ScheduleWalkthrough', 'Sarah Chen', 'schen@manufact-corp.com', '(469) 555-0187', 'Manufact Corp', 'We are interested in touring the Dallas manufacturing facility. We need heavy power and crane access for our precision manufacturing operations.', 'Contacted');

  INSERT INTO wd_lead (type, name, email, company, message, status) VALUES
    ('Contact', 'Michael Brown', 'mbrown@startuphub.io', 'StartupHub', 'We are a growing tech company looking for flexible warehouse space in the Austin area. We need about 20,000-40,000 SF with good office space. What do you have available?', 'New');
END $$;
