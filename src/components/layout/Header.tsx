import { useState } from 'react';
import { Link } from 'react-router-dom';
import PatchNotesModal from './PatchNotesModal';

function Header() {
  const [showPatchNotes, setShowPatchNotes] = useState(false);

  const handleClick = () => {
    const elem = document.activeElement as HTMLElement;
    if (elem) {
      elem.blur();
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-circle shadow-lg hover:shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-50 w-36 p-2 shadow-lg"
          >
            <li>
              <a onClick={() => setShowPatchNotes(true)}>패치 노트</a>
            </li>
            <li>
              <Link to="/" onClick={handleClick}>
                덱 빌더
              </Link>
            </li>
            <li>
              <Link to="/builder" onClick={handleClick}>
                보유 사도 분석기
              </Link>
            </li>
            <li>
              <Link to="/tutorial" onClick={handleClick}>
                간단 조합기
              </Link>
            </li>
            <li>
              <Link to="/settings" onClick={handleClick}>
                설정
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 패치 노트 모달 */}
      <PatchNotesModal isOpen={showPatchNotes} onClose={() => setShowPatchNotes(false)} />
    </>
  );
}

export default Header;
