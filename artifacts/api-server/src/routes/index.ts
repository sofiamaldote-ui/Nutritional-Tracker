import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import patientsRouter from "./patients";
import groupsRouter from "./groups";
import consultationsRouter from "./consultations";
import bibliotecaRouter from "./biblioteca";
import portalRouter from "./portal";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(patientsRouter);
router.use(groupsRouter);
router.use(consultationsRouter);
router.use(bibliotecaRouter);
router.use(portalRouter);

export default router;
