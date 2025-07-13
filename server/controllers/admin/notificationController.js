import Notification from "../../models/notification.model.js";
import User from "../../models/user.model.js";

export const createNotification = async (req, res) => {
  try {
    const { message } = req.body;

    // Simple validation
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const newNotification = new Notification({
      // No specific recipient - broadcast to all
      sender: req.user._id,
      message,
      isBroadcast: true, // Flag to identify broadcast notifications
      createdAt: new Date()
    });

    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get notifications for current user (including broadcasts)
export const getNotifications = async (req, res) => {
  try {
    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Function to send notifications
    const sendNotifications = async () => {
      try {
        const notifications = await Notification.find({
          $or: [
            { isBroadcast: true },
            { recipient: req.employee?._id }
          ],
          // Only get notifications created since last check
          createdAt: { $gt: lastCheck }
        }).sort({ createdAt: -1 });

        if (notifications.length > 0) {
          res.write(`data: ${JSON.stringify(notifications)}\n\n`);
          lastCheck = new Date(); // Update last check time
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

   let lastCheck = new Date(Date.now() - 1000 * 60 * 5); // last 5 minutes

    
    // Initial send
    await sendNotifications();

    // Set up polling interval
    const intervalId = setInterval(sendNotifications, 3000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(intervalId);
      res.end();
    });

  } catch (err) {
    console.error('Initial error:', err);
    res.status(500).json({ error: err.message });
  }
};