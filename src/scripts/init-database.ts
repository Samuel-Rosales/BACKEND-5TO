import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/backend_5to?schema=public';

async function initializeDatabase() {
  console.log('🔄 Inicializando base de datos...');
  
  try {
    // Conectar directamente con SQL para crear las tablas
    const pool = new Pool({ connectionString: databaseUrl });
    
    // Verificar si ya existen tablas
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Las tablas ya existen en la base de datos');
      console.log('Tablas encontradas:', result.rows.map(row => row.table_name));
      await pool.end();
      return;
    }
    
    console.log('📝 Creando tablas desde el schema de Prisma...');
    
    // Usar Prisma para sincronizar el schema
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    // Forzar la sincronización del schema
    await prisma.$connect();
    
    console.log('✅ Base de datos inicializada correctamente');
    await prisma.$disconnect();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase();
