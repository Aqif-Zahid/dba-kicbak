-- Create usernames table with RLS
create table if not exists public.usernames (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.usernames enable row level security;

-- Create RLS policies
create policy "Users can view all usernames"
  on public.usernames for select
  using (true);

create policy "Users can insert their own username"
  on public.usernames for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own username"
  on public.usernames for update
  using (auth.uid() = user_id);

create policy "Users can delete their own username"
  on public.usernames for delete
  using (auth.uid() = user_id);

-- Create index for faster username lookups
create index if not exists idx_usernames_username on public.usernames(username);
create index if not exists idx_usernames_user_id on public.usernames(user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create trigger to automatically update updated_at
drop trigger if exists on_usernames_updated on public.usernames;
create trigger on_usernames_updated
  before update on public.usernames
  for each row
  execute function public.handle_updated_at();
