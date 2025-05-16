import { config } from "./config";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Cervecería La Cantera API",
    version: config.server.version || "1.0.0",
    description:
      "Documentación de la API para el sistema de Cervecería La Cantera",
    contact: {
      name: "Equipo La Cantera",
      email: "contacto@cervecerialacantera.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: `http://localhost:${config.server.port}`,
      description: "Servidor de Desarrollo",
    },
    {
      url: "https://api.cervecerialacantera.com",
      description: "Servidor de Producción",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token de autenticación",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false
          },
          error: {
            type: "string",
            description: "Mensaje de error",
          },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  example: "nombre"
                },
                message: {
                  type: "string",
                  example: "El nombre es requerido"
                }
              }
            }
          }
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            description: "Número de página actual",
          },
          limit: {
            type: "integer",
            description: "Número de elementos por página",
          },
          total: {
            type: "integer",
            description: "Total de elementos",
          },
          totalPages: {
            type: "integer",
            description: "Total de páginas",
          },
        },
      },
      MateriaPrima: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "ID de la materia prima",
          },
          codigo: {
            type: "string",
            description: "Código único de la materia prima",
          },
          nombre: {
            type: "string",
            description: "Nombre de la materia prima",
          },
          tipo: {
            type: "string",
            description: "Tipo de materia prima",
            enum: ["Lúpulo", "Malta", "Levadura", "Agua", "Otro"],
          },
          subtipo: {
            type: "string",
            description: "Subtipo de materia prima",
          },
          unidadMedida: {
            type: "string",
            description: "Unidad de medida",
            enum: ["kg", "g", "l", "ml", "unidad"],
          },
          stockActual: {
            type: "number",
            description: "Stock actual disponible",
          },
          stockMinimo: {
            type: "number",
            description: "Stock mínimo requerido",
          },
          ubicacionFisica: {
            type: "string",
            description: "Ubicación física en el almacén",
          },
          atributosEspecificos: {
            type: "object",
            description:
              "Atributos específicos según el tipo de materia prima",
          },
          estado: {
            type: "string",
            description: "Estado de la materia prima",
            enum: ["Activo", "Inactivo", "Agotado"],
          },
          notas: {
            type: "string",
            description: "Notas adicionales",
          },
          fechaCreacion: {
            type: "string",
            format: "date-time",
            description: "Fecha de creación del registro",
          },
          fechaModificacion: {
            type: "string",
            format: "date-time",
            description: "Fecha de última modificación",
          },
        },
      },
      LoteMateriaPrima: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "ID del lote",
          },
          materiaPrimaId: {
            type: "integer",
            description: "ID de la materia prima",
          },
          codigoLote: {
            type: "string",
            description: "Código único del lote",
          },
          proveedorId: {
            type: "integer",
            description: "ID del proveedor",
          },
          fechaRecepcion: {
            type: "string",
            format: "date-time",
            description: "Fecha de recepción del lote",
          },
          fechaProduccion: {
            type: "string",
            format: "date-time",
            description: "Fecha de producción del lote",
          },
          fechaCaducidad: {
            type: "string",
            format: "date-time",
            description: "Fecha de caducidad del lote",
          },
          cantidad: {
            type: "number",
            description: "Cantidad total del lote",
          },
          cantidadDisponible: {
            type: "number",
            description: "Cantidad disponible del lote",
          },
          precio: {
            type: "number",
            description: "Precio unitario del lote",
          },
          ordenCompraId: {
            type: "integer",
            description: "ID de la orden de compra asociada",
          },
          estado: {
            type: "string",
            description: "Estado del lote",
            enum: ["Disponible", "Agotado", "Caducado", "Reservado"],
          },
          notas: {
            type: "string",
            description: "Notas adicionales",
          },
        },
      },
      MovimientoInventario: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "ID del movimiento",
          },
          fecha: {
            type: "string",
            format: "date-time",
            description: "Fecha del movimiento",
          },
          tipoMovimiento: {
            type: "string",
            description: "Tipo de movimiento",
            enum: ["entrada", "salida", "ajuste"],
          },
          tipoElemento: {
            type: "string",
            description: "Tipo de elemento",
            enum: ["materia_prima", "producto_terminado"],
          },
          elementoId: {
            type: "integer",
            description: "ID del elemento",
          },
          loteId: {
            type: "integer",
            description: "ID del lote",
          },
          cantidad: {
            type: "number",
            description: "Cantidad del movimiento",
          },
          unidadMedida: {
            type: "string",
            description: "Unidad de medida",
          },
          documentoReferencia: {
            type: "string",
            description: "Documento de referencia",
          },
          referenciaId: {
            type: "integer",
            description: "ID de referencia",
          },
          motivo: {
            type: "string",
            description: "Motivo del movimiento",
          },
          usuarioId: {
            type: "integer",
            description: "ID del usuario que realizó el movimiento",
          },
          notas: {
            type: "string",
            description: "Notas adicionales",
          },
        },
      },
      ProductoTerminado: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1
          },
          codigo: {
            type: "string",
            example: "PT-001"
          },
          nombre: {
            type: "string",
            example: "Cerveza Artesanal IPA"
          },
          estilo: {
            type: "string",
            enum: ["LAGER", "PILSNER", "IPA", "APA", "PALE_ALE", "STOUT", "PORTER", "WHEAT", "SOUR", "BELGIAN", "AMBER", "RED_ALE", "BROWN_ALE", "GOLDEN_ALE", "BARLEYWINE", "BOCK", "SAISON", "OTRO"],
            example: "IPA"
          },
          descripcion: {
            type: "string",
            nullable: true,
            example: "Cerveza India Pale Ale con notas cítricas y amargas"
          },
          presentacion: {
            type: "string",
            enum: ["BOTELLA", "LATA", "BARRIL", "GROWLER", "OTRO"],
            example: "BOTELLA"
          },
          capacidad: {
            type: "number",
            format: "float",
            example: 330
          },
          unidadMedida: {
            type: "string",
            example: "ml"
          },
          stockActual: {
            type: "number",
            format: "float",
            example: 1000
          },
          stockMinimo: {
            type: "number",
            format: "float",
            example: 100
          },
          precioBase: {
            type: "number",
            format: "float",
            nullable: true,
            example: 150.00
          },
          estado: {
            type: "string",
            example: "Activo"
          },
          imagen: {
            type: "string",
            nullable: true,
            example: "https://ejemplo.com/imagen.jpg"
          },
          notas: {
            type: "string",
            nullable: true,
            example: "Notas adicionales sobre el producto"
          },
          fechaCreacion: {
            type: "string",
            format: "date-time",
            example: "2024-03-20T10:00:00Z"
          },
          fechaModificacion: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2024-03-21T15:30:00Z"
          }
        },
        required: ["codigo", "nombre", "estilo", "presentacion", "capacidad", "unidadMedida", "stockMinimo", "estado"]
      },
      LoteProducto: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1
          },
          productoTerminadoId: {
            type: "integer",
            example: 1
          },
          codigoLote: {
            type: "string",
            example: "L-2024-001"
          },
          loteFabricacionId: {
            type: "integer",
            example: 1
          },
          fechaEnvasado: {
            type: "string",
            format: "date-time",
            example: "2024-03-20T10:00:00Z"
          },
          fechaOptimoConsumo: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2024-06-20T10:00:00Z"
          },
          fechaCaducidad: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2024-09-20T10:00:00Z"
          },
          cantidad: {
            type: "number",
            format: "float",
            example: 1000
          },
          cantidadDisponible: {
            type: "number",
            format: "float",
            example: 1000
          },
          estado: {
            type: "string",
            enum: ["Disponible", "Agotado", "Caducado", "Reservado", "Bloqueado"],
            example: "Disponible"
          },
          ubicacionFisica: {
            type: "string",
            nullable: true,
            example: "Almacén A, Estante 1"
          },
          notas: {
            type: "string",
            nullable: true,
            example: "Notas sobre el lote"
          }
        },
        required: ["productoTerminadoId", "codigoLote", "loteFabricacionId", "fechaEnvasado", "cantidad", "estado"]
      },
      MovimientoInventarioProducto: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1
          },
          fecha: {
            type: "string",
            format: "date-time",
            example: "2024-03-20T10:00:00Z"
          },
          tipoMovimiento: {
            type: "string",
            enum: ["Entrada", "Salida", "Ajuste Positivo", "Ajuste Negativo"],
            example: "Entrada"
          },
          tipoElemento: {
            type: "string",
            example: "ProductoTerminado"
          },
          elementoId: {
            type: "integer",
            example: 1
          },
          loteId: {
            type: "integer",
            nullable: true,
            example: 1
          },
          cantidad: {
            type: "number",
            format: "float",
            example: 100
          },
          unidadMedida: {
            type: "string",
            example: "ml"
          },
          documentoReferencia: {
            type: "string",
            nullable: true,
            example: "FAC-001"
          },
          referenciaId: {
            type: "integer",
            nullable: true,
            example: 1
          },
          motivo: {
            type: "string",
            nullable: true,
            example: "Ingreso de nuevo lote"
          },
          usuarioId: {
            type: "integer",
            example: 1
          },
          notas: {
            type: "string",
            nullable: true,
            example: "Notas sobre el movimiento"
          }
        },
        required: ["tipoMovimiento", "tipoElemento", "elementoId", "cantidad", "unidadMedida", "usuarioId"]
      }
    },
    responses: {
      UnauthorizedError: {
        description: "No autorizado",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      ForbiddenError: {
        description: "Acceso denegado",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      NotFoundError: {
        description: "Recurso no encontrado",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      ValidationError: {
        description: "Error de validación",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Autenticación",
      description:
        "Endpoints relacionados con la autenticación y autorización",
    },
    {
      name: "Usuarios",
      description: "Gestión de usuarios del sistema",
    },
    {
      name: "Materias Primas",
      description: "Gestión de materias primas e inventario",
    },
    {
      name: "Lotes Materias Primas",
      description: "Gestión de lotes de materias primas",
    },
    {
      name: "Movimientos Inventario",
      description: "Gestión de movimientos de inventario",
    },
    {
      name: "Productos Terminados",
      description: "Gestión de productos terminados y su inventario",
    },
    {
      name: "Lotes Productos",
      description: "Gestión de lotes de productos terminados",
    },
    {
      name: "Producción",
      description: "Gestión de producción y recetas",
    },
    {
      name: "Ventas",
      description: "Gestión de ventas y pedidos",
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  // Rutas a los archivos que contienen las anotaciones OpenAPI (JSDoc)
  apis: ['./src/routes/**/*.ts', './src/index.ts', './src/server.ts', './local-server.ts'],
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Cervecería La Cantera API - Documentación",
};

export default options;
