import Footer from './Footer';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-base-100 relative z-0 min-h-screen">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default Layout;
