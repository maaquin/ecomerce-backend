import { Router } from "express";
import { 
    getConfig,
    updateConfig,

    verifyLink,
    verifyToken
} from "./config.controller.js";

const router = Router();

router.get("/", getConfig);
router.put("/", updateConfig);

router.get("/verify", verifyToken);
router.post("/verify", verifyLink);

export default router;