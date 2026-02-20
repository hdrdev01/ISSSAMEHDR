import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { HadithListPage } from '@/pages/HadithListPage';
import { HadithDetail } from '@/pages/HadithDetail';
import { Bookmarks } from '@/pages/Bookmarks';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:bookId" element={<HadithListPage />} />
          <Route path="/book/:bookId/:hadithNumber" element={<HadithDetail />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
