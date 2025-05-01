const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { default: axios } = require("axios");
const cors = require("cors")
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI("AIzaSyCI_JAKmZdtqPMU7kpTh5RMneyF6InPBQA");


app.use(bodyParser.json());

app.use(cors())

// AI Recommendation Route
app.post("/recommend", async (req, res) => {
  try {
    
    let products = await axios.get("https://fakestoreapi.com/products");
    // console.log(products.data);
    products = products.data;
    const userPreferences = req.body.userPreferences;
    // const { products, userPreferences } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: "Invalid or missing product data." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro"});

    const prompt = `
      You are an eCommerce product recommendation engine.
      Based on the following product list and user preferences, suggest the top 5 products.

      Products: ${JSON.stringify(products, null, 2)}
      User Preferences: ${userPreferences || "Not specified"}

      Respond with an array of recommended product all details with a short reason.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    console.log(response);
    
    res.json({ recommendations: response });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
