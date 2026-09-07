import express, { type Express } from "express";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "node:path";

const app: Express = express();

// Confia no proxy reverso do Replit (necessário para cookies secure + HTTPS)
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set");
}

// Pool dedicado para o session store (connect-pg-simple precisa de um Pool do pg nativo)
const sessionPool = new pg.Pool({ connectionString: databaseUrl });

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool: sessionPool,
      tableName: "session",
      // Limpa sessões expiradas automaticamente a cada hora
      pruneSessionInterval: 60 * 60,
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    },
  }),
);

// Attach isAuthenticated helper for storage route compatibility
app.use((req, _res, next) => {
  (req as any).isAuthenticated = () => !!req.session?.userId;
  next();
});

app.use("/api", router);

const clientDist =
  process.env.CLIENT_DIST ??
  path.resolve(import.meta.dirname, "../../nutri-app/dist/public");

app.use(express.static(clientDist));

app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

export default app;
