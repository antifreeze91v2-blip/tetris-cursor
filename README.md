# 테트리스 (Tetris)

HTML, CSS, JavaScript만 사용하는 **브라우저 테트리스 교육용 프로젝트**입니다.  
빌드 도구나 외부 라이브러리 없이 바로 실행할 수 있습니다.

## 프로젝트 소개

- **목적:** 프론트엔드 입문자가 DOM, 이벤트, 게임 루프를 학습하기 위한 실습 프로젝트
- **기술 스택:** HTML5, CSS Grid, Vanilla JavaScript
- **보드 크기:** 10열 × 20행
- **블록 종류:** I, O, T, S, Z, J, L (7종)

## 실행 방법

### 방법 1: 파일 직접 열기

1. 저장소를 클론하거나 ZIP으로 다운로드합니다.
2. `index.html`을 더블클릭하거나 브라우저로 드래그합니다.

### 방법 2: 로컬 서버 (권장)

```bash
cd tetris-cursor
python -m http.server 8000
```

브라우저에서 [http://localhost:8000](http://localhost:8000) 으로 접속합니다.

> 로컬 서버는 개발·점검 시 권장됩니다. GitHub Pages 배포 후에도 동일하게 동작합니다.

## 조작법

1. **시작** 버튼을 눌러 게임을 시작합니다.
2. 아래 키로 블록을 조작합니다.

| 키 | 동작 |
|---|---|
| ← (ArrowLeft) | 왼쪽 이동 |
| → (ArrowRight) | 오른쪽 이동 |
| ↓ (ArrowDown) | 한 칸 빠르게 내리기 (soft drop) |
| ↑ (ArrowUp) | 블록 회전 |
| Space | hard drop (즉시 바닥까지 낙하) |

3. 게임 오버 시 **재시작** 버튼으로 다시 플레이합니다.

모든 조작은 충돌 판정(`canMove`)을 통과할 때만 적용됩니다. 회전 후 벽이나 고정 블록과 겹치면 회전이 취소됩니다.

## 구현 기능

| 기능 | 설명 |
|---|---|
| 보드 렌더링 | CSS Grid 기반 10×20 격자 |
| 블록 표시 | 7종 테트로미노 생성·렌더링 |
| 자동 낙하 | 0.8초 간격으로 1칸 하강 |
| 충돌 판정 | 벽·고정 블록·보드 밖 이동 차단 |
| 키보드 조작 | 좌우 이동, soft/hard drop, 회전 |
| 블록 고정 | 착지 시 보드에 기록 후 새 블록 스폰 |
| 라인 삭제 | 가로 한 줄이 가득 차면 삭제·상단 행 추가 |
| 점수 | 삭제 줄 수에 따라 100 / 300 / 500 / 800 가산 |
| 게임 오버 | 스폰 불가 시 종료, 상태 패널 표시 |
| 재시작 | 보드·점수·타이머·상태 초기화 |

### 점수 규칙

한 번에 삭제한 줄 수 기준으로 점수가 **한 번에** 더해집니다.

| 삭제 줄 수 | 점수 |
|---|---|
| 1줄 | 100 |
| 2줄 | 300 |
| 3줄 | 500 |
| 4줄 | 800 |

### 게임 오버 조건

블록을 고정한 뒤 새 블록을 스폰할 위치(상단 중앙)에 고정 블록이 있어 배치할 수 없으면 게임 오버입니다.

## 품질 점검 방법

배포 전 아래 항목을 확인합니다.

1. **파일 연결:** `index.html`이 `style.css`, `script.js`를 상대 경로로 로드하는지
2. **기본 플레이:** 시작 → 낙하 → 좌우 이동 → 회전 → hard drop
3. **라인·점수:** 한 줄 완성 시 삭제 및 점수 증가
4. **게임 오버:** 상단까지 쌓은 뒤 종료·상태 표시 확인
5. **재시작:** 보드·점수 0·낙하 재개
6. **콘솔:** 브라우저 개발자 도구(F12) → Console 탭에 에러 없음

### 빠른 수동 체크리스트

- [ ] **시작** 후 블록 자동 낙하
- [ ] `←` `→` `↓` `↑` `Space` 정상 동작
- [ ] 라인 삭제 및 점수 반영
- [ ] 게임 오버 후 **재시작** 정상
- [ ] 콘솔 에러 없음

## GitHub Pages 배포 방법

### 1. 저장소 준비

```bash
git init
git add index.html style.css script.js README.md .gitignore
git commit -m "Add Tetris game for GitHub Pages"
git branch -M main
git remote add origin https://github.com/<사용자명>/<저장소명>.git
git push -u origin main
```

### 2. GitHub Pages 설정

1. GitHub 저장소 → **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **main**, Folder: **/ (root)**
4. **Save** 클릭

### 3. 배포 확인

1~2분 후 아래 URL로 접속합니다.

```
https://<사용자명>.github.io/<저장소명>/
```

예: 저장소가 `tetris-cursor`이고 사용자명이 `myuser`인 경우  
→ `https://myuser.github.io/tetris-cursor/`

> 이 프로젝트는 루트에 `index.html`이 있으므로 **별도 빌드 없이** 배포할 수 있습니다. CSS·JS는 상대 경로(`style.css`, `script.js`)를 사용해 Pages에서도 정상 로드됩니다.

## 파일 구조

```
tetris-cursor/
├── index.html   # 게임 화면 구조
├── style.css    # 스타일
├── script.js    # 게임 로직
├── README.md    # 프로젝트 안내
└── .gitignore   # Git 제외 목록 (선택)
```

## 라이선스

교육용 프로젝트입니다. 자유롭게 학습·수정·배포할 수 있습니다.
