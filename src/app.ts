import express from "express";
import congfig from "config";
import connect from "./utils/connect";
import logger from "./utils/logger";
import routes from "./routes";
import deserializeUser from "./middlewares/deserializeUser";

const port = congfig.get<Number>("port");

const app = express();
app.use(express.json());
app.use(deserializeUser);

app.listen(port, async () => {
  logger.info(`App is running at http://localhost:${port}`);

  await connect();
  routes(app);
});
