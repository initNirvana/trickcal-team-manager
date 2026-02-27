import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  const effectiveDate = '2026년 1월 28일';

  return (
    <div className="container mx-auto max-w-3xl p-6 pb-20">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/settings" className="btn btn-ghost btn-circle" aria-label="설정으로 돌아가기">
          <FaArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">개인정보 처리방침</h1>
      </div>

      <div className="prose max-w-none space-y-8">
        <section>
          <h2 className="mb-2 text-xl font-bold">1. 개인정보의 처리 목적</h2>
          <p>
            트릭컬 팀 매니저(이하 '서비스')는 다음의 목적을 위하여 개인정보를 처리하고 있으며,
            다음의 목적 이외의 용도로는 이용하지 않습니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>사용자 데이터 동기화:</strong> 서비스 데이터를 클라우드 서버(Supabase)에
              동기화하기 위해 개인정보를 처리합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">2. 개인정보의 수집 항목</h2>
          <p>서비스는 다음과 같은 개인정보 항목을 처리하고 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>수집 항목:</strong> Google 계정 정보 (이메일 주소, 고유 식별자)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">3. 개인정보의 처리 및 보유 기간</h2>
          <p>
            서비스는 사용자가 데이터를 동기화하기 위해 Google 계정에 연결하는 동안에만 개인정보를
            처리 및 보유합니다. 동기화 해제 또는 회원 탈퇴 요청 시 수집된 개인정보는 지체 없이
            파기됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">4. 개인정보의 제3자 제공에 관한 사항</h2>
          <p>서비스는 사용자의 개인정보를 제3자에게 제공하지 않습니다.</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">5. 개인정보처리 위탁</h2>
          <p>
            서비스는 원활한 데이터 처리와 안정적인 서비스 제공을 위해 다음과 같이 개인정보
            처리업무를 위탁하고 있습니다.
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="table-compact table w-full border">
              <thead>
                <tr>
                  <th>수탁업체</th>
                  <th>위탁 업무 내용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Supabase Inc.</td>
                  <td>데이터베이스 호스팅, 인증 관리 및 데이터 백업 저장</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">6. 개인정보의 파기</h2>
          <p>
            서비스는 사용자가 계정 연동을 해제하거나 탈퇴를 요청하는 경우, 사용자의 개인정보를 지체
            없이 파기 처리합니다. 기기에 저장된 임시 데이터(세션 등)는 로그아웃 즉시 삭제됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">7. 개인정보의 안전성 확보 조치</h2>
          <p>
            서비스는 사용자의 개인정보를 안전하게 처리하기 위해 다음과 같은 조치를 취하고 있습니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>기술적 조치:</strong> 모든 데이터는 전송 시 HTTPS 암호화 프로토콜을 사용하며,
              클라우드 서버(Supabase) 내에서도 안전하게 암호화되어 보관됩니다. 수집된 이메일 정보는
              사용자 식별 및 본인 인증 목적으로만 제한적으로 사용됩니다.
            </li>
            <li>
              <strong>관리적 조치:</strong> 개인정보에 접근할 수 있는 권한을 최소한으로 제한하고
              있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">
            8. 개인정보 자동 수집 장치의 설치, 운영 및 그 거부에 관한 사항
          </h2>
          <p>
            서비스는 사용자의 편의를 위해 '쿠키(cookie)'를 운용합니다. 쿠키는 웹사이트 운영 서버가
            브라우저에 보내는 작은 텍스트 파일로 기기에 저장됩니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>사용 목적:</strong> Google 로그인을 통한 사용자 인증 상태 유지 및 안전한
              데이터 동기화.
            </li>
            <li>
              <strong>거부 방법:</strong> 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다. 단,
              쿠키 저장을 거부할 경우 로그인이 필요한 백업/복원 기능을 사용할 수 없습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">9. 개인정보 처리방침 변경</h2>
          <p>
            이 개인정보 처리방침은 <strong>{effectiveDate}</strong>부터 적용됩니다.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
