import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ContentProvider } from "./content/ContentContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Models from "./pages/Models";
import Available from "./pages/Available";
import Order from "./pages/Order";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import AdminApp from "./admin/AdminApp";

export default function App() {
  // The admin is mounted outside the public BrowserRouter on purpose: its live
  // preview renders the real pages inside their own MemoryRouter, and React
  // Router refuses to nest one router inside another. Moving between /admin and
  // the public site is a normal page load, which is fine for an editor tool.
  const isAdmin = window.location.pathname.replace(/\/+$/, "") === "/admin";

  return (
    <ContentProvider>
      {isAdmin ? (
        <AdminApp />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="models" element={<Models />} />
              <Route path="available" element={<Available />} />
              <Route path="order" element={<Order />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="events" element={<Events />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<Navigate replace to="/" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </ContentProvider>
  );
}
