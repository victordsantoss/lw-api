import { config } from 'dotenv';
import { createDataSource } from '../data-source';
import { Role, RoleTypes } from '../entities/role.entity';

// Carregar variáveis de ambiente
config();

async function seedRoles() {
  console.log('🔧 Configurações do banco:');
  console.log(`Host: ${process.env.DATABASE_HOST || 'localhost'}`);
  console.log(`Port: ${process.env.DATABASE_PORT || '5432'}`);
  console.log(`Username: ${process.env.DATABASE_USERNAME || 'postgres'}`);
  console.log(`Database: ${process.env.DATABASE_NAME || 'lw'}`);
  console.log(
    `Password: ${process.env.DATABASE_PASSWORD ? '[DEFINIDA]' : '[NÃO DEFINIDA]'}`,
  );

  const dataSource = await createDataSource();
  await dataSource.initialize();

  try {
    const roleRepository = dataSource.getRepository(Role);

    // Definir as roles a serem criadas
    const rolesToCreate = [
      {
        name: RoleTypes.SADMIN,
        isActive: true,
      },
      {
        name: RoleTypes.ADMIN,
        isActive: true,
      },
      {
        name: RoleTypes.MANAGER,
        isActive: true,
      },
      {
        name: RoleTypes.USER,
        isActive: true,
      },
      {
        name: RoleTypes.GUEST,
        isActive: true,
      },
    ];

    console.log('🚀 Iniciando seed das roles...');

    for (const roleData of rolesToCreate) {
      // Verificar se a role já existe
      const existingRole = await roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = roleRepository.create(roleData);
        await roleRepository.save(role);
        console.log(`✅ Role '${roleData.name}' criada com sucesso`);
      } else {
        console.log(`⚠️  Role '${roleData.name}' já existe no banco de dados`);
      }
    }

    console.log('🎉 Seed das roles concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seed das roles:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Executar o seed
seedRoles().catch((error) => {
  console.error('❌ Erro fatal ao executar seed:', error);
  process.exit(1);
});