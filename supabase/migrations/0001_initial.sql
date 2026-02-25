-- ============================================================
-- 데일리 스크럼 초기 데이터베이스 스키마
-- ============================================================

-- profiles 테이블 (auth.users와 1:1)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- work_logs 테이블
CREATE TABLE work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- work_items 테이블
CREATE TABLE work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_log_id UUID NOT NULL REFERENCES work_logs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tag TEXT NOT NULL,
  status TEXT NOT NULL,
  item_order INTEGER NOT NULL DEFAULT 0
);

-- daily_scrums 테이블
CREATE TABLE daily_scrums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  yesterday JSONB NOT NULL DEFAULT '[]',
  today JSONB NOT NULL DEFAULT '[]',
  blocker TEXT NOT NULL DEFAULT '',
  format TEXT NOT NULL DEFAULT 'slack',
  share_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  is_team_scrum BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- teams 테이블
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- team_members 테이블
CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  PRIMARY KEY (team_id, user_id)
);

-- ============================================================
-- RLS (Row Level Security) 활성화
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scrums ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS 정책
-- ============================================================

-- profiles: 본인만 조회/수정 가능
CREATE POLICY "본인 프로필 조회" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "본인 프로필 수정" ON profiles FOR ALL USING (auth.uid() = id);

-- work_logs: 본인 워크로그만 접근
CREATE POLICY "본인 워크로그" ON work_logs FOR ALL USING (auth.uid() = user_id);

-- work_items: 본인 워크로그에 속한 아이템만 접근
CREATE POLICY "본인 워크아이템" ON work_items FOR ALL USING (
  EXISTS (SELECT 1 FROM work_logs WHERE work_logs.id = work_items.work_log_id AND work_logs.user_id = auth.uid())
);

-- daily_scrums: 본인 스크럼 CRUD + share_id 공개 조회
CREATE POLICY "본인 스크럼 CRUD" ON daily_scrums FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "share_id 공개 조회" ON daily_scrums FOR SELECT TO anon USING (share_id IS NOT NULL);

-- teams: 관리자만 접근
CREATE POLICY "팀 관리자" ON teams FOR ALL USING (auth.uid() = admin_user_id);

-- team_members: 팀원 조회 + 관리자 관리
CREATE POLICY "팀원 조회" ON team_members FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.admin_user_id = auth.uid())
);
CREATE POLICY "팀원 관리" ON team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.admin_user_id = auth.uid())
);

-- ============================================================
-- 트리거: auth.users INSERT 시 profiles 자동 생성
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
