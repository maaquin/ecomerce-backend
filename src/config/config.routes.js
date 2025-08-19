import { Router } from "express";
import { 
    getConfig,
    UpdateConfig,

    VerifyLink,
    VerifyToken
} from "./config.controller.js";

const router = Router();

router.get("/", getConfig);
router.put("/", UpdateConfig);

router.get("/verify", VerifyToken);
router.post("/verify", VerifyLink);

export default router;