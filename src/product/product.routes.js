import { Router } from "express";
import { 
    createProduct,
    getAllProducts,
    getAllGoodProducts,
    getProductById,
    updateProduct,
    activateProduct,
    deactivateProduct,
    getProductsByType
} from "./product.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Router()

router.post("/", [validarCampos], createProduct);
router.get("/", getAllProducts);
router.get("/good", getAllGoodProducts);
router.post("/type", getProductsByType);
router.get("/:id", getProductById);
router.put("/update/:id", [validarCampos], updateProduct);
router.put("/activate/:id", activateProduct);
router.put("/deactivate/:id", deactivateProduct);

export default router;