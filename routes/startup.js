const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const {
  PrismaClientKnownRequestError,
} = require("@prisma/client/runtime/library");
const prisma = new PrismaClient();

//startup Signup
router.post("/signup", async (req, res) => {
  console.log(req.body);
  try {
    const { body } = req;
    const user = await prisma.startupManager.create({
      data: {
        city: body.city,

        Username: body.Username,
        fullName: body.fullName,
        email: body.email,
        password: body.password,
        phone: body.phone,
        NID: body.NID,
        highestDegree: body.highestDegree,
        major: body.major,
        expertArea: body.expertArea,
      },
    });

    console.log("User created successfully");
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//startup login
router.post("/login", async (req, res) => {
  try {
    const user = await prisma.startupManager.findUnique({
      where: { Username: req.body.username },
    });

    if (!user || user.password !== req.body.password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.status(200).json({ message: "Login successful", user: user });
    console.log("It is called!");
    console.log(req.body);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//statup upload
router.post("/upload", async (req, res) => {
  try {
    const { body } = req;

    const startupManager = await prisma.startupManager.findUnique({
      where: { Username: body.startupManagerUsername },
    });

    if (!startupManager) {
      return res.status(404).json({ error: "Startup manager not found" });
    }

    const startupInfo = await prisma.startupInfo.create({
      data: {
        startupName: body.startupName,
        industry: body.industry,
        foundingDate: body.foundingDate,
        location: body.location,
        tinNumber: body.tinNumber,
        cofounderName: body.cofounderName,
        coOccupation: body.coOccupation,
        NID: body.NID,
        initialFund: body.initialFund,
        totalRevenue: body.totalRevenue,
        fundingNeeded: body.fundingNeeded,
        goals: body.goals,
        motivation: body.motivation,
        briefExplain: body.briefExplain,
        Manager: {
          connect: { Username: startupManager.Username },
        },
      },
    });

    console.log("StartupInfo created successfully");
    res
      .status(200)
      .json({ message: "StartupInfo created successfully", startupInfo });
  } catch (error) {
    console.error("Error creating startupInfo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//getting startupInfo Profile
router.get("/profile/:tinNumber", async (req, res) => {
  try {
    console.log("paise");
    const { tinNumber } = req.params;
    const startupInfo = await prisma.startupInfo.findUnique({
      where: { tinNumber: tinNumber },
      include: { Manager: true },
    });
    if (!startupInfo) {
      console.log("Not Found");
    }
    console.log(startupInfo);
    const managerInfo = startupInfo.Manager;
    console.log(tinNumber);
    console.log(managerInfo.startups);
    res.status(200).json({ ...managerInfo, startups: [startupInfo] });
  } catch (error) {
    console.log(error);
  }
});

//getting startup Manager Profile
router.get("/manager-profile", async (req, res) => {
  try {
    const username = req.query.username;
    console.log(username);

    const startupManager = await prisma.startupManager.findUnique({
      where: {
        Username: username,
      },
    });
    if (!startupManager) {
      console.log("Not found any investor");
    }
    console.log("Found");
    return res.status(200).json({
      startupManager,
    });
  } catch {
    console.log("error");
  }
});

//startup Manager Homepage 
router.get("/home/:username", async (req, res) => {
  try {
    const { username } = req.params;
    console.log("Username got", username);
    const startupProfile = await prisma.startupManager.findUnique({
      where: { Username: username },
      select: { city: true, fullName: true },
    });
    if (!startupProfile) {
      console.log("Not found");
    }

    res.status(200).json(startupProfile);
  } catch (error) {
    console.error("Error retrieving startup manager data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//startup Manager Home Page startup show
router.get("/mystartups", async (req, res) => {
  try {
    const managerUsername = req.query.username;
    const startups = await prisma.startupInfo.findMany({
      where: { startupManagerUsername: managerUsername },
    });
    if (!startups) {
      console.log("No startups");
    }
    res.status(200).json({ startups });
  } catch (error) {
    console.log("error", error);
  }
});

//getting notification
router.get("/get-notifications", async (req, res) => {
  const username = req.query.username;
  try {
    const notification = await prisma.notifications.findMany({
      where: {
        startupManagerUsername: username,
      },
    });

    console.log(notification);
    res.status(200).json({
      notification,
    });
  } catch (error) {
    console.log("the error is", error);
  }
});
module.exports = router;
