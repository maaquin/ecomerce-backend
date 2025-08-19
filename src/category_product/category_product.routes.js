import { Router } from "express";
import { 
    createCategoryProduct,
    getAllCategoryProduct,
    getAllGoodCategoryProduct,
    getCategoryProductById,
    UpdateCategoryProduct,
    activateCategoryProduct,
    deactivateCategoryProduct
} from "./category_product.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Router()

router.post("/", [validarCampos], createCategoryProduct);
router.get("/", getAllCategoryProduct);
router.get("/good", getAllGoodCategoryProduct);
router.get("/:id", getCategoryProductById);
router.put("/update/:id", [validarCampos], UpdateCategoryProduct);
router.put("/activate/:id", activateCategoryProduct);
router.put("/deactivate/:id", deactivateCategoryProduct);

export default router;