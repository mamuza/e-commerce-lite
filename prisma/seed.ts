import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'Plain T-Shirt',
    description: 'Soft cotton tee. Unisex fit.',
    priceCents: 1999,
    stockQuantity: 50,
  },
  {
    name: 'Sticker Pack',
    description: 'Set of 5 vinyl stickers.',
    priceCents: 499,
    stockQuantity: 200,
  },
  { name: 'Mug', description: 'White ceramic mug, 12 oz.', priceCents: 1299, stockQuantity: 30 },
  {
    name: 'Tote Bag',
    description: 'Canvas tote with inner pocket.',
    priceCents: 2499,
    stockQuantity: 25,
  },
  {
    name: 'Notebook',
    description: 'A5 ruled notebook, 80 pages.',
    priceCents: 899,
    stockQuantity: 100,
  },
  {
    name: 'Baseball Cap',
    description: 'Adjustable cotton cap.',
    priceCents: 1599,
    stockQuantity: 40,
  },
  {
    name: 'Hoodie',
    description: 'Comfortable pullover hoodie.',
    priceCents: 3999,
    stockQuantity: 20,
  },
  {
    name: 'Water Bottle',
    description: 'Insulated stainless steel bottle.',
    priceCents: 2199,
    stockQuantity: 60,
  },
  {
    name: 'Keychain',
    description: 'Metal keychain with logo.',
    priceCents: 799,
    stockQuantity: 150,
  },
  {
    name: 'Socks',
    description: 'Pack of 3 pairs of cotton socks.',
    priceCents: 1299,
    stockQuantity: 80,
  },
  {
    name: 'Phone Case',
    description: 'Durable case for smartphones.',
    priceCents: 1999,
    stockQuantity: 70,
  },
  { name: 'Beanie', description: 'Warm knit beanie.', priceCents: 1499, stockQuantity: 35 },
  {
    name: 'Poster',
    description: 'High-quality art print poster.',
    priceCents: 999,
    stockQuantity: 120,
  },
  {
    name: 'Laptop Sleeve',
    description: 'Protective sleeve for laptops.',
    priceCents: 2599,
    stockQuantity: 45,
  },
  {
    name: 'Mouse Pad',
    description: 'Smooth surface mouse pad.',
    priceCents: 699,
    stockQuantity: 90,
  },
  {
    name: 'Backpack',
    description: 'Durable backpack with multiple compartments.',
    priceCents: 4999,
    stockQuantity: 15,
  },
  {
    name: 'Sunglasses',
    description: 'Stylish UV protection sunglasses.',
    priceCents: 2999,
    stockQuantity: 55,
  },
  { name: 'Wallet', description: 'Leather bifold wallet.', priceCents: 3499, stockQuantity: 40 },
  {
    name: 'Desk Organizer',
    description: 'Keep your desk tidy with this organizer.',
    priceCents: 1799,
    stockQuantity: 70,
  },
  {
    name: 'Travel Mug',
    description: 'Leak-proof travel mug.',
    priceCents: 2199,
    stockQuantity: 50,
  },
];

async function main() {
  // Initial admin user
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin12345';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.ADMIN },
    create: { email: adminEmail, passwordHash: adminPasswordHash, role: UserRole.ADMIN },
  });
  console.log('Seeded admin:', admin.email, '(password: admin12345)');

  // Demo customer user
  const demoEmail = 'demo@example.com';
  const demoPassword = 'demo12345';
  const demoPasswordHash = await bcrypt.hash(demoPassword, 10);
  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: { email: demoEmail, passwordHash: demoPasswordHash },
  });
  console.log('Seeded user:', user.email, '(password: demo12345)');

  const existing = await prisma.product.count();
  if (existing === 0) {
    await prisma.product.createMany({
      data: sampleProducts.map((p) => ({ ...p, isActive: true })),
    });
    console.log('Seeded', sampleProducts.length, 'products');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
