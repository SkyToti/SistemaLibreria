-Tabla books

create table public.books (
  id uuid not null default gen_random_uuid (),
  isbn character varying(20) not null,
  title character varying(255) not null,
  author character varying(255) not null,
  category character varying(100) not null,
  purchase_price numeric(10, 2) not null,
  sale_price numeric(10, 2) not null,
  stock_quantity integer null default 0,
  description text null,
  cover_image_url text null,
  supplier_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint books_pkey primary key (id),
  constraint books_isbn_key unique (isbn),
  constraint books_supplier_id_fkey foreign KEY (supplier_id) references suppliers (id)
) TABLESPACE pg_default;

create index IF not exists idx_books_isbn on public.books using btree (isbn) TABLESPACE pg_default;

create index IF not exists idx_books_title on public.books using btree (title) TABLESPACE pg_default;

create index IF not exists idx_books_category on public.books using btree (category) TABLESPACE pg_default;

create trigger on_stock_change
after
update on books for EACH row
execute FUNCTION log_inventory_change ();




-Tabla inventory_logs

create table public.inventory_logs (
  id uuid not null default gen_random_uuid (),
  book_id uuid not null,
  user_id uuid not null,
  type character varying(20) not null,
  quantity_change integer not null,
  previous_stock integer not null,
  new_stock integer not null,
  reason text null,
  created_at timestamp with time zone null default now(),
  constraint inventory_logs_pkey primary key (id),
  constraint inventory_logs_book_id_fkey foreign KEY (book_id) references books (id),
  constraint inventory_logs_user_id_fkey foreign KEY (user_id) references users (id),
  constraint inventory_logs_type_check check (
    (
      (type)::text = any (
        (
          array[
            'entry'::character varying,
            'exit'::character varying,
            'adjustment'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_inventory_logs_book_id on public.inventory_logs using btree (book_id) TABLESPACE pg_default;

create index IF not exists idx_inventory_logs_created_at on public.inventory_logs using btree (created_at) TABLESPACE pg_default;





-Tabla sales_items


create table public.sale_items (
  id uuid not null default gen_random_uuid (),
  sale_id uuid not null,
  book_id uuid not null,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  total_price numeric(10, 2) not null,
  constraint sale_items_pkey primary key (id),
  constraint sale_items_book_id_fkey foreign KEY (book_id) references books (id),
  constraint sale_items_sale_id_fkey foreign KEY (sale_id) references sales (id)
) TABLESPACE pg_default;

create index IF not exists idx_sale_items_sale_id on public.sale_items using btree (sale_id) TABLESPACE pg_default;

create index IF not exists idx_sale_items_book_id on public.sale_items using btree (book_id) TABLESPACE pg_default;





-Tabla sales

create table public.sales (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  total_amount numeric(10, 2) not null,
  discount_amount numeric(10, 2) null default 0,
  payment_method character varying(20) null,
  notes text null,
  sale_date timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  constraint sales_pkey primary key (id),
  constraint sales_user_id_fkey foreign KEY (user_id) references users (id),
  constraint sales_payment_method_check check (
    (
      (payment_method)::text = any (
        (
          array[
            'cash'::character varying,
            'card'::character varying,
            'transfer'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_sales_user_id on public.sales using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_sales_sale_date on public.sales using btree (sale_date) TABLESPACE pg_default;







-Tabla suppliers



create table public.suppliers (
  id uuid not null default gen_random_uuid (),
  name character varying(255) not null,
  contact_person character varying(255) null,
  phone character varying(50) null,
  email character varying(255) null,
  address text null,
  status character varying(20) null default 'active'::character varying,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint suppliers_pkey primary key (id),
  constraint suppliers_status_check check (
    (
      (status)::text = any (
        (
          array[
            'active'::character varying,
            'inactive'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;





-Tabla users



create table public.users (
  id uuid not null default gen_random_uuid (),
  email character varying(255) not null,
  full_name character varying(255) null,
  role character varying(20) null default 'employee'::character varying,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_role_check check (
    (
      (role)::text = any (
        (
          array[
            'admin'::character varying,
            'employee'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;