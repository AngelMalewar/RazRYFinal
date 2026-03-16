require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

app.post("/create-order", async (req, res) => {
    console.log("Create order API called");
    const { amount } = req.body;

    const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR"
    });

    res.json(order);

});

app.get("/payment-success", async (req,res)=>{

  const { uid, days } = req.query;

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + parseInt(days));

  await supabase
    .from("profiles")
    .update({
      is_premium:true,
      premium_expiry:expiry
    })
    .eq("id",uid);

  res.send("Payment successful. Premium activated.");

});
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
