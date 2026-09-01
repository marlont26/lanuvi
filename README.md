# Lanuvi

Tienda en línea de **Lanuvi**, marca de lácteos artesanales: yogures fermentados lentos,
mermeladas de fruta de finca y postres cuchareables. Incluye la tienda para clientes y un
panel de administración para el vendedor.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS** y **Lucide React**
- **Prisma** sobre SQLite por defecto (se puede cambiar a PostgreSQL)
- **Zustand** con persistencia para el carrito

## Puesta en marcha local

```bash
git clone https://github.com/marlont26/lanuvi.git
cd lanuvi
npm install
cp .env.example .env
npm run setup   # prisma generate + db push + seed con datos de Lanuvi
npm run dev
```

La tienda queda en http://localhost:3000 y el panel en http://localhost:3000/admin.

### Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión de Prisma. Por defecto `file:./dev.db` (SQLite). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número que recibe la confirmación de pedidos por WhatsApp. |
| `NEXT_PUBLIC_ONLINE_PAYMENTS_ENABLED` | Muestra el pago en línea (Stripe/MercadoPago) en modo prueba. |

### Usar PostgreSQL en lugar de SQLite

1. En `prisma/schema.prisma` cambia `provider = "sqlite"` por `provider = "postgresql"`.
2. Ajusta `DATABASE_URL` con la cadena de Postgres.
3. Ejecuta `npm run setup`.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y ejecución de producción |
| `npm run lint` / `npm run typecheck` | ESLint y TypeScript |
| `npm run setup` | Genera el cliente Prisma, crea el esquema y siembra datos |
| `npm run db:reset` | Recrea la base y vuelve a sembrar (12 productos, 5 pedidos) |
| `npm run images` | Regenera las ilustraciones SVG de `public/products` |

## Funcionalidades

### Tienda

- Home con hero artesanal, accesos por categoría (yogures, mermeladas, cuchareables) y destacados.
- Catálogo con buscador, filtro por categoría y precio, y ordenamiento.
- Ficha de producto con galería, pestaña de información nutricional, selector de sabor y
  tamaño, disponibilidad de inventario y agregar al carrito.
- Carrito lateral persistente con cálculo dinámico de subtotal, domicilio (gratis desde
  $90.000) y total.
- Checkout con datos de entrega y confirmación por **WhatsApp** o **pago en línea en modo
  prueba**; el pedido queda guardado y visible en `/pedido/<código>`.
- Diseño mobile-first en todas las vistas.

### Panel de administración (`/admin`)

- **Resumen**: ingresos, pedidos, ticket promedio, más vendidos, ingresos por categoría y
  alertas de inventario bajo.
- **Productos**: crear, editar y eliminar productos con sus presentaciones (sabor, tamaño,
  precio, stock). Los productos con pedidos históricos se archivan en vez de borrarse.
- **Pedidos**: tabla con detalle expandible y cambio de estado (Pendiente, En preparación,
  Enviado, Entregado).

## Estructura

```
prisma/           esquema y seed con los productos de Lanuvi
scripts/          generador de imágenes SVG de muestra
src/app/(store)/  tienda: home, catálogo, PDP, checkout, confirmación
src/app/admin/    panel del vendedor
src/app/api/      endpoints REST de productos y pedidos
src/components/   UI de tienda y de administración
src/lib/          Prisma, consultas, validación, catálogo y utilidades
src/store/        carrito con Zustand
```

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` / `POST` | `/api/products` | Listar y crear productos |
| `GET` / `PUT` / `DELETE` | `/api/products/:id` | Detalle, edición y borrado/archivado |
| `GET` / `POST` | `/api/orders` | Listar y crear pedidos (valida stock y lo descuenta en una transacción) |
| `PATCH` / `DELETE` | `/api/orders/:id` | Cambiar estado o eliminar un pedido |

Las imágenes de producto son ilustraciones SVG generadas localmente, por lo que el proyecto
funciona sin servicios externos.
