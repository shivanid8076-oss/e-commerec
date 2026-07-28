const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SAMPLE_PRODUCTS = [
  {
    title: 'Harit Darbar Mata Rani Dress',
    slug: 'harit-darbar-mata-rani-dress',
    price: 630,
    compare: 630,
    category: 'mata-rani-collection',
    sizes: ['0 No', '1 No', '2 No', '3 No'],
    images: ['https://www.rishigyan.com/cdn/shop/files/B3C172E1-B9E7-4FFE-A6A8-EAADB5E5A4C2.png?v=1780632086&width=990'],
  },
  {
    title: 'Kamakhya Mata Rani Dress',
    slug: 'kamakhya-mata-rani-dress',
    price: 699,
    compare: 750,
    category: 'mata-rani-collection',
    sizes: ['0 No', '1 No', '2 No'],
    images: ['https://www.rishigyan.com/cdn/shop/files/B3C172E1-B9E7-4FFE-A6A8-EAADB5E5A4C2.png?v=1780632086&width=990'],
  },
  {
    title: 'Sarveshvari Mata Rani Dress',
    slug: 'sarveshvari-mata-rani-dress',
    price: 799,
    compare: 890,
    category: 'mata-rani-collection',
    sizes: ['0 No', '1 No', '2 No', '3 No', '4 No'],
    images: ['https://www.rishigyan.com/cdn/shop/files/IMG_0026.jpg?v=1772875667&width=990'],
  },
  {
    title: 'Mahagauri Mata Rani Dress',
    slug: 'mahagauri-mata-rani-dress',
    price: 598,
    compare: 680,
    category: 'mata-rani-collection',
    sizes: ['0 No', '1 No', '2 No', '3 No'],
    images: ['https://www.rishigyan.com/cdn/shop/files/IMG_0067.jpg?v=1772875666&width=990'],
  },
  {
    title: 'Prem Tarang Laddu Gopal Dress',
    slug: 'prem-tarang-laddu-gopal-dress',
    price: 499,
    compare: 599,
    category: 'laddu-gopal-ji-collection',
    sizes: ['0 No', '1 No', '2 No', '3 No'],
    images: ['https://www.rishigyan.com/cdn/shop/files/Red_Rose_Laddu_Gopal_Dress.jpg?v=1751864208'],
  },
  {
    title: 'Divyaneel RK Set',
    slug: 'divyaneel-rk-set',
    price: 899,
    compare: 999,
    category: 'rk-collection',
    sizes: ['0 No', '1 No', '2 No', '3 No'],
    images: ['https://www.rishigyan.com/cdn/shop/files/Green_Radhe_Krishna_Dress_c233fcf0-a370-44fb-9024-098bb4848185.jpg?v=1759302045'],
  }
];

async function main() {
  console.log("Seeding database with default products...");
  for (const p of SAMPLE_PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          title: p.title,
          slug: p.slug,
          category: p.category,
          price: parseFloat(p.price),
          compare: parseFloat(p.compare),
          sizes: p.sizes,
          images: p.images,
          isFeatured: true
        }
      });
      console.log(`Created: ${p.title}`);
    }
  }
  console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
