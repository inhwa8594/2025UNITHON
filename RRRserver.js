import express from "express";
import cors from "cors";
import pythonApiRouter from "./routes/pythonApi.js";
import zonesRouter from "./routes/zones.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 라우트 등록
app.use("/", pythonApiRouter);       // /add_data, /train_model, /check_location
app.use("/", zonesRouter);           // /safe-zones, /danger-zones, /location ...

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
