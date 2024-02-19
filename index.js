const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

const cors = require("cors");
const fs = require("fs");
const s3 = require("./config/awsConfig");
const upload = require("./config/multerConfig");

require("aws-sdk/lib/maintenance_mode_message").suppress = true;
dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.use(cors());
app.post("/upload", upload.array("files"), (req, res) => {
  
  const files = req.files;

  if (!files) {
    return res.status(400).send("No files were uploaded.");
  }

  const zip = new require("node-zip")();
  for (let file of files) {
    zip.file(file.originalname, file.buffer);
  }
  const data = zip.generate({ base64: false, compression: "DEFLATE" });

  const fileName ="uploaded.zip";
  const filePath = path.join(__dirname, "uploads", fileName);
  // upload local folder
  fs.writeFile(filePath, data, "binary", (err) => {
    if (err) {
      console.error("Error saving zip file:", err);
      return res.status(500).send("Failed to save zip file.");
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: "energy/fuel/" + Date.now().toLocaleString() + ".zip",
      Body: fs.createReadStream(filePath),
    };

    // Upload zip file to S3
    s3.upload(params, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Failed");
      }
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          res.status(200).send({
            msg: "File uploaded.",
            path: data.Location,
          });
        }
      });
    });
  });
});

app.get("/check", (req, res) => {
 res.json("API working !")
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
