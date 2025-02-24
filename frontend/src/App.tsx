import { Outlet } from "react-router";

export function App() {
  return (
    <div className="h-screen w-screen bg-radial from-gray-900 via-blue-800 to-blue-950 to-90% text-white">
      <div>Header</div>
      <Outlet />
    </div>
  );
}
