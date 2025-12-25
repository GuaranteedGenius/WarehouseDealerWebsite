import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
    },
  })
  console.log('Created admin:', admin.email)

  // Sample warehouse images from Unsplash
  const warehouseImages = [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200',
    'https://images.unsplash.com/photo-1565891741441-64926e441838?w=1200',
    'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1200',
    'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=1200',
    'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=1200',
    'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=1200',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200',
  ]

  // Property 1: Large Distribution Center
  const property1 = await prisma.property.upsert({
    where: { slug: 'premier-distribution-center-houston' },
    update: {},
    create: {
      title: 'Premier Distribution Center – 250,000 SF',
      slug: 'premier-distribution-center-houston',
      address: '4500 Industrial Boulevard',
      city: 'Houston',
      state: 'TX',
      zip: '77041',
      description: `This state-of-the-art distribution center offers exceptional logistics capabilities with direct access to major highways and the Port of Houston. The facility features modern construction, ample trailer parking, and a fully climate-controlled environment.

The property is ideally suited for e-commerce fulfillment, third-party logistics, or regional distribution operations. Recent upgrades include LED lighting throughout, new HVAC systems, and an upgraded fire suppression system.

Located in the heart of Houston's premier industrial corridor, this facility offers unmatched access to labor, transportation networks, and the greater Houston market.`,
      squareFeet: 250000,
      clearHeight: "36' Clear",
      dockDoors: 48,
      driveInDoors: 4,
      acreage: 18.5,
      leaseOrSale: 'Lease',
      priceOrRate: '$6.75/SF NNN',
      availableDate: new Date('2025-02-01'),
      highlights: [
        'Cross-dock configuration',
        'ESFR sprinkler system',
        "60' x 50' column spacing",
        'T-5 LED lighting throughout',
        "185' truck court depth",
        'Abundant trailer parking (120+ spaces)',
        'Recently renovated office space',
        'Fenced and secured yard',
      ],
      status: 'Available',
      featured: true,
      images: {
        create: [
          { url: warehouseImages[0], alt: 'Distribution center exterior', sortOrder: 0 },
          { url: warehouseImages[1], alt: 'Warehouse interior', sortOrder: 1 },
          { url: warehouseImages[2], alt: 'Dock doors', sortOrder: 2 },
        ],
      },
    },
  })
  console.log('Created property:', property1.title)

  // Property 2: Modern Manufacturing Facility
  const property2 = await prisma.property.upsert({
    where: { slug: 'class-a-manufacturing-facility-dallas' },
    update: {},
    create: {
      title: 'Class A Manufacturing Facility – 175,000 SF',
      slug: 'class-a-manufacturing-facility-dallas',
      address: '8200 Commerce Drive',
      city: 'Dallas',
      state: 'TX',
      zip: '75247',
      description: `Premier manufacturing facility featuring heavy power infrastructure, reinforced flooring, and modern amenities. This property is perfect for advanced manufacturing, assembly operations, or food processing.

The building includes significant office build-out with a two-story office component totaling 15,000 SF. The manufacturing area features 8" reinforced concrete floors capable of supporting heavy machinery.

Strategically located near major transportation corridors with excellent access to DFW International Airport and downtown Dallas.`,
      squareFeet: 175000,
      clearHeight: "32' Clear",
      dockDoors: 24,
      driveInDoors: 6,
      acreage: 14.2,
      leaseOrSale: 'Both',
      priceOrRate: 'Call for Pricing',
      availableDate: new Date('2025-03-15'),
      highlights: [
        '3,000 amps electrical service',
        'Heavy floor load capacity (500 PSF)',
        'Air-conditioned warehouse',
        'Compressed air throughout',
        'Overhead bridge cranes (5-ton capacity)',
        'Rail spur access available',
        'Full fire suppression system',
        '15,000 SF modern office space',
      ],
      status: 'Available',
      featured: true,
      images: {
        create: [
          { url: warehouseImages[3], alt: 'Manufacturing facility exterior', sortOrder: 0 },
          { url: warehouseImages[4], alt: 'Production floor', sortOrder: 1 },
          { url: warehouseImages[5], alt: 'Office area', sortOrder: 2 },
        ],
      },
    },
  })
  console.log('Created property:', property2.title)

  // Property 3: Flex Warehouse
  const property3 = await prisma.property.upsert({
    where: { slug: 'flex-warehouse-space-austin' },
    update: {},
    create: {
      title: 'Flex Warehouse Space – 45,000 SF',
      slug: 'flex-warehouse-space-austin',
      address: '2100 Tech Center Parkway',
      city: 'Austin',
      state: 'TX',
      zip: '78758',
      description: `Versatile flex space perfect for growing businesses needing a combination of warehouse, showroom, and office space. This property offers an excellent Austin location with strong visibility from the highway.

The flexible design allows for various configurations to meet your specific operational needs. Ideal for light assembly, distribution, or technology companies requiring secure storage and operational space.

Prime North Austin location with easy access to major highways and close proximity to the Domain and tech corridor.`,
      squareFeet: 45000,
      clearHeight: "24' Clear",
      dockDoors: 6,
      driveInDoors: 2,
      acreage: 4.5,
      leaseOrSale: 'Lease',
      priceOrRate: '$8.50/SF NNN',
      availableDate: new Date('2025-01-15'),
      highlights: [
        'Divisible to 15,000 SF',
        'Grade-level loading',
        'Move-in ready condition',
        'Ample parking (4:1,000 ratio)',
        '10,000 SF finished office',
        'Great highway visibility',
        'Monument signage available',
        'Energy-efficient construction',
      ],
      status: 'Available',
      featured: true,
      images: {
        create: [
          { url: warehouseImages[6], alt: 'Flex space exterior', sortOrder: 0 },
          { url: warehouseImages[7], alt: 'Interior warehouse', sortOrder: 1 },
        ],
      },
    },
  })
  console.log('Created property:', property3.title)

  // Sample leads
  const leads = [
    {
      type: 'RequestInfo',
      name: 'John Martinez',
      email: 'john.martinez@logistics.com',
      phone: '(713) 555-0142',
      company: 'Swift Logistics Inc.',
      message: 'We are looking to expand our distribution operations in the Houston area. The 250,000 SF facility looks perfect for our needs. Please send more information about lease terms and availability.',
      propertyId: property1.id,
      status: 'New',
    },
    {
      type: 'ScheduleWalkthrough',
      name: 'Sarah Chen',
      email: 'schen@manufact-corp.com',
      phone: '(469) 555-0187',
      company: 'Manufact Corp',
      message: 'We are interested in touring the Dallas manufacturing facility. We need heavy power and crane access for our precision manufacturing operations.',
      preferredDateTime: 'Tuesday or Thursday afternoon, preferably after 2pm',
      propertyId: property2.id,
      status: 'Contacted',
    },
    {
      type: 'Contact',
      name: 'Michael Brown',
      email: 'mbrown@startuphub.io',
      company: 'StartupHub',
      message: 'We are a growing tech company looking for flexible warehouse space in the Austin area. We need about 20,000-40,000 SF with good office space. What do you have available?',
      status: 'New',
    },
  ]

  for (const lead of leads) {
    await prisma.lead.create({ data: lead })
  }
  console.log('Created sample leads')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
