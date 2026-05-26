import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function MainLayout() {
  return (
    <>
      <Header />
      <main>
        {/* Renders the current route page */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default MainLayout;