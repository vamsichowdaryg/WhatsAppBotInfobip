// const express = require("express");
// const bodyParser = require("body-parser");
// const axios = require("axios");
// const cors = require("cors");
// const mongoose = require("mongoose");

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(cors());
// app.use(bodyParser.json());

// const INFOBIP_API_BASE_URL = "https://lqdxxw.api.infobip.com";
// const INFOBIP_API_KEY =
//   "2c69ef4d503d932281934d58471e70ac-1a8d5ab1-1489-4947-b277-7d4fb15468b7";
// const INFOBIP_WHATSAPP_SENDER_NUMBER = "+447860099299";

// const DIRECT_LINE_BASE_URL =
//   process.env.DIRECT_LINE_BASE_URL ||
//   "https://directline.botframework.com/v3/directline";
// const DIRECT_LINE_SECRET =
//   process.env.DIRECT_LINE_SECRET ||
//   "4bEHl4WbbsPZnu4Tq3APzAfGbKMVBM2uUEDw2dXyzZ4MDTZSPc03JQQJ99BEAC77bzfAArohAAABAZBS0118.CebHBnxyeBs63IDEs2dowO7Acu8IALe5lc19M3zLy8s26aLWNuhpJQQJ99BEAC77bzfAArohAAABAZBS3Qhc";
// const AZURE_SPEECH_KEY =
//   process.env.AZURE_SPEECH_KEY ||
//   "40K84vS2b0E637v9J0qtz4MEpA7bsjaoRBg9DjQY9A3wjcptJ9o1JQQJ99BCACYeBjFXJ3w3AAAYACOG2sOr";
// const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "eastus";
// const MONGO_DB_URI =
//   process.env.MONGO_DB_URI ||
//   "mongodb+srv://darshanmagdum:tzj7SxsKHeZoqc14@whatsappbot-cluster.2wgzguz.mongodb.net/SmartcardApp?retryWrites=true&w=majority&appName=WhatsappBOT-CLUSTER";
// let conversations = {};
// async function sendWhatsAppMessageInfobip(to_number, message_text) {
//   const payload = {
//     messages: [
//       {
//         from: INFOBIP_WHATSAPP_SENDER_NUMBER,
//         to: to_number,
//         message: {
//           text: message_text,
//         },
//       },
//     ],
//   };
//   const headers = {
//     Authorization: `App ${INFOBIP_API_KEY}`,
//     "Content-Type": "application/json",
//   };
//   const url = `${INFOBIP_API_BASE_URL}/whatsapp/1/message/text`;

//   try {
//     const response = await axios.post(url, payload, {
//       headers: headers,
//       timeout: 30000,
//     });
//     console.log("Infobip WhatsApp message sent successfully:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error sending Infobip WhatsApp message:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// }
// async function handleVoiceMessage(media_url) {
//   try {
//     const audioRes = await axios.get(media_url, {
//       headers: {
//         Authorization: `App ${INFOBIP_API_KEY}`,
//       },
//       responseType: "arraybuffer",
//     });
//     const azureSttUrl = `https://${AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;
//     const azureHeaders = {
//       "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
//       "Content-Type": "audio/ogg; codecs=opus",
//       "Transfer-Encoding": "chunked",
//     };

//     const azureRes = await axios.post(azureSttUrl, audioRes.data, {
//       headers: azureHeaders,
//     });

//     const transcribedText = azureRes.data.DisplayText;
//     if (!transcribedText) {
//       throw new Error("No DisplayText found in Azure STT response.");
//     }

//     console.log("Transcribed:", transcribedText);
//     return transcribedText;
//   } catch (err) {
//     console.error(
//       "Error in handleVoiceMessage:",
//       err.response?.data || err.message
//     );
//     return "Sorry, I had trouble processing your voice message.";
//   }
// }
// app.post("/infobip-whatsapp-webhook", async (req, res) => {
//   try {
//     const infobip_data = req.body;
//     console.log(
//       "Received Infobip webhook payload:",
//       JSON.stringify(infobip_data, null, 2)
//     );

//     if (
//       !infobip_data ||
//       !infobip_data.results ||
//       infobip_data.results.length === 0
//     ) {
//       console.log("Invalid Infobip payload: 'results' array missing or empty.");
//       return res
//         .status(200)
//         .json({ status: "error", message: "Invalid payload" });
//     }

//     for (const result of infobip_data.results) {
//       const from_number = result.from;
//       const message_content = result.message;

//       if (!from_number || !message_content || !message_content.type) {
//         console.log("Skipping malformed message in Infobip payload.");
//         continue;
//       }

//       const message_type = message_content.type;
//       let user_message_text = " ";

//       if (message_type === "TEXT") {
//         user_message_text = message_content.text;
//       } else if (message_type === "AUDIO") {
//         const mediaUrl = message_content.url;
//         if (mediaUrl) {
//           user_message_text = await handleVoiceMessage(mediaUrl);
//         } else {
//           console.log("Audio message without a direct URL from Infobip.");
//           user_message_text =
//             "Received an audio message, but couldn't get its URL.";
//         }
//       } else {
//         console.log(`Unsupported message type: ${message_type}`);
//         user_message_text = `Received unsupported message type: ${message_type}. Please send a text or voice message.`;
//       }

//       if (!user_message_text) {
//         console.log(
//           "No valid user message text extracted from Infobip payload."
//         );
//         continue;
//       }

//       console.log(`User ${from_number} sent: ${user_message_text}`);

//       if (!conversations[from_number]) {
//         const convRes = await axios.post(
//           `${DIRECT_LINE_BASE_URL}/conversations`,
//           {},
//           {
//             headers: {
//               Authorization: `Bearer ${DIRECT_LINE_SECRET}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         const convData = convRes.data;
//         conversations[from_number] = {
//           conversationId: convData.conversationId,
//         };
//         console.log(
//           `New conversation started for ${from_number}: ${convData.conversationId}`
//         );
//       }

//       const sendMessageRes = await axios.post(
//         `${DIRECT_LINE_BASE_URL}/conversations/${conversations[from_number].conversationId}/activities`,
//         {
//           type: "message",
//           from: { id: "user" },
//           text: user_message_text,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${DIRECT_LINE_SECRET}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const replyData = sendMessageRes.data;
//       const fullId = replyData.id;
//       let watermark = fullId?.split("|")[1] || null;
//       let botReplyText = "";
//       let retries = 0;

//       while (!botReplyText && retries < 10) {
//         const url = `${DIRECT_LINE_BASE_URL}/conversations/${
//           conversations[from_number].conversationId
//         }/activities${watermark ? `?watermark=${watermark}` : ""}`;

//         let response;
//         try {
//           response = await axios.get(url, {
//             headers: {
//               Authorization: `Bearer ${DIRECT_LINE_SECRET}`,
//             },
//           });
//         } catch (err) {
//           console.error(
//             "Error fetching activities from Direct Line:",
//             err.response?.data || err.message
//           );
//           break;
//         }

//         const data = response.data;
//         watermark = data.watermark;

//         if (data.activities?.length > 0) {
//           const botMessages = data.activities.filter(
//             (a) => a.from.id !== "user" && a.type === "message"
//           );

//           if (botMessages.length > 0) {
//             botReplyText = botMessages.map((msg) => msg.text).join(" ");
//           }
//         }

//         if (!botReplyText) {
//           await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
//           retries++;
//         }
//       }

//       botReplyText = botReplyText || "Sorry, I didn’t get that from the bot.";
//       console.log(`Bot responded: ${botReplyText}`);

//       const formattedToNumber = from_number.startsWith("+")
//         ? from_number
//         : `+${from_number}`;
//       await sendWhatsAppMessageInfobip(formattedToNumber, botReplyText);
//     }

//     return res
//       .status(200)
//       .json({ status: "success", message: "Messages processed" });
//   } catch (error) {
//     console.error(
//       "❌ Error in Infobip webhook:",
//       error.response?.data || error.message
//     );
//     return res.status(500).json({
//       status: "error",
//       message: `Internal server error: ${error.message}`,
//     });
//   }
// });

// mongoose
//   .connect(MONGO_DB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// const userSchema = new mongoose.Schema({
//   smartcardNumber: { type: String, unique: true },
//   name: String,
//   mobile: String,
//   balance: Number,
//   movies: [String],
// });
// const User = mongoose.model("User", userSchema);

// const verifiedUsers = new Set();

// app.post("/verify-smartcard", async (req, res) => {
//   const { smartcardNumber } = req.body;
//   const user = await User.findOne({ smartcardNumber });

//   if (user) {
//     res.json({
//       message: "Smartcard verified. Please enter your mobile number.",
//       validation: true,
//     });
//   } else {
//     res.json({
//       message: "Smartcard is invalid.",
//       validation: false,
//     });
//   }
// });

// app.post("/verify-mobile", async (req, res) => {
//   const { smartcardNumber, mobileNumber } = req.body;
//   const user = await User.findOne({ smartcardNumber });

//   if (user && user.mobile === mobileNumber) {
//     verifiedUsers.add(smartcardNumber);
//     res.json({
//       message: "Verification successful.",
//       name: user.name,
//       smartcardNumber: smartcardNumber,
//       mobileNumber: mobileNumber,
//       validation: true,
//     });
//   } else {
//     res.json({
//       message: "The provided mobile number does not match our records.",
//       validation: false,
//     });
//   }
// });

// app.post("/add-movie", async (req, res) => {
//   const { smartcardNumber, movieName } = req.body;
//   const user = await User.findOne({ smartcardNumber });

//   if (!user) {
//     return res.json({
//       message: "User not found in the system.",
//       validation: false,
//     });
//   }

//   user.movies.push(movieName);
//   await user.save();

//   res.json({
//     message: `Movie '${movieName}' added successfully.`,
//     movieName,
//     validation: true,
//   });
// });

// app.post("/add-balance", async (req, res) => {
//   const { smartcardNumber, amount } = req.body;
//   const user = await User.findOne({ smartcardNumber });

//   if (!user) {
//     return res.json({
//       message: "User not found in the system.",
//       validation: false,
//     });
//   }

//   user.balance += amount;
//   await user.save();

//   res.json({
//     message: `₹${amount} added successfully.`,
//     totalBalance: user.balance,
//     validation: true,
//   });
// });
// app.get("/get-balance", async (req, res) => {
//   const { smartcardNumber } = req.query;
//   const user = await User.findOne({ smartcardNumber });

//   if (!user) {
//     return res.json({
//       message: "User not found in the system.",
//       validation: false,
//     });
//   }

//   res.json({
//     balance: user.balance,
//     movies: user.movies,
//     validation: true,
//   });
// });

// app.listen(port, () => console.log(`Server running on port ${port}`));
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const INFOBIP_API_BASE_URL = "https://lqdxxw.api.infobip.com";
const INFOBIP_API_KEY =
  "2c69ef4d503d932281934d58471e70ac-1a8d5ab1-1489-4947-b277-7d4fb15468b7";
const INFOBIP_WHATSAPP_SENDER_NUMBER = "+447860099299"; // Ensure this has '+' and is your registered sender number

const DIRECT_LINE_BASE_URL =
  process.env.DIRECT_LINE_BASE_URL ||
  "https://directline.botframework.com/v3/directline";
const DIRECT_LINE_SECRET =
  process.env.DIRECT_LINE_SECRET ||
  "4bEHl4WbbsPZnu4Tq3APzAfGbKMVBM2uUEDw2dXyzZ4MDTZSPc03JQQJ99BEAC77bzfAArohAAABAZBS0118.CebHBnxyeBs63IDEs2dowO7Acu8IALe5lc19M3zLy8s26aLWNuhpJQQJ99BEAC77bzfAArohAAABAZBS3Qhc";
const AZURE_SPEECH_KEY =
  process.env.AZURE_SPEECH_KEY ||
  "40K84vS2b0E637v9J0qtz4MEpA7bsjaoRBg9DjQY9A3wjcptJ9o1JQQJ99BCACYeBjFXJ3w3AAAYACOG2sOr";
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "eastus";
const MONGO_DB_URI =
  process.env.MONGO_DB_URI ||
  "mongodb+srv://darshanmagdum:tzj7SxsKHeZoqc14@whatsappbot-cluster.2wgzguz.mongodb.net/SmartcardApp?retryWrites=true&w=majority&appName=WhatsappBOT-CLUSTER";

let conversations = {};

async function sendWhatsAppMessageInfobip(to_number, message_text) {
  const payload = {
    messages: [
      {
        from: INFOBIP_WHATSAPP_SENDER_NUMBER,
        to: to_number,
        message: {
          text: message_text,
        },
      },
    ],
  };
  const headers = {
    Authorization: `App ${INFOBIP_API_KEY}`,
    "Content-Type": "application/json",
  };
  const url = `${INFOBIP_API_BASE_URL}/whatsapp/1/message/text`;

  try {
    // Log the actual payload being sent
    console.log("Infobip API call payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, {
      headers: headers,
      timeout: 30000,
    });
    console.log("Infobip WhatsApp message sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error sending Infobip WhatsApp message:",
      // Try to access the validationErrors array and log its JSON string
      JSON.stringify(error.response?.data?.requestError?.serviceException?.validationErrors, null, 2) ||
      // Fallback to logging the whole data object if validationErrors isn't there
      JSON.stringify(error.response?.data, null, 2) ||
      // Finally, just log the error message
      error.message
    );
    throw error;
  }
}

async function handleVoiceMessage(media_url) {
  try {
    const audioRes = await axios.get(media_url, {
      headers: {
        Authorization: `App ${INFOBIP_API_KEY}`,
      },
      responseType: "arraybuffer",
    });
    const azureSttUrl = `https://${AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;
    const azureHeaders = {
      "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
      "Content-Type": "audio/ogg; codecs=opus",
      "Transfer-Encoding": "chunked",
    };

    const azureRes = await axios.post(azureSttUrl, audioRes.data, {
      headers: azureHeaders,
    });

    const transcribedText = azureRes.data.DisplayText;
    if (!transcribedText) {
      throw new Error("No DisplayText found in Azure STT response.");
    }

    console.log("Transcribed:", transcribedText);
    return transcribedText;
  } catch (err) {
    console.error(
      "Error in handleVoiceMessage:",
      err.response?.data || err.message
    );
    return "Sorry, I had trouble processing your voice message.";
  }
}

app.post("/infobip-whatsapp-webhook", async (req, res) => {
  try {
    const infobip_data = req.body;
    console.log(
      "Received Infobip webhook payload:",
      JSON.stringify(infobip_data, null, 2)
    );

    if (
      !infobip_data ||
      !infobip_data.results ||
      infobip_data.results.length === 0
    ) {
      console.log("Invalid Infobip payload: 'results' array missing or empty.");
      return res
        .status(200)
        .json({ status: "error", message: "Invalid payload" });
    }

    for (const result of infobip_data.results) {
      const from_number = result.from;
      const message_content = result.message;

      if (!from_number || !message_content || !message_content.type) {
        console.log("Skipping malformed message in Infobip payload.");
        continue;
      }

      const message_type = message_content.type;
      let user_message_text = " ";

      if (message_type === "TEXT") {
        user_message_text = message_content.text;
      } else if (message_type === "AUDIO") {
        const mediaUrl = message_content.url;
        if (mediaUrl) {
          user_message_text = await handleVoiceMessage(mediaUrl);
        } else {
          console.log("Audio message without a direct URL from Infobip.");
          user_message_text =
            "Received an audio message, but couldn't get its URL.";
        }
      } else {
        console.log(`Unsupported message type: ${message_type}`);
        user_message_text = `Received unsupported message type: ${message_type}. Please send a text or voice message.`;
      }

      if (!user_message_text) {
        console.log(
          "No valid user message text extracted from Infobip payload."
        );
        continue;
      }

      console.log(`User ${from_number} sent: ${user_message_text}`);

      if (!conversations[from_number]) {
        const convRes = await axios.post(
          `${DIRECT_LINE_BASE_URL}/conversations`,
          {},
          {
            headers: {
              Authorization: `Bearer ${DIRECT_LINE_SECRET}`,
              "Content-Type": "application/json",
            },
          }
        );
        const convData = convRes.data;
        conversations[from_number] = {
          conversationId: convData.conversationId,
        };
        console.log(
          `New conversation started for ${from_number}: ${convData.conversationId}`
        );
      }

      const sendMessageRes = await axios.post(
        `${DIRECT_LINE_BASE_URL}/conversations/${conversations[from_number].conversationId}/activities`,
        {
          type: "message",
          from: { id: "user" },
          text: user_message_text,
        },
        {
          headers: {
            Authorization: `Bearer ${DIRECT_LINE_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      );

      const replyData = sendMessageRes.data;
      const fullId = replyData.id;
      let watermark = fullId?.split("|")[1] || null;
      let botReplyText = "";
      let retries = 0;

      while (!botReplyText && retries < 10) {
        const url = `${DIRECT_LINE_BASE_URL}/conversations/${
          conversations[from_number].conversationId
        }/activities${watermark ? `?watermark=${watermark}` : ""}`;

        let response;
        try {
          response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${DIRECT_LINE_SECRET}`,
            },
          });
        } catch (err) {
          console.error(
            "Error fetching activities from Direct Line:",
            err.response?.data || err.message
          );
          break;
        }

        const data = response.data;
        watermark = data.watermark;

        if (data.activities?.length > 0) {
          const botMessages = data.activities.filter(
            (a) => a.from.id !== "user" && a.type === "message"
          );

          if (botMessages.length > 0) {
            botReplyText = botMessages.map((msg) => msg.text).join(" ");
          }
        }

        if (!botReplyText) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
          retries++;
        }
      }

      botReplyText = botReplyText || "Sorry, I didn’t get that from the bot.";
      console.log(`Bot responded: ${botReplyText}`);

      const formattedToNumber = from_number.startsWith("+")
        ? from_number
        : `+${from_number}`;
      await sendWhatsAppMessageInfobip(formattedToNumber, botReplyText);
    }

    return res
      .status(200)
      .json({ status: "success", message: "Messages processed" });
  } catch (error) {
    console.error(
      "❌ Error in Infobip webhook:",
      // Updated logging for the main webhook catch block
      JSON.stringify(error.response?.data?.requestError?.serviceException?.validationErrors, null, 2) ||
      JSON.stringify(error.response?.data, null, 2) ||
      error.message
    );
    return res.status(500).json({
      status: "error",
      message: `Internal server error: ${error.message}`,
    });
  }
});

mongoose
  .connect(MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  smartcardNumber: { type: String, unique: true },
  name: String,
  mobile: String,
  balance: Number,
  movies: [String],
});
const User = mongoose.model("User", userSchema);

const verifiedUsers = new Set();

app.post("/verify-smartcard", async (req, res) => {
  const { smartcardNumber } = req.body;
  const user = await User.findOne({ smartcardNumber });

  if (user) {
    res.json({
      message: "Smartcard verified. Please enter your mobile number.",
      validation: true,
    });
  } else {
    res.json({
      message: "Smartcard is invalid.",
      validation: false,
    });
  }
});

app.post("/verify-mobile", async (req, res) => {
  const { smartcardNumber, mobileNumber } = req.body;
  const user = await User.findOne({ smartcardNumber });

  if (user && user.mobile === mobileNumber) {
    verifiedUsers.add(smartcardNumber);
    res.json({
      message: "Verification successful.",
      name: user.name,
      smartcardNumber: smartcardNumber,
      mobileNumber: mobileNumber,
      validation: true,
    });
  } else {
    res.json({
      message: "The provided mobile number does not match our records.",
      validation: false,
    });
  }
});

app.post("/add-movie", async (req, res) => {
  const { smartcardNumber, movieName } = req.body;
  const user = await User.findOne({ smartcardNumber });

  if (!user) {
    return res.json({
      message: "User not found in the system.",
      validation: false,
    });
  }

  user.movies.push(movieName);
  await user.save();

  res.json({
    message: `Movie '${movieName}' added successfully.`,
    movieName,
    validation: true,
  });
});

app.post("/add-balance", async (req, res) => {
  const { smartcardNumber, amount } = req.body;
  const user = await User.findOne({ smartcardNumber });

  if (!user) {
    return res.json({
      message: "User not found in the system.",
      validation: false,
    });
  }

  user.balance += amount;
  await user.save();

  res.json({
    message: `₹${amount} added successfully.`,
    totalBalance: user.balance,
    validation: true,
  });
});

app.get("/get-balance", async (req, res) => {
  const { smartcardNumber } = req.query;
  const user = await User.findOne({ smartcardNumber });

  if (!user) {
    return res.json({
      message: "User not found in the system.",
      validation: false,
    });
  }

  res.json({
    balance: user.balance,
    movies: user.movies,
    validation: true,
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
