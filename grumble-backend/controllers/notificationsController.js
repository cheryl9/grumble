const notificationsRepo = require("../repositories/notificationsRepository");

async function getUnreadNotifications(req, res) {
  try {
    const notifications = await notificationsRepo.getUnreadNotifications(
      req.user.id,
      10,
    );

    const notificationIds = notifications.map((notification) => notification.id);
    await notificationsRepo.markNotificationsRead(notificationIds, req.user.id);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    console.error("getUnreadNotifications error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
}

module.exports = {
  getUnreadNotifications,
};