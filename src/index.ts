import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import db from "./utils/database";


async function init() {
  try {
    const result = await db();
    
    console.log('database status: ' ,result);
      const app = express();
      
      
      app.use(bodyParser.json());
      const port = 3000;
      
      app.use('/api',router);

      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    } catch (error) {
      console.error("Failed to connect to the database:", error);
    }
  }

  init();