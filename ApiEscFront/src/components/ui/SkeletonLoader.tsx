import React from "react";
import { motion } from "framer-motion";

/**
 * Componente SkeletonLoader
 * 
 * Muestra una animación tipo shimmer para simular contenido cargando.
 * Puede usarse tanto en tablas como en secciones de texto.
 * 
 * @param rows - cantidad de filas de skeleton que se mostrarán
 * @param columns - cantidad de columnas simuladas (solo para modo tabla)
 * @param type - "table" o "card" según el tipo de contenido
 */
interface SkeletonLoaderProps {
  rows?: number;
  columns?: number;
  type?: "table" | "card";
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  rows = 6,
  columns = 5,
  type = "table",
}) => {
  return (
    <motion.div
      className="skeleton-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {type === "table" ? (
        <div className="skeleton-table">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="skeleton-row">
              {Array.from({ length: columns }).map((_, j) => (
                <div key={j} className="skeleton-cell shimmer" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="skeleton-cards">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="skeleton-card shimmer" />
          ))}
        </div>
      )}

      {/* Estilos internos */}
      <style>{`
        .skeleton-container {
          width: 100%;
          padding: 1rem;
        }

        .skeleton-table {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .skeleton-row {
          display: grid;
          grid-template-columns: repeat(${columns}, 1fr);
          gap: 0.8rem;
        }

        .skeleton-cell,
        .skeleton-card {
          height: 22px;
          border-radius: 6px;
          background: linear-gradient(
            90deg,
            #e0e0e0 25%,
            #f0f0f0 50%,
            #e0e0e0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        .skeleton-card {
          height: 90px;
          border-radius: 12px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default SkeletonLoader;
