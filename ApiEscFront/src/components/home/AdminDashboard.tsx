import { Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { DollarSign, Users, Bell } from "lucide-react";

const AdminDashboard = () => {
  return (
    <motion.div
      className="row g-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="col-md-4">
        <Card className="shadow-sm border-0 p-3">
          <div className="d-flex align-items-center">
            <DollarSign size={40} className="text-success me-3" />
            <div>
              <h5 className="mb-0">Pagos del mes</h5>
              <small className="text-muted">Ver historial completo</small>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-md-4">
        <Card className="shadow-sm border-0 p-3">
          <div className="d-flex align-items-center">
            <Users size={40} className="text-primary me-3" />
            <div>
              <h5 className="mb-0">Alumnos registrados</h5>
              <small className="text-muted">Gestión de usuarios</small>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-md-4">
        <Card className="shadow-sm border-0 p-3">
          <div className="d-flex align-items-center">
            <Bell size={40} className="text-warning me-3" />
            <div>
              <h5 className="mb-0">Notificaciones</h5>
              <small className="text-muted">Pagos próximos a vencer</small>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
