import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div>
      {/* You could put a Navbar/Header here if needed */}
      <Outlet />
    </div>
  );
}
