-- 圃場・ハウス区画の栽培方式を「ハウス/露地」から「高設栽培/土耕栽培」に変更
-- 既存データを保持するため DROP/CREATE ではなく RENAME VALUE を使用
ALTER TYPE "FieldType" RENAME VALUE 'OPEN_FIELD' TO 'SOIL';
ALTER TYPE "FieldType" RENAME VALUE 'GREENHOUSE' TO 'RAISED_BED';
