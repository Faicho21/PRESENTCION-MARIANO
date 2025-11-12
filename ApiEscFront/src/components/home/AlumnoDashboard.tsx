import { Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { Wallet, Calendar, CreditCard } from "lucide-react";

const AlumnoDashboard = () => {
  return (
    <motion.div
      className="row g-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="col-md-6">
        <Card className="shadow-sm border-0 p-3">
          <div className="d-flex align-items-center">
            <Wallet size={38} className="text-success me-3" />
            <div>
              <h5 className="mb-0">Cuota actual</h5>
              <small className="text-muted">Consulta tu estado de cuenta</small>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-md-6">
        <Card className="shadow-sm border-0 p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <CreditCard size={38} className="text-primary me-3" />
              <div>
                <h5 className="mb-0">Realizar pago</h5>
                <small className="text-muted">Transferencia o Mercado Pago</small>
              </div>
            </div>
            <Button variant="outline-success" size="sm">
              Ir a pagos
            </Button>
          </div>
        </Card>
      </div>

      <div className="col-12">
        <Card className="shadow-sm border-0 p-3">
          <div className="d-flex align-items-center">
            <Calendar size={38} className="text-warning me-3" />
            <div>
              <h5 className="mb-0">Próximos vencimientos</h5>
              <small className="text-muted">7 días antes se notificará</small>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default AlumnoDashboard;
