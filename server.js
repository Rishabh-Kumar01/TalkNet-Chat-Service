const {
  compression,
  cors,
  express,
  helmet,
  morgan,
  socketIo,
} = require("./src/utils/import.util");
const { mongoConfig, serverConfig } = require("./src/config/index.config");
const baseError = require("./src/error/base.error");
const SocketUtil = require("./src/utils/socket.util");
const http = require("http");
const routes = require("./src/route/index.route");

const { PORT, CORS_ORIGIN } = serverConfig;

const app = express();

const httpServer = http.createServer(app);
const io = new socketIo.Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});
const socketUtil = SocketUtil.getInstance();

const startServer = async () => {
  app.listen(PORT || 3000, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  mongoConfig.connect();

  app.use(compression());
  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  socketUtil.initialize(io);

  app.use("/api", routes);

  app.get("/", (req, res) => {
    res.send("Hello Server!!!😊😊😊😊");
  });

  app.use(baseError);
};

startServer();

module.exports = app;
