import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import SearchPanel from './SearchPanel';
import CreatePostModal from './CreatePostModal';

export default function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-ig-text">
      <Sidebar onCreateClick={() => setCreateOpen(true)} onSearchClick={() => setSearchOpen(true)} />
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <main className="md:ml-[72px] xl:ml-64 pb-14 md:pb-0 min-h-screen">
        <Outlet />
      </main>

      <MobileNav onCreateClick={() => setCreateOpen(true)} onSearchClick={() => setSearchOpen(true)} />
    </div>
  );
}
