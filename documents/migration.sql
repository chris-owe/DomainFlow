-- 域流 v1 数据库表
-- 在 Supabase SQL Editor 中运行此文件

-- 1. 领域表
create table domains (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  color text default '#06B6D4',
  icon text default '📁',
  sort_order int default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 默认四个领域
insert into domains (name, description, color, icon, sort_order) values
  ('工作', '开发任务、项目管理、技术文档', '#0EA5E9', '📁', 1),
  ('考试', '学习计划、笔记、复习', '#8B5CF6', '📁', 2),
  ('技能', '技能拓展、教程笔记、练手项目', '#10B981', '📁', 3),
  ('内容创作', '公众号/视频号/抖音等选题、素材、排期', '#F59E0B', '📁', 4);

-- 2. 任务表
create table tasks (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references domains(id) on delete cascade,
  title text not null,
  description text default '',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  priority text not null default 'P2' check (priority in ('P0', 'P1', 'P2', 'P3')),
  due_date date,
  is_recurring boolean default false,
  recurring_days int[] default null,
  sort_order int default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index tasks_domain_id_idx on tasks(domain_id);
create index tasks_status_idx on tasks(status);
create index tasks_due_date_idx on tasks(due_date);

-- 3. 笔记表
create table notes (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references domains(id) on delete cascade,
  title text not null default '',
  content text default '',
  sort_order int default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index notes_domain_id_idx on notes(domain_id);

-- 4. 收集箱表
create table inbox_items (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  item_type text not null default 'task' check (item_type in ('task', 'note')),
  processed boolean default false,
  deadline date not null,
  created_at timestamp default now()
);

create index inbox_items_deadline_idx on inbox_items(deadline);
