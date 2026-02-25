import versionData from '@/data/version.json';

function Footer() {
  return (
    <footer className="footer footer-center bg-base-200 text-base-content p-4">
      <div className="text-center">
        <p>All images copyright EPIDGames.</p>
        <p className="text-center text-xs text-gray-500">Version {versionData.projectVersion}</p>
      </div>
    </footer>
  );
}

export default Footer;
