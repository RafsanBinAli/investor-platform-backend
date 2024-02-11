var express = require("express");
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

//Signup for investor
router.post("/signup", async (req, res) => {
  console.log("Received signup request:", req.body);
  try {
    const { body } = req;
    const user = await prisma.investor.create({
      data: {
        Username: body.Username,
        fullName: body.fullName,
        email: body.email,
        password: body.password,
        phone: body.phone,
        DoB: body.DoB,
        city: body.city,
        country: body.country,
        occupation: body.occupation,
        industry: body.industry,
        investmentType: body.investmentType,
        NID: body.NID,
      },
    });
    console.log("User created successfully");
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//login for investor
router.post("/login", async (req, res) => {
  try {
    const user = await prisma.investor.findUnique({
      where: { Username: req.body.Username },
    });

    if (!user || user.password != req.body.password) {
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

//showing the startup at investor Homepage
router.get("/investor-home", async (req, res) => {
  try {
    const startupInfo = await prisma.startupInfo.findMany();

    if (!startupInfo || startupInfo.length === 0) {
      console.log("Nothing Found!");
    }
    res.status(200).json({ startupInfo });
  } catch (error) {
    console.log(error);
  }
});

//getting startup info using tinNumber
router.get("/startup-info/:tinNumber", async (req, res) => {
  try {
    const { tinNumber } = req.params;
    const startupInfo = await prisma.startupInfo.findUnique({
      where: { tinNumber: tinNumber },
    });
    if (!startupInfo) {
      console.log("Not Found");
    }
    res.status(200).json(startupInfo);
  } catch (error) {
    console.log(error);
  }
});

//set meeting for investor 
router.post("/set-meeting/:username", async (req, res) => {
  const { time, date, tinNumber } = req.body;
  const { username } = req.params;

  try {
    if (!time || !date || !tinNumber) {
      console.log("Some fields are missing!");
      return res.status(400).json({ message: "Some fields are missing" });
    }
    // Find the investor
    const investor = await prisma.investor.findUnique({
      where: { Username: username },
    });

    if (!investor) {
      console.log("Investor not found!");
      return res.status(404).json({ error: "Investor not found" });
    }

    // Find the associated startup with its manager
    const startup = await prisma.startupInfo.findUnique({
      where: { tinNumber: tinNumber },
      include: {
        Manager: true,
      },
    });

    if (!startup) {
      console.log("Startup not found!");
      return res.status(404).json({ message: "Startup not found" });
    }

    const startupManager = startup.Manager;

    //schedule create
    const updatedSchedule = await prisma.schedule.create({
      data: {
        
        date: new Date(`${date}T${time}`), 
        investor: {
          connect: { Username: username },
        },
        startupManager: {
          connect: { Username: startupManager.Username },
        },
        startupInfo: {
          connect: { tinNumber: tinNumber },
        },
      },
    });

    console.log("Updated Schedule:", updatedSchedule);

    try {
      //create notification about meeting
      const notification = await prisma.notifications.create({
        data: {
          primaryActor: {
            connect: { Username: username }, 
          },
          secondaryActor: {
            connect: { Username: startupManager.Username }, 
          },
          about: "meeting",
          meetingTime: new Date(`${date}T${time}`),
        },
      });
    } catch (error) {
      console.log("the error is", error);
    }

   
    return res
      .status(200)
      .json({ success: true, message: "Meeting set successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//searching meeting
router.get("/meeting-searched/:code", async (req, res) => {
  try {
    const { code } = req.params;
    console.log(code);

    const meeting = await prisma.schedule.findMany({
      where: {
        tinNumber: code,
      },
      select: {
        date: true,
      },
    });

    if (meeting.length === 0) {
      console.log("There is no meeting found!");
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    const meetingData = meeting[0].date; 

    return res.status(200).json({
      meetingData,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

//search function of investor-home page about startup
router.get("/search-by-name/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const startup = await prisma.startupInfo.findMany({
      where: { startupName: name },
    });
    if (startup.length === 0) {
      return res.status(404).json({
        message: "No Startup Found",
      });
    }
    return res.status(200).json({
      startup,
    });
  } catch (error) {
    console.log("error");
  }
});

//getting the informatin of startup profile
router.get("/investor-profile", async (req, res) => {
  try {
    const username = req.query.username;
    const investor = await prisma.investor.findUnique({
      where: {
        Username: username,
      },
    });
    if (!investor) {
      console.log("Not found any investor");
    }
    console.log("Found");
    return res.status(200).json({
      investor,
    });
  } catch {
    console.log("error");
  }
});

//investor profile edit
router.put("/update-investor-profile", async (req, res) => {
  const { username, ...updatedData } = req.body;

  try {
    const updatedProfile = await prisma.investor.update({
      where: { Username: username },
      data: updatedData,
    });
    res.json(updatedProfile);
  } catch (error) {
    console.log("error");
  }
});

//retrive manager Username
router.get("/get-managerName", async (req, res) => {
  try {
    const tinNumber = req.query.tinNumber;
    const managerName = await prisma.startupInfo.findUnique({
      where: {
        tinNumber: tinNumber,
      },
    });

    if (managerName) {
      var managerUsername = managerName.startupManagerUsername;
      res.status(200).json({
        managerUsername,
      });
    }
  } catch (error) {
    console.log("error getting name");
  }
});

// bar chart for graph
router.get("/bar", async (req, res) => {
  try {
    console.log("paise");

    const startupInfo = await prisma.startupInfo.findMany();

    const startupCounts = {};
    startupInfo.forEach((startup) => {
      const industry = startup.industry || "Others";
      startupCounts[industry] = (startupCounts[industry] || 0) + 1;
    });

    const result = Object.entries(startupCounts).map(([fieldName, count]) => ({
      fieldName,
      count,
    }));
    result.sort((a, b) => {
      if (a.fieldName === "Others") return 1;
      if (b.fieldName === "Others") return -1;
      return 0;
    });
    res.json(result);
  } catch (error) {
    console.log("error status", res.status);
  }
});

//sending message 

router.post("/send-message", async (req, res) => {
  try {
    const { senderUsername, receiverUsername, content } = req.body;
    console.log(senderUsername, receiverUsername, content);
    const [senderName, senderType] = senderUsername.split("+");
    console.log(senderName, senderType);
    const [receiverName, receiverType] = receiverUsername.split("+");
    console.log(receiverName, receiverType);

    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            investorUsername:
              senderType === "investor" ? senderName : receiverName,
            startupManagerUsername:
              senderType === "manager" ? senderName : receiverName,
          },
          {
            investorUsername:
              receiverType === "investor" ? receiverName : senderName,
            startupManagerUsername:
              receiverType === "manager" ? receiverName : senderName,
          },
        ],
      },
    });

    // If conversation doesn't exist, create a new one
    // if (!conversation) {
    //   const investorRecord = await prisma.investor.findUnique({
    //     where: {
    //       Username: senderType === "investor" ? senderName : receiverName,
    //     },
    //   });

    //   const managerRecord = await prisma.startupManager.findUnique({
    //     where: {
    //       Username: senderType === "manager" ? senderName : receiverName,
    //     },
    //   });

    //   if (investorRecord && managerRecord) {
    //     conversation = await prisma.conversation.create({
    //       data: {
    //         Investor: {
    //           connect: { Username: investorRecord.Username },
    //         },
    //         StartupManager: {
    //           connect: { Username: managerRecord.Username },
    //         },
    //       },
    //     });
    //     try {
    //       const notification = await prisma.notifications.create({
    //         data: {
    //           primaryActor: {
    //             connect: { Username: senderName },
    //           },
    //           secondaryActor: {
    //             connect: { Username: receiverName },
    //           },
    //           about: "message",
    //         },
    //       });
    //     } catch (error) {
    //       console.log("the error is", error);
    //     }

    //     console.log(
    //       `New conversation created between ${senderName} and ${receiverName}`
    //     );
    //   }
    // } else {
    //   console.log(
    //     `Conversation already exists between ${senderName} and ${receiverName}`
    //   );
    // }
    
   
    const message = await prisma.message.create({
      data: {
        content,
        Investor: {
          connect: {
            Username: senderType === "investor" ? senderName : receiverName,
          },
        },
        StartupManager: {
          connect: {
            Username: senderType === "manager" ? senderName : receiverName,
          },
        },
        Conversation: {
          connect: { id: conversation.id },
        },
        sender: senderName,
        receiver: receiverName,
      },
    });

    res
      .status(200)
      .json({ message: "Conversation and message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//getting the prev conversations for Dashboard
router.get("/conversations", async (req, res) => {
  
  const senderUsername = req.query.username;
  try {
    const conversation = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            investorUsername: senderUsername,
          },
          {
            startupManagerUsername: senderUsername,
          },
        ],
      },
    });

    if (conversation.length != 0) {
      console.log(conversation);
      const conversationIds = conversation.map(
        (conversation) => conversation.id
      );
      console.log(conversationIds);

      const otherNames = [];

      for (const conversationId of conversationIds) {
        try {
          const conversation = await prisma.conversation.findUnique({
            where: {
              id: conversationId,
            },
            include: {
              Investor: true,
              StartupManager: true,
            },
          });

          if (conversation) {
            const { Investor, StartupManager } = conversation;

            // Check if Investor exists and is not the loggedInUsername
            if (Investor && Investor.Username !== senderUsername) {
              otherNames.push({ id: conversationId, name: Investor.Username });
            }

            // Check if StartupManager exists and is not the loggedInUsername
            if (StartupManager && StartupManager.Username !== senderUsername) {
              otherNames.push({
                id: conversationId,
                name: StartupManager.Username,
              });
            }
          } else {
            console.log(`Conversation ${conversationId} not found`);
          }
        } catch (error) {
          console.error(
            `Error while retrieving conversation ${conversationId}:`,
            error
          );
        }
      }

      res
        .status(200)
        .json({ message: "Found all the conversations", otherNames });
    }
  } catch (error) {
    console.log("error");
  }
});

//message retriving for message section to show all the message in a conversation
router.get("/message-retriving", async (req, res) => {
  const convoID = req.query.convoID;
  console.log(convoID);
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: Number(convoID),
      },
    });
    console.log(messages);
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      sender: message.sender,
      receiver: message.receiver,
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.log("error", error.status);
    res.status(500).json("jhamela hoise");
  }
});


//create new conversation
router.post("/create-convo", async (req, res) => {
  try {
    const sender = req.body.investor;
    const receiver = req.body.startupManager;

    let conversation = await prisma.conversation.findFirst({
      where: {
        investorUsername: sender,
        startupManagerUsername: receiver,
      },
    });

    if (conversation) {
     
      const conversationData = {
        id: conversation.id,
        startupManagerUsername: conversation.startupManagerUsername,
      };

      res.status(200).json({ conversation: conversationData });
    }
    if (!conversation) {
      const investorRecord = await prisma.investor.findUnique({
        where: {
          Username: sender,
        },
      });

      const managerRecord = await prisma.startupManager.findUnique({
        where: {
          Username: receiver,
        },
      });

      if (investorRecord && managerRecord) {
        conversation = await prisma.conversation.create({
          data: {
            Investor: {
              connect: { Username: investorRecord.Username },
            },
            StartupManager: {
              connect: { Username: managerRecord.Username },
            },
          },
        });
      }
      console.log("new created when l")
    }
   
  } catch (error) {
    console.log(error);
  }
});

router.get("/investor/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const person = await prisma.conversation.findUnique({
      where: {
        investorUsername: name
      },
      select: {
        id: true,
        startupManagerUsername: true
      }
    });

    if (person) {
      // Send the person data back to the client
      res.json(person);
    } else {
      // Handle the case where the person is not found
      res.status(404).json({ error: 'Person not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;
