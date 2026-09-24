# Lanuvi

Tienda en línea de **Lanuvi**, marca de lácteos artesanales: yogures fermentados lentos,
mermeladas de fruta de finca y postres cuchareables. Incluye la tienda para clientes y un
panel de administración para el vendedor.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS** y **Lucide React**
- **Prisma** sobre PostgreSQL (Supabase en producción)
- **Zustand** con persistencia para el carrito

## Puesta en marcha local

```bash
git clone https://github.com/marlont26/lanuvi.git
cd lanuvi
npm install
cp .env.example .env
# apunta DATABASE_URL / DIRECT_URL a tu Postgres (Supabase o local) y
# define tu clave del panel, por ejemplo:
sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=\"$(openssl rand -base64 18)\"|" .env
npm run setup   # prisma generate + db push + seed con datos de Lanuvi
npm run dev
```

La tienda queda en http://localhost:3000 y el panel en http://localhost:3000/admin, que pide
la contraseña de `ADMIN_PASSWORD`. El repo no trae ninguna por defecto: si la dejas vacía,
el panel queda bloqueado.

### Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Conexión PostgreSQL de Prisma. En Supabase, la del *pooler* (puerto 6543) con `?pgbouncer=true&connection_limit=1`. |
| `DIRECT_URL` | Conexión directa (puerto 5432); la usan `prisma db push` y las migraciones. |
| `NEXT_PUBLIC_NEQUI_PHONE` | Celular Nequi que ve el cliente en el checkout. |
| `NEXT_PUBLIC_NEQUI_HOLDER` | Titular de la cuenta Nequi. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número que recibe los pedidos por WhatsApp. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROOF_BUCKET` | Suben los comprobantes a Supabase Storage. Si están vacías, los comprobantes se guardan en `public/uploads` (solo sirve en local). |
| `ADMIN_PASSWORD` | Contraseña del panel (defínela tú). Si está vacía, `/admin` y sus APIs quedan bloqueados. |

### Supabase

1. Crea el proyecto y copia las dos cadenas de conexión en `DATABASE_URL` (pooler) y
   `DIRECT_URL` (directa).
2. Para guardar comprobantes, crea un bucket **público** llamado `comprobantes` en Storage
   y llena `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (la clave de servicio nunca se
   expone al navegador: solo la usa `/api/payment-proof`).
3. Ejecuta `npm run setup`: `prisma generate` + `prisma db push` (crea las tablas usando
   `DIRECT_URL`) + `prisma db seed`. El seed **borra** productos y pedidos existentes, así
   que en una base con datos reales usa solo `npm run db:push`.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y ejecución de producción |
| `npm run lint` / `npm run typecheck` | ESLint y TypeScript |
| `npm run setup` | Genera el cliente Prisma, crea el esquema en Postgres y siembra datos |
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
- Checkout con datos de entrega y **pago manual**: transferencia Nequi/celular (muestra
  número, titular, monto e instrucciones, con campo opcional de referencia y adjunto del
  comprobante) o coordinación por **WhatsApp**. El pedido nace en estado
  `PENDING_PAYMENT` y queda visible en `/pedido/<código>?t=<token>`, con un token secreto
  que solo recibe quien compra.
- Diseño mobile-first en todas las vistas.

### Panel de administración (`/admin`)

Protegido con contraseña (`ADMIN_PASSWORD`): un middleware exige la sesión en `/admin/**` y en
las APIs de productos y pedidos; lo único público es `POST /api/orders`, que usa el checkout.

- **Resumen**: ingresos, pedidos, ticket promedio, más vendidos, ingresos por categoría y
  alertas de inventario bajo.
- **Productos**: crear, editar y eliminar productos con sus presentaciones (sabor, tamaño,
  precio, stock). Los productos con pedidos históricos se archivan en vez de borrarse.
- **Pedidos**: tabla con detalle expandible, referencia y comprobante del pago Nequi,
  botones de un clic para marcar **Pagado** o **Cancelado**, y cambio de estado completo
  (Pago por verificar, Pagado, En preparación, Enviado, Entregado, Cancelado). Los pedidos
  cancelados no suman en las métricas de ventas.

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
| `POST` | `/api/payment-proof` | Sube la foto del comprobante (JPG/PNG/WEBP/PDF, máx. 5 MB) |
| `POST` | `/api/admin/login` / `/api/admin/logout` | Abrir y cerrar la sesión del panel |

Todas requieren sesión de administración salvo `POST /api/orders` y
`POST /api/payment-proof`, que usa el checkout.

Las imágenes de producto son ilustraciones SVG generadas localmente, por lo que el proyecto
funciona sin servicios externos.
