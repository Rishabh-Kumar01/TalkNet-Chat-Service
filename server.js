const {
  compression,
  cors,
  express,
  helmet,
  morgan,
} = require("./src/utils/import.util");
const { mongoConfig, serverConfig } = require("./src/config/index.config");
const baseError = require("./src/error/base.error");

const { PORT } = serverConfig;

const app = express();

const startServer = async () => {
  app.use(compression());
  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(baseError);

  app.listen(PORT || 3000, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  mongoConfig.connect();

  app.get("/", (req, res) => {
    res.send("Hello Server!!!😊😊😊😊");
  });
};

startServer();
