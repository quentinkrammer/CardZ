import { NavLink, Outlet } from "react-router";

export function RootLayout() {
  return (
    <main className="h-screen w-screen bg-radial from-gray-900 via-blue-800 to-blue-950 to-90% text-white">
      <Outlet />
    </main>
  );
}

function Header() {
  return (
    <header className="flex justify-between p-1">
      <nav>
        <NavLink to="/">Home</NavLink>
      </nav>
    </header>
  );
}
