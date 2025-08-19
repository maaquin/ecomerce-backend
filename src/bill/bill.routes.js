import { Router } from "express";
import { 
    createBill,
    getAllBills,
    getBillById,
    updateBill,
    activateBill,
    deactivateBill
} from "./bill.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Router()

router.post("/", [validarCampos], createBill);
router.get("/", getAllBills);
router.get("/:id", getBillById);
router.put("/update/:id", [validarCampos], updateBill);
router.put("/activate/:id", activateBill);
router.put("/deactivate/:id", deactivateBill);

export default router;