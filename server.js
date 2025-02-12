const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
 
const DATABASE_URL = "mysql://root:12345@localhost:3306/referralDB";



const EMAIL_USER = "aadityamohit0308@gmail.com";
const EMAIL_PASS = "zsyl ybev bwiw cyaw";

console.log("Email User:", EMAIL_USER);


 
app.post("/refer", async (req, res) => {
  try {
    const { name, email, refereeName, refereeEmail, course } = req.body;

   
    if (!name || !email || !refereeName || !refereeEmail || !course) {
      return res.status(400).json({ error: "All fields are required." });
    }
 
    const referral = await prisma.referral.create({
      data: { name, email, refereeName, refereeEmail, course },
    });

 
    await sendReferralEmail(email, refereeEmail, course);

    res.status(201).json({ message: "Referral submitted successfully", referral });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});
 
const sendReferralEmail = async (referrerEmail, refereeEmail, course) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: EMAIL_USER,
    to: refereeEmail,
    subject: "You've Been Referred!",
    text: `Hello, you've been referred by ${referrerEmail} for the ${course} course. Check it out!`,
  };

  return transporter.sendMail(mailOptions);
};

 
app.get("/referrals", async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany();
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ error: "Error fetching referrals", details: error.message });
  }
});
 
app.get("/referral/:id", async (req, res) => {
  try {
    const referral = await prisma.referral.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!referral) return res.status(404).json({ error: "Referral not found" });
    res.json(referral);
  } catch (error) {
    res.status(500).json({ error: "Error fetching referral", details: error.message });
  }
});

 
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
