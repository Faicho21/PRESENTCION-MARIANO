import { Outlet } from "react-router-dom";
import Navbar from "../layouts/Nvar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Suspense } from "react";
import SkeletonLoader from "../components/ui/SkeletonLoader";

function MainLayout() {
  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* Navbar fija y consistente */}
      <Navbar />

      {/* Contenedor principal */}
      <main className="flex-grow-1 container py-3">
        {/* Suspense para mostrar Skeleton en carga de rutas */}
        <Suspense fallback={<SkeletonLoader />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Toast global para notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default MainLayout;
