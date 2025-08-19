import { Router } from "express";
import { 
    createUser,
    getUserById,
    getUsers,
    authUser,
    updateUser,
    activateUser,
    deactivateUser
} from "./user.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Router()

router.post("/", [validarCampos], createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/update/:id", [validarCampos], updateUser);
router.put("/activate/:id", activateUser);
router.put("/deactivate/:id", deactivateUser);

router.post("/auth", authUser);

export default router;