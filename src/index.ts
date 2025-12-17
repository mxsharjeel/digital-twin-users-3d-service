import prisma from './prisma';

async function main() {
  console.log('Digital Twin Users 3D Service');
  console.log('==============================');
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
