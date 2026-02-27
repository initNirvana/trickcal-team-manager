import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  const effectiveDate = '2026년 1월 28일';

  return (
    <div className="container mx-auto max-w-3xl p-6 pb-20">
      <div className="mb-6 flex items-center gap-4 border-b pb-4">
        <Link to="/settings" className="btn btn-ghost btn-circle" aria-label="설정으로 돌아가기">
          <FaArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-base-content">개인정보 처리방침</h1>
      </div>

      <div className="prose prose-sm sm:prose-base max-w-none space-y-8 text-base-content">
        <header className="text-right">
          <p className="text-sm text-gray-500">시행일: {effectiveDate}</p>
        </header>

        <section>
          <p>
            <strong>[트릭컬 팀 매니저]</strong>(이하 "서비스")는 「개인정보 보호법」 제30조에 따라
            정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록
            하기 위하여 다음과 같이 개인정보 처리방침을 수립 및 공개합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">0. 운영자 정보</h2>
          <ul className="list-disc pl-5">
            <li>
              <strong>운영 형태:</strong> 개인(1인) 운영
            </li>
            <li>
              <strong>담당자:</strong> Nirvana
            </li>
            <li>
              <strong>연락처(이메일):</strong> kimqqyun@gmail.com
            </li>
            <li>
              <strong>연락처(전화):</strong> 미기재 (이메일로 문의해 주십시오)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">1. 처리 목적 및 법적 근거</h2>
          <p>
            다음의 목적을 위하여 개인정보를 처리합니다. 이용 목적이 변경되는 경우에는 별도의 동의를
            받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="table-compact table w-full border text-xs">
              <thead>
                <tr className="bg-base-200">
                  <th>처리 목적</th>
                  <th>항목</th>
                  <th>법적 근거</th>
                  <th>보유 기간</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td>회원관리·인증</td>
                  <td>구글 OAuth 식별자, 이메일</td>
                  <td>법 제15조 (계약 이행)</td>
                  <td>회원 탈퇴 시까지</td>
                </tr>
                <tr>
                  <td>개선·통계</td>
                  <td>사도/덱/스펠 선택 등 이용 데이터 (원자료)</td>
                  <td>법 제15조 (정당한 이익)</td>
                  <td>탈퇴 시까지</td>
                </tr>
                <tr>
                  <td>보안·운영</td>
                  <td>세션 쿠키, User-Agent 등 로그</td>
                  <td>법 제15조 (정당한 이익)</td>
                  <td>최대 6개월</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">2. 익명·가명 처리 및 재식별 금지</h2>
          <p>
            서비스는 이용 데이터를 가공하여 특정 개인을 식별할 수 없는 <strong>익명정보</strong>로
            관리하며, 이를 통해 통계를 산출합니다.
          </p>
          <div className="mt-2 rounded-lg bg-base-200 p-4 text-xs">
            <p className="font-bold underline">통계 공개 기준 (소표본 보호)</p>
            <ul className="mt-1 list-disc pl-4">
              <li>
                <strong>익명정보:</strong> 합리적으로 다른 정보와 결합하더라도 특정 개인을 식별할 수
                없는 정보. 공개되는 통계는 이 범주에 해당하도록 처리합니다.
              </li>
              <li>
                <strong>가명정보:</strong> 필요한 경우 내부 통계 산출 단계에서만 한시적으로
                사용하며, 접근 통제·처리기록 등 안전조치를 적용합니다.
              </li>
              <li>
                <strong>재식별 금지:</strong> 누구든지 재식별을 시도할 수 없으며, 시도 발견 시 즉시
                조치
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">3. 처리의 위탁 및 국외 이전</h2>
          <p>원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
          <div className="overflow-x-auto">
            <table className="table-compact table w-full border text-xs">
              <thead>
                <tr className="bg-base-200">
                  <th>수탁자</th>
                  <th>위탁 업무 / 보관 위치</th>
                  <th>보유 기간</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td>Supabase, Inc.</td>
                  <td>인증 연동, DB 운영 / 서울 리전</td>
                  <td>회원 탈퇴 시까지</td>
                </tr>
                <tr>
                  <td>Netlify, Inc. (미국)</td>
                  <td>웹 호스팅 및 접속 로그 처리 / 글로벌 CDN</td>
                  <td>생성 후 30일</td>
                </tr>
                <tr>
                  <td>Cloudflare, Inc. (미국)</td>
                  <td>웹 호스팅 및 접속 로그 처리 / 글로벌 CDN</td>
                  <td>생성 후 30일</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">4. 이용자의 권리 및 행사 방법</h2>
          <p>
            정보주체는 언제든지 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다. 권리
            행사는 이메일(kimqqyun@gmail.com)을 통해 서면 또는 전자우편으로 하실 수 있으며, 이에
            대해 10일 이내에 회신하고 지체 없이 조치하겠습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">5. 파기 절차 및 방법</h2>
          <ul className="list-disc pl-5">
            <li>파기 사유: 보유기간 경과, 처리 목적 달성, 동의 철회 등</li>
            <li>파기 절차: 사유 발생 시 대상 선별 → 개인정보 보호책임자 승인 → 지체 없이 파기</li>
            <li>
              파기 방법: 전자파일은 복구 불가 방식으로 영구 삭제, 종이 문서는 분쇄 또는 소각(백업본
              포함 동일 기준)
            </li>
            <li>법령상 보존: 다른 법령상 보존 의무가 있는 경우 근거·항목·기간 명시 및 분리 보관</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">6. 안전성 확보 조치</h2>
          <ul className="list-disc pl-5">
            <li>접근 통제 및 권한 최소화(RLS 등), 계정 모니터링</li>
            <li>전송·저장 구간 암호화</li>
            <li>접근기록 보관·점검 및 주기적 백업/DR</li>
            <li>취약점 점검 및 수탁자 관리·감독</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">7. 개인정보 보호책임자</h2>
          <p>
            개인정보 처리에 관한 업무 총괄 및 불만 처리 등을 위하여 아래와 같이 책임자를 지정하고
            있습니다.
          </p>
          <ul className="mt-2 list-none pl-0">
            <li>
              <strong>개인정보 보호책임자:</strong> 운영자
            </li>
            <li>
              <strong>연락처:</strong> kimqqyun@gmail.com
            </li>
          </ul>
        </section>

        <section className="border-t pt-8">
          <p className="text-sm font-bold">부칙</p>
          <p className="text-xs text-gray-500">
            이 개인정보 처리방침은 {effectiveDate}부터 효력이 발생합니다. 그 이전에는 이전 버전의
            개인정보처리방침이 적용됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">8. 처리방침의 변경</h2>
          <p>
            변경 시 변경·시행 일자 및 주요 변경 내용을 상단에 갱신하고, 이전 버전 열람 경로를
            제공합니다.
          </p>
          <ul className="mt-2 list-none pl-0">
            <li>현재 버전: {effectiveDate} 익명 통계 처리, 가명정보 처리 기준 추가</li>
            <li>
              이전 버전: <Link to="/PrivacyPolicy260128">2026-01-28</Link> — 최초 게시
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
