import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. 감시할 데이터 파일 목록
const DATA_DIR = path.join(__dirname, '../src/data');
const TARGET_FILES = [
  'apostles.json',
  'skills.json',
  'asides.json',
  'spells.json',
  'artifacts.json',
];

const VERSION_FILE_PATH = path.join(DATA_DIR, 'version.json');

// 파일 해시 계산 함수
function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

// 메인 로직
function updateVersionFile() {
  const now = new Date();

  // 기존 버전 파일 읽기 (이전 상태 보존을 위해)
  let previousData = { files: {} };
  if (fs.existsSync(VERSION_FILE_PATH)) {
    try {
      previousData = JSON.parse(fs.readFileSync(VERSION_FILE_PATH, 'utf-8'));
    } catch (e) {
      console.warn('⚠️ Failed to parse existing version.json, starting fresh.');
    }
  }

  const newFilesInfo = {};
  let isAnyFileChanged = false;
  let latestUpdate = new Date(0); // 가장 최근 업데이트 시간 추적

  TARGET_FILES.forEach((fileName) => {
    const filePath = path.join(DATA_DIR, fileName);
    const currentHash = getFileHash(filePath);

    if (!currentHash) {
      // 파일이 없으면 스킵
      return;
    }

    const prevFileInfo = previousData.files?.[fileName];

    // 변경 감지: 이전 정보가 없거나, 해시가 다르면 업데이트
    if (!prevFileInfo || prevFileInfo.hash !== currentHash) {
      newFilesInfo[fileName] = {
        hash: currentHash,
        updated: now.toISOString(),
      };
      isAnyFileChanged = true;
      latestUpdate = now;
      console.log(`📝 [Changed] ${fileName}`);
    } else {
      // 변경 없음: 이전 정보 유지
      newFilesInfo[fileName] = prevFileInfo;

      // 가장 최근 업데이트 시간 갱신 (기존 파일들의 시간 중 가장 최신값 찾기)
      const prevDate = new Date(prevFileInfo.updated);
      if (prevDate > latestUpdate) {
        latestUpdate = prevDate;
      }
    }
  });

  // 전체 버전 문자열 생성 (날짜 + 전체 파일 해시 조합)
  // 전체 해시는 파일들의 해시를 모두 합쳐서 다시 해시를 뜸
  const allHashes = Object.values(newFilesInfo)
    .map((f) => f.hash)
    .sort()
    .join('');
  const globalHash = crypto.createHash('md5').update(allHashes).digest('hex').substring(0, 8);

  const dateStr = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  })
    .format(latestUpdate)
    .replace(/[.\s]/g, '');

  const versionData = {
    projectVersion: `${dateStr}-${globalHash}`,
    lastUpdated: latestUpdate.toISOString(),
    files: newFilesInfo,
  };

  // 변경사항이 있거나 파일이 아예 없었으면 저장
  if (isAnyFileChanged || !fs.existsSync(VERSION_FILE_PATH)) {
    fs.writeFileSync(VERSION_FILE_PATH, JSON.stringify(versionData, null, 2));
    console.log(`✅ Version Info Updated: ${versionData.projectVersion}`);
  } else {
    console.log(`⚡ No changes detected. Version: ${versionData.projectVersion}`);
  }
}

updateVersionFile();
