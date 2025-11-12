import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import PublicRoute from "./components/Routes/PublicRoute";
import MainLayout from "./layouts/MainLayaut";
import Login from "./views/Login";
import SkeletonLoader from "./components/ui/SkeletonLoader";

// Vistas protegidas (lazy loading)
const Home = lazy(() => import("./views/Home"));
const Pagos = lazy(() => import("./views/GestionPagos"));
const MisPagos = lazy(() => import("./views/MisPagos"));
const Alumnos = lazy(() => import("./views/GestionUsuarios"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<SkeletonLoader />}>
        <Routes>
          {/* Rutas públicas (sin login) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Rutas protegidas (requieren token) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/pagos" element={<Pagos />} />
              <Route path="/mis-pagos" element={<MisPagos />} />
              <Route path="/alumnos" element={<Alumnos />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
