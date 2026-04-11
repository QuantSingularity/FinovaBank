package com.finova.notificationservice.service;

import com.finova.notificationservice.model.NotificationRequest;

public interface NotificationService {
  void sendNotification(NotificationRequest notificationRequest);
}
