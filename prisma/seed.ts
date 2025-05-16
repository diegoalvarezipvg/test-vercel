import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase para el seed
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando proceso de seed...');
  
  // ---------------------------------
  // Creación de permisos
  // ---------------------------------
  console.log('Creando permisos...');
  
  const permisos = [
    // Permisos de Inventario
    { nombrePermiso: 'inventario_ver', modulo: 'Inventario', descripcion: 'Ver información de inventario' },
    { nombrePermiso: 'inventario_modificar', modulo: 'Inventario', descripcion: 'Modificar inventario' },
    
    // Permisos de Producción
    { nombrePermiso: 'produccion_ver', modulo: 'Producción', descripcion: 'Ver información de producción' },
    { nombrePermiso: 'produccion_modificar', modulo: 'Producción', descripcion: 'Modificar datos de producción' },
    
    // Permisos Comerciales
    { nombrePermiso: 'comercial_ver', modulo: 'Comercial', descripcion: 'Ver información comercial' },
    { nombrePermiso: 'comercial_modificar', modulo: 'Comercial', descripcion: 'Modificar datos comerciales' },
    
    // Permisos Administrativos
    { nombrePermiso: 'administracion_ver', modulo: 'Administración', descripcion: 'Ver información administrativa' },
    { nombrePermiso: 'administracion_modificar', modulo: 'Administración', descripcion: 'Modificar datos administrativos' },
    
    // Permisos de Reportes
    { nombrePermiso: 'reportes_ver', modulo: 'Reportes', descripcion: 'Ver reportes' },
    { nombrePermiso: 'reportes_generar', modulo: 'Reportes', descripcion: 'Generar reportes' },
    
    // Permisos de Sistema
    { nombrePermiso: 'sistema_configurar', modulo: 'Sistema', descripcion: 'Configurar el sistema' }
  ];
  
  for (const permiso of permisos) {
    await prisma.permiso.upsert({
      where: { nombrePermiso: permiso.nombrePermiso },
      update: {},
      create: permiso
    });
  }
  
  console.log(`✅ ${permisos.length} permisos creados`);
  
  // ---------------------------------
  // Creación de roles
  // ---------------------------------
  console.log('Creando roles y sus permisos asociados...');
  
  // Mapa de roles y sus permisos asociados
  const rolesPermisos: Record<string, string[]> = {
    'Administrador': permisos.map(p => p.nombrePermiso),
    'Produccion': [
      'inventario_ver', 
      'produccion_ver', 
      'produccion_modificar',
      'reportes_ver'
    ],
    'Inventario': [
      'inventario_ver', 
      'inventario_modificar',
      'reportes_ver'
    ],
    'Comercial': [
      'inventario_ver',
      'comercial_ver', 
      'comercial_modificar',
      'reportes_ver'
    ],
    'Visualizador': [
      'inventario_ver',
      'produccion_ver',
      'comercial_ver',
      'reportes_ver'
    ]
  };
  
  // ---------------------------------
  // Creación de usuarios
  // ---------------------------------
  console.log('Creando usuarios...');
  
  // Lista de usuarios a crear
  const usuarios = [
    {
      nombreUsuario: 'admin',
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: 'admin@lacantera.com',
      password: 'Admin123!', // En producción usar contraseñas más seguras
      rol: 'Administrador'
    },
    {
      nombreUsuario: 'produccion',
      nombre: 'Usuario',
      apellido: 'Producción',
      email: 'produccion@lacantera.com',
      password: 'Prod123!',
      rol: 'Produccion'
    },
    {
      nombreUsuario: 'inventario',
      nombre: 'Usuario',
      apellido: 'Inventario',
      email: 'inventario@lacantera.com',
      password: 'Inv123!',
      rol: 'Inventario'
    },
    {
      nombreUsuario: 'comercial',
      nombre: 'Usuario',
      apellido: 'Comercial',
      email: 'comercial@lacantera.com',
      password: 'Com123!',
      rol: 'Comercial'
    },
    {
      nombreUsuario: 'visualizador',
      nombre: 'Usuario',
      apellido: 'Visualizador',
      email: 'visualizador@lacantera.com',
      password: 'View123!',
      rol: 'Visualizador'
    }
  ];
  
  for (const usuario of usuarios) {
    // Primero, crear o actualizar el usuario en Supabase
    try {
      // Verificar si el usuario ya existe en Supabase
      // Listar todos los usuarios y filtrar manualmente por email
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error(`Error al listar usuarios en Supabase:`, listError);
        continue;
      }
      
      // Filtrar el usuario por email manualmente
      const existingUser = usersData.users.find(u => u.email === usuario.email);
      let supabaseUserId;
      
      if (!existingUser) {
        // Si no existe, crear el usuario en Supabase
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: usuario.email,
          password: usuario.password,
          email_confirm: true,
          user_metadata: {
            nombreUsuario: usuario.nombreUsuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            rol: usuario.rol
          }
        });
        
        if (error) {
          console.error(`Error al crear usuario ${usuario.email} en Supabase:`, error);
          continue;
        }
        
        console.log(`✅ Usuario ${usuario.email} creado en Supabase`);
        supabaseUserId = data.user?.id;
      } else {
        // Si ya existe, actualizar sus metadatos
        supabaseUserId = existingUser.id;
        
        const { error } = await supabaseAdmin.auth.admin.updateUserById(supabaseUserId, {
          user_metadata: {
            nombreUsuario: usuario.nombreUsuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            rol: usuario.rol
          }
        });
        
        if (error) {
          console.error(`Error al actualizar usuario ${usuario.email} en Supabase:`, error);
        } else {
          console.log(`✅ Usuario ${usuario.email} actualizado en Supabase`);
        }
      }
      
      // Luego, crear o actualizar el usuario en nuestra base de datos
      const usuarioDb = await prisma.usuario.upsert({
        where: { nombreUsuario: usuario.nombreUsuario },
        update: {
          nombreUsuario: usuario.nombreUsuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol,
          estado: 'Activo'
        },
        create: {
          nombreUsuario: usuario.nombreUsuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          passwordHash: '**SUPABASE_AUTH**', // No almacenamos la contraseña real, Supabase se encarga de eso
          rol: usuario.rol,
          estado: 'Activo',
          fechaCreacion: new Date()
        }
      });
      
      console.log(`✅ Usuario ${usuario.email} creado/actualizado en la base de datos local`);
      
      // Asignar permisos al usuario según su rol
      if (rolesPermisos[usuario.rol]) {
        // Primero eliminar permisos existentes para evitar duplicados
        await prisma.usuarioPermiso.deleteMany({
          where: { usuarioId: usuarioDb.id }
        });
        
        // Obtener IDs de permisos por nombre
        const permisosDelRol = await prisma.permiso.findMany({
          where: {
            nombrePermiso: {
              in: rolesPermisos[usuario.rol]
            }
          }
        });
        
        // Asignar permisos al usuario
        for (const permiso of permisosDelRol) {
          await prisma.usuarioPermiso.create({
            data: {
              usuarioId: usuarioDb.id,
              permisoId: permiso.id
            }
          });
        }
        
        console.log(`✅ ${permisosDelRol.length} permisos asignados a ${usuario.email}`);
      }
    } catch (error) {
      console.error(`Error al procesar usuario ${usuario.email}:`, error);
    }
  }
  
  console.log('🌱 Proceso de seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante el proceso de seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });