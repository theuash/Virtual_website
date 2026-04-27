/**
 * Browser Notification Service
 * Handles requesting permissions and showing system-level notifications.
 */

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendSystemNotification = (title, options = {}) => {
  if (Notification.permission === "granted") {
    const defaultOptions = {
      icon: '/logo.png', // Fallback to public logo
      badge: '/logo.png',
      ...options
    };
    return new Notification(title, defaultOptions);
  }
  return null;
};
