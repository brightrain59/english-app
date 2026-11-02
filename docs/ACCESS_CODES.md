# 이용권 코드 운영 안내

## 정책
| 종류 | 대상 | 기간(첫 사용일부터) | 기기 수 |
|---|---|---|---|
| 레벨 이용권 | 한 레벨 20단원 | 1년 | 3대 |
| 전체 이용권 | Level 1~4 (80단원) | 1년 | 3대 |
| 학원 이용권 | 레벨(또는 전체) | 1년 | 30대(학생 30명) |
| 단원 이용권(선택) | 지정한 단원 | 30일 | 3대 |

무료: Unit 1, 2, 21, 22, 41, 42, 61, 62 (`src/lib/access.js`의 `FREE_UNITS`).

## 처음 한 번: 서버(Supabase) 준비
1. https://supabase.com 에서 프로젝트 만들기(무료).
2. 왼쪽 **SQL Editor** → 새 쿼리에 `supabase/schema.sql` 전체를 붙여 넣고 **Run**.
3. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키를 복사.
4. 프로젝트 폴더에 `.env.local` 파일을 만들고 다음 두 줄을 적기(이 파일은 GitHub에 올라가지 않음):
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. 앱을 배포하는 곳(Vercel, Netlify 등)의 환경 변수에도 같은 두 값을 등록하고 다시 배포.

## 코드 만들기
```
node tools/make-codes.mjs --kind level --level 1 --count 50 --label 스마트스토어
node tools/make-codes.mjs --kind all --count 10 --label 전체권
node tools/make-codes.mjs --kind level --level 2 --count 1 --devices 30 --label "OO학원 중2"
```
`private/` 폴더에 `.csv`(판매용 목록)와 `.sql` 이 생깁니다. `.sql` 내용을 Supabase **SQL Editor**에 붙여 넣고 Run 하면 코드가 등록됩니다. (`private/` 는 GitHub에 올라가지 않습니다.)

## 운영 중에 자주 쓰는 SQL (SQL Editor)
```sql
-- 코드 사용 중지(환불·유출)
update access_codes set revoked = true where code = 'XXXXXXXXXXXX';
-- 이 코드가 몇 대에서 쓰였나
select device_id, activated_at from code_activations where code = 'XXXXXXXXXXXX';
-- 기기 한 대 풀어 주기(학생이 휴대폰을 바꾼 경우)
delete from code_activations where code = 'XXXXXXXXXXXX' and device_id = '...';
-- 기간 연장
update access_codes set expires_at = expires_at + interval '30 days' where code = 'XXXXXXXXXXXX';
```

## 한계
- 코드 확인은 서버에서 하지만, 유료 단원의 데이터와 음성 파일은 아직 앱 안에 들어 있습니다. 기술을 아는 사람은 우회할 수 있습니다. 확실히 막으려면 유료 단원 파일을 서버에서 코드 확인 후에만 내려주도록 바꿔야 합니다.
- 기기 수는 브라우저 단위입니다. 같은 폰에서 브라우저를 바꾸거나 저장 데이터를 지우면 새 기기로 셉니다.
