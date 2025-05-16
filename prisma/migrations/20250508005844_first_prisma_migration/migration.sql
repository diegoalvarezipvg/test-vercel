-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "password_hash" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_acceso" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" SERIAL NOT NULL,
    "nombre_permiso" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_permisos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,

    CONSTRAINT "usuarios_permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_auditoria" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER,
    "accion" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" INTEGER,
    "valor_anterior" TEXT,
    "valor_nuevo" TEXT,
    "ip" TEXT,

    CONSTRAINT "log_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias_primas" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "subtipo" TEXT,
    "unidad_medida" TEXT NOT NULL,
    "stock_actual" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "ubicacion_fisica" TEXT,
    "atributos_especificos" JSONB,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "notas" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "materias_primas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_terminados" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estilo" TEXT NOT NULL,
    "descripcion" TEXT,
    "presentacion" TEXT NOT NULL,
    "capacidad" DECIMAL(65,30) NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "stock_actual" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "precio_base" DECIMAL(65,30),
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "imagen" TEXT,
    "notas" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "productos_terminados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_materia_prima" (
    "id" SERIAL NOT NULL,
    "materia_prima_id" INTEGER NOT NULL,
    "codigo_lote" TEXT NOT NULL,
    "proveedor_id" INTEGER NOT NULL,
    "fecha_recepcion" TIMESTAMP(3) NOT NULL,
    "fecha_produccion" TIMESTAMP(3),
    "fecha_caducidad" TIMESTAMP(3),
    "cantidad" DECIMAL(65,30) NOT NULL,
    "cantidad_disponible" DECIMAL(65,30) NOT NULL,
    "precio" DECIMAL(65,30),
    "orden_compra_id" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'Disponible',
    "notas" TEXT,

    CONSTRAINT "lotes_materia_prima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_movimiento" TEXT NOT NULL,
    "tipo_elemento" TEXT NOT NULL,
    "elemento_id" INTEGER NOT NULL,
    "lote_id" INTEGER,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "documento_referencia" TEXT,
    "referencia_id" INTEGER,
    "motivo" TEXT,
    "usuario_id" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "comuna" TEXT,
    "ciudad" TEXT,
    "pais" TEXT,
    "condicion_pago" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "calificacion" INTEGER,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "proveedor_id" INTEGER NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega_esperada" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'Borrador',
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "impuestos" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "usuario_registro_id" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "ordenes_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_orden_compra" (
    "id" SERIAL NOT NULL,
    "orden_compra_id" INTEGER NOT NULL,
    "materia_prima_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "precio_unitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "notas" TEXT,

    CONSTRAINT "detalles_orden_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recepciones_compra" (
    "id" SERIAL NOT NULL,
    "orden_compra_id" INTEGER NOT NULL,
    "fecha_recepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documento_referencia" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "usuario_registro_id" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "recepciones_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_recepcion_compra" (
    "id" SERIAL NOT NULL,
    "recepcion_compra_id" INTEGER NOT NULL,
    "detalle_orden_compra_id" INTEGER NOT NULL,
    "materia_prima_id" INTEGER NOT NULL,
    "lote_materia_prima_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "lote_proveedor" TEXT,
    "fecha_produccion" TIMESTAMP(3),
    "fecha_caducidad" TIMESTAMP(3),
    "notas" TEXT,

    CONSTRAINT "detalles_recepcion_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "centro_costos" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Activo',

    CONSTRAINT "centro_costos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" SERIAL NOT NULL,
    "fecha_gasto" TIMESTAMP(3) NOT NULL,
    "centro_costo_id" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "comprobante" TEXT,
    "usuario_registro_id" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recetas" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estilo" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "producto_terminado_id" INTEGER NOT NULL,
    "descripcion" TEXT,
    "volumen_final" DECIMAL(65,30) NOT NULL,
    "unidad_volumen" TEXT NOT NULL,
    "instrucciones" TEXT,
    "parametros_teoricos" JSONB,
    "rendimiento_esperado" DECIMAL(65,30),
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "usuario_creador_id" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),
    "notas" TEXT,

    CONSTRAINT "recetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_receta" (
    "id" SERIAL NOT NULL,
    "receta_id" INTEGER NOT NULL,
    "materia_prima_id" INTEGER NOT NULL,
    "etapa_produccion" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "tiempo_adicion" INTEGER,
    "unidad_tiempo" TEXT,
    "notas" TEXT,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "detalles_receta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_produccion" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "receta_id" INTEGER NOT NULL,
    "fecha_programada" TIMESTAMP(3) NOT NULL,
    "volumen_programado" DECIMAL(65,30) NOT NULL,
    "unidad_volumen" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Programada',
    "usuario_responsable_id" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_finalizacion" TIMESTAMP(3),
    "notas" TEXT,

    CONSTRAINT "ordenes_produccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_fabricacion" (
    "id" SERIAL NOT NULL,
    "orden_produccion_id" INTEGER NOT NULL,
    "codigo_lote" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'En Preparación',
    "volumen_obtenido" DECIMAL(65,30),
    "rendimiento_real" DECIMAL(65,30),
    "fecha_inicio" TIMESTAMP(3),
    "fecha_finalizacion" TIMESTAMP(3),
    "notas" TEXT,

    CONSTRAINT "lotes_fabricacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumo_materia_prima" (
    "id" SERIAL NOT NULL,
    "lote_fabricacion_id" INTEGER NOT NULL,
    "materia_prima_id" INTEGER NOT NULL,
    "lote_materia_prima_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "etapa_produccion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "consumo_materia_prima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametros_proceso" (
    "id" SERIAL NOT NULL,
    "lote_fabricacion_id" INTEGER NOT NULL,
    "etapa_produccion" TEXT NOT NULL,
    "parametro" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "fecha_medicion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    "en_rango" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,

    CONSTRAINT "parametros_proceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_calidad" (
    "id" SERIAL NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "referencia_tipo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "parametro" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "en_especificacion" BOOLEAN NOT NULL DEFAULT true,
    "fecha_analisis" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "control_calidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_producto" (
    "id" SERIAL NOT NULL,
    "producto_terminado_id" INTEGER NOT NULL,
    "codigo_lote" TEXT NOT NULL,
    "lote_fabricacion_id" INTEGER NOT NULL,
    "fecha_envasado" TIMESTAMP(3) NOT NULL,
    "fecha_optimo_consumo" TIMESTAMP(3),
    "fecha_caducidad" TIMESTAMP(3),
    "cantidad" DECIMAL(65,30) NOT NULL,
    "cantidad_disponible" DECIMAL(65,30) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Disponible',
    "ubicacion_fisica" TEXT,
    "notas" TEXT,

    CONSTRAINT "lotes_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "comuna" TEXT,
    "ciudad" TEXT,
    "lista_precios" TEXT,
    "condicion_pago" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "fecha_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega_programada" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "canal" TEXT NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "impuestos" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "usuario_registro_id" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_pedido" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "precio_unitario" DECIMAL(65,30) NOT NULL,
    "descuento" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "notas" TEXT,

    CONSTRAINT "detalles_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT,
    "pedido_id" INTEGER,
    "cliente_id" INTEGER NOT NULL,
    "fecha_venta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canal" TEXT NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "impuestos" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "metodo_pago" TEXT,
    "usuario_registro_id" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_venta" (
    "id" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "lote_producto_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "precio_unitario" DECIMAL(65,30) NOT NULL,
    "descuento" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "costo" DECIMAL(65,30),
    "margen" DECIMAL(65,30),
    "notas" TEXT,

    CONSTRAINT "detalles_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devoluciones" (
    "id" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "fecha_devolucion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "usuario_registro_id" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "devoluciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_devolucion" (
    "id" SERIAL NOT NULL,
    "devolucion_id" INTEGER NOT NULL,
    "detalle_venta_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "motivo" TEXT NOT NULL,
    "afecta_inventario" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,

    CONSTRAINT "detalles_devolucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envases_retornables" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "capacidad" DECIMAL(65,30) NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Disponible',
    "cliente_id" INTEGER,
    "venta_id" INTEGER,
    "fecha_salida" TIMESTAMP(3),
    "fecha_retorno_estimada" TIMESTAMP(3),
    "fecha_retorno_real" TIMESTAMP(3),
    "notas" TEXT,

    CONSTRAINT "envases_retornables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nombre_usuario_key" ON "usuarios"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_nombre_permiso_key" ON "permisos"("nombre_permiso");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_permisos_usuario_id_permiso_id_key" ON "usuarios_permisos"("usuario_id", "permiso_id");

-- CreateIndex
CREATE UNIQUE INDEX "recetas_codigo_version_key" ON "recetas"("codigo", "version");

-- AddForeignKey
ALTER TABLE "usuarios_permisos" ADD CONSTRAINT "usuarios_permisos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_permisos" ADD CONSTRAINT "usuarios_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_auditoria" ADD CONSTRAINT "log_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_materia_prima" ADD CONSTRAINT "lotes_materia_prima_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materias_primas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_materia_prima" ADD CONSTRAINT "lotes_materia_prima_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_materia_prima" ADD CONSTRAINT "lotes_materia_prima_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_usuario_registro_id_fkey" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_orden_compra" ADD CONSTRAINT "detalles_orden_compra_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_orden_compra" ADD CONSTRAINT "detalles_orden_compra_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materias_primas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones_compra" ADD CONSTRAINT "recepciones_compra_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones_compra" ADD CONSTRAINT "recepciones_compra_usuario_registro_id_fkey" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_recepcion_compra" ADD CONSTRAINT "detalles_recepcion_compra_recepcion_compra_id_fkey" FOREIGN KEY ("recepcion_compra_id") REFERENCES "recepciones_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_recepcion_compra" ADD CONSTRAINT "detalles_recepcion_compra_detalle_orden_compra_id_fkey" FOREIGN KEY ("detalle_orden_compra_id") REFERENCES "detalles_orden_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_recepcion_compra" ADD CONSTRAINT "detalles_recepcion_compra_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materias_primas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_recepcion_compra" ADD CONSTRAINT "detalles_recepcion_compra_lote_materia_prima_id_fkey" FOREIGN KEY ("lote_materia_prima_id") REFERENCES "lotes_materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_centro_costo_id_fkey" FOREIGN KEY ("centro_costo_id") REFERENCES "centro_costos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_usuario_registro_id_fkey" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_producto_terminado_id_fkey" FOREIGN KEY ("producto_terminado_id") REFERENCES "productos_terminados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_usuario_creador_id_fkey" FOREIGN KEY ("usuario_creador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_receta" ADD CONSTRAINT "detalles_receta_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "recetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_receta" ADD CONSTRAINT "detalles_receta_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materias_primas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "recetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_usuario_responsable_id_fkey" FOREIGN KEY ("usuario_responsable_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_fabricacion" ADD CONSTRAINT "lotes_fabricacion_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumo_materia_prima" ADD CONSTRAINT "consumo_materia_prima_lote_fabricacion_id_fkey" FOREIGN KEY ("lote_fabricacion_id") REFERENCES "lotes_fabricacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumo_materia_prima" ADD CONSTRAINT "consumo_materia_prima_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materias_primas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumo_materia_prima" ADD CONSTRAINT "consumo_materia_prima_lote_materia_prima_id_fkey" FOREIGN KEY ("lote_materia_prima_id") REFERENCES "lotes_materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumo_materia_prima" ADD CONSTRAINT "consumo_materia_prima_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametros_proceso" ADD CONSTRAINT "parametros_proceso_lote_fabricacion_id_fkey" FOREIGN KEY ("lote_fabricacion_id") REFERENCES "lotes_fabricacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametros_proceso" ADD CONSTRAINT "parametros_proceso_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_calidad" ADD CONSTRAINT "control_calidad_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_producto" ADD CONSTRAINT "lotes_producto_producto_terminado_id_fkey" FOREIGN KEY ("producto_terminado_id") REFERENCES "productos_terminados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_producto" ADD CONSTRAINT "lotes_producto_lote_fabricacion_id_fkey" FOREIGN KEY ("lote_fabricacion_id") REFERENCES "lotes_fabricacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usuario_registro_id_fkey" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_pedido" ADD CONSTRAINT "detalles_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_pedido" ADD CONSTRAINT "detalles_pedido_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos_terminados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_usuario_registro_id_fkey" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_venta" ADD CONSTRAINT "detalles_venta_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_venta" ADD CONSTRAINT "detalles_venta_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos_terminados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_venta" ADD CONSTRAINT "detalles_venta_lote_producto_id_fkey" FOREIGN KEY ("lote_producto_id") REFERENCES "lotes_producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_usuario_registro_id_fkey" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_devolucion" ADD CONSTRAINT "detalles_devolucion_devolucion_id_fkey" FOREIGN KEY ("devolucion_id") REFERENCES "devoluciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_devolucion" ADD CONSTRAINT "detalles_devolucion_detalle_venta_id_fkey" FOREIGN KEY ("detalle_venta_id") REFERENCES "detalles_venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_devolucion" ADD CONSTRAINT "detalles_devolucion_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos_terminados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envases_retornables" ADD CONSTRAINT "envases_retornables_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envases_retornables" ADD CONSTRAINT "envases_retornables_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
