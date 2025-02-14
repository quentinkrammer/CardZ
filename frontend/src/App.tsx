import { Outlet } from "react-router";

export function App() {
  return (
    <>
      <div>Header</div>
      <Outlet />
    </>
  );
}
