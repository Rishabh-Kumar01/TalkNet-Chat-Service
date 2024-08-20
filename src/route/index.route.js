const { express } = require("../utils/import.util");

const router = express.Router();

const v1Route = require("./v1/v1.route");

router.use("/v1", v1Route);

module.exports = router;
