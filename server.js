const {
  compression,
  cors,
  express,
  helmet,
  morgan,
} = require("./src/utils/import.util");
const { mongoConfig, serverConfig } = require("./src/config/index.config");
const baseError = require("./src/error/base.error");
const socketUtil = require("./src/utils/socket.util");
const http = require("http");
const routes = require("./src/route/index.route");

const { PORT, CORS_ORIGIN } = serverConfig;

const app = express();

const startServer = async () => {
  app.use("/", express.static(__dirname + "/public"));

  app.use(compression());
  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", routes);

  app.get("/home", (req, res) => {
    res.send("Hello Server!!!😊😊😊😊");
  });

  app.use(baseError);

  const httpServer = http.createServer(app);
  socketUtil.initialize(httpServer);

  await mongoConfig.connect();

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start the server:", error);
  process.exit(1);
});

module.exports = app;
