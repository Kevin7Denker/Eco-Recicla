-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum for user roles
create type public.app_role as enum ('admin', 'citizen');

-- Create enum for material types
create type public.material_type as enum ('papel', 'plastico', 'vidro', 'metal', 'outro');

-- ============================================
-- PROFILES TABLE
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  points_balance integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

-- ============================================
-- USER ROLES TABLE
-- ============================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- ============================================
-- COLLECTION POINTS TABLE
-- ============================================
create table public.collection_points (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  opening_hours text not null,
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.collection_points enable row level security;

-- ============================================
-- PARTNERS TABLE
-- ============================================
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  logo_url text,
  contact_email text not null,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.partners enable row level security;

-- ============================================
-- COUPONS TABLE
-- ============================================
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete cascade not null,
  title text not null,
  description text not null,
  points_required integer not null check (points_required > 0),
  expiration_date timestamp with time zone not null,
  quantity_available integer not null check (quantity_available >= 0),
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.coupons enable row level security;

-- ============================================
-- REDEMPTIONS TABLE
-- ============================================
create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  coupon_id uuid references public.coupons(id) on delete cascade not null,
  redeemed_at timestamp with time zone not null default now()
);

alter table public.redemptions enable row level security;

-- ============================================
-- DELIVERIES TABLE
-- ============================================
create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  collection_point_id uuid references public.collection_points(id) on delete cascade not null,
  material_type material_type not null,
  weight_kg numeric(10, 2) not null check (weight_kg > 0),
  points_earned integer not null check (points_earned >= 0),
  created_at timestamp with time zone not null default now()
);

alter table public.deliveries enable row level security;

-- ============================================
-- FEEDBACKS TABLE
-- ============================================
create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone not null default now()
);

alter table public.feedbacks enable row level security;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Function to create profile automatically on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    new.email
  );
  
  -- Assign default 'citizen' role
  insert into public.user_roles (user_id, role)
  values (new.id, 'citizen');
  
  return new;
end;
$$;

-- Security definer function to check user role
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at on profiles
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

-- Trigger to update updated_at on collection_points
create trigger update_collection_points_updated_at
before update on public.collection_points
for each row
execute function public.update_updated_at_column();

-- Trigger to update updated_at on partners
create trigger update_partners_updated_at
before update on public.partners
for each row
execute function public.update_updated_at_column();

-- Trigger to update updated_at on coupons
create trigger update_coupons_updated_at
before update on public.coupons
for each row
execute function public.update_updated_at_column();

-- Trigger to create profile on user signup
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- PROFILES POLICIES
create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

create policy "Admins can view all profiles"
on public.profiles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES POLICIES
create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can manage all roles"
on public.user_roles for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- COLLECTION_POINTS POLICIES
create policy "Anyone can view active collection points"
on public.collection_points for select
to authenticated
using (active = true);

create policy "Admins can view all collection points"
on public.collection_points for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert collection points"
on public.collection_points for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update collection points"
on public.collection_points for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete collection points"
on public.collection_points for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- PARTNERS POLICIES
create policy "Anyone can view active partners"
on public.partners for select
to authenticated
using (active = true);

create policy "Admins can view all partners"
on public.partners for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage partners"
on public.partners for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- COUPONS POLICIES
create policy "Anyone can view active non-expired coupons"
on public.coupons for select
to authenticated
using (active = true and expiration_date > now() and quantity_available > 0);

create policy "Admins can view all coupons"
on public.coupons for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage coupons"
on public.coupons for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- REDEMPTIONS POLICIES
create policy "Users can view their own redemptions"
on public.redemptions for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create redemptions"
on public.redemptions for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Admins can view all redemptions"
on public.redemptions for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- DELIVERIES POLICIES
create policy "Users can view their own deliveries"
on public.deliveries for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create deliveries"
on public.deliveries for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Admins can view all deliveries"
on public.deliveries for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- FEEDBACKS POLICIES
create policy "Users can view their own feedbacks"
on public.feedbacks for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create feedbacks"
on public.feedbacks for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Admins can view all feedbacks"
on public.feedbacks for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_user_roles_role on public.user_roles(role);
create index idx_collection_points_active on public.collection_points(active);
create index idx_collection_points_location on public.collection_points(latitude, longitude);
create index idx_partners_active on public.partners(active);
create index idx_coupons_partner_id on public.coupons(partner_id);
create index idx_coupons_active_expiration on public.coupons(active, expiration_date) where active = true;
create index idx_redemptions_user_id on public.redemptions(user_id);
create index idx_redemptions_coupon_id on public.redemptions(coupon_id);
create index idx_deliveries_user_id on public.deliveries(user_id);
create index idx_deliveries_collection_point_id on public.deliveries(collection_point_id);
create index idx_feedbacks_user_id on public.feedbacks(user_id);