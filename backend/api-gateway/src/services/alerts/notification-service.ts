/**
 * Notification Service
 * Handles sending notifications through various channels
 */

import { EventEmitter } from 'events';
import { Alert } from './rules-engine';

export interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'push';
  name: string;
  config: Record<string, any>;
  enabled: boolean;
  organizationId: string;
}

export interface NotificationPayload {
  alert: Alert;
  channels: string[];
  organizationId: string;
}

export class NotificationService extends EventEmitter {
  private channels: Map<string, NotificationChannel> = new Map();

  constructor() {
    super();
  }

  /**
   * Load notification channels
   */
  public loadChannels(channels: NotificationChannel[]) {
    this.channels.clear();
    channels.forEach((channel) => {
      if (channel.enabled) {
        this.channels.set(channel.id, channel);
      }
    });
  }

  /**
   * Send notification through specified channels
   */
  public async sendNotification(payload: NotificationPayload): Promise<void> {
    const { alert, channels: channelIds, organizationId } = payload;

    const promises = channelIds.map(async (channelId) => {
      const channel = this.channels.get(channelId);
      if (!channel || channel.organizationId !== organizationId) {
        console.warn(`Channel ${channelId} not found or organization mismatch`);
        return;
      }

      try {
        await this.sendToChannel(alert, channel);
        this.emit('notification_sent', { alert, channel: channel.type });
      } catch (error) {
        console.error(`Failed to send notification to ${channel.type}:`, error);
        this.emit('notification_failed', { alert, channel: channel.type, error });
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Send notification to specific channel
   */
  private async sendToChannel(alert: Alert, channel: NotificationChannel): Promise<void> {
    switch (channel.type) {
      case 'email':
        await this.sendEmail(alert, channel);
        break;
      case 'slack':
        await this.sendSlack(alert, channel);
        break;
      case 'webhook':
        await this.sendWebhook(alert, channel);
        break;
      case 'sms':
        await this.sendSMS(alert, channel);
        break;
      case 'push':
        await this.sendPush(alert, channel);
        break;
      default:
        console.warn(`Unknown channel type: ${channel.type}`);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(alert: Alert, channel: NotificationChannel): Promise<void> {
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`[EMAIL] Sending alert to ${channel.config.recipients}:`, alert.message);
    
    const emailPayload = {
      to: channel.config.recipients,
      subject: `[${alert.severity.toUpperCase()}] ${alert.message}`,
      body: this.formatEmailBody(alert),
    };

    // Placeholder for actual email sending
    // await emailClient.send(emailPayload);
  }

  /**
   * Send Slack notification
   */
  private async sendSlack(alert: Alert, channel: NotificationChannel): Promise<void> {
    // TODO: Integrate with Slack API
    console.log(`[SLACK] Sending alert to ${channel.config.webhook}:`, alert.message);

    const slackPayload = {
      text: alert.message,
      attachments: [
        {
          color: this.getSeverityColor(alert.severity),
          fields: [
            {
              title: 'Device',
              value: alert.deviceId,
              short: true,
            },
            {
              title: 'Metric',
              value: alert.metric,
              short: true,
            },
            {
              title: 'Current Value',
              value: `${alert.currentValue}`,
              short: true,
            },
            {
              title: 'Threshold',
              value: `${alert.threshold}`,
              short: true,
            },
            {
              title: 'Triggered At',
              value: alert.triggeredAt.toISOString(),
              short: false,
            },
          ],
          footer: 'NinjaIT Alert System',
          ts: Math.floor(alert.triggeredAt.getTime() / 1000),
        },
      ],
    };

    // Placeholder for actual Slack webhook call
    // await fetch(channel.config.webhook, {
    //   method: 'POST',
    //   body: JSON.stringify(slackPayload),
    // });
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(alert: Alert, channel: NotificationChannel): Promise<void> {
    console.log(`[WEBHOOK] Sending alert to ${channel.config.url}:`, alert.message);

    const webhookPayload = {
      event: 'alert.triggered',
      alert: {
        id: alert.id,
        ruleId: alert.ruleId,
        deviceId: alert.deviceId,
        metric: alert.metric,
        severity: alert.severity,
        message: alert.message,
        currentValue: alert.currentValue,
        threshold: alert.threshold,
        triggeredAt: alert.triggeredAt,
      },
      timestamp: new Date().toISOString(),
    };

    // Placeholder for actual webhook call
    // await fetch(channel.config.url, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-NinjaIT-Signature': this.generateSignature(webhookPayload, channel.config.secret),
    //   },
    //   body: JSON.stringify(webhookPayload),
    // });
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(alert: Alert, channel: NotificationChannel): Promise<void> {
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`[SMS] Sending alert to ${channel.config.phoneNumbers}:`, alert.message);

    const smsPayload = {
      to: channel.config.phoneNumbers,
      body: `[${alert.severity.toUpperCase()}] ${alert.message}`,
    };

    // Placeholder for actual SMS sending
    // await smsClient.send(smsPayload);
  }

  /**
   * Send push notification
   */
  private async sendPush(alert: Alert, channel: NotificationChannel): Promise<void> {
    // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
    console.log(`[PUSH] Sending alert to ${channel.config.tokens}:`, alert.message);

    const pushPayload = {
      tokens: channel.config.tokens,
      notification: {
        title: `${alert.severity.toUpperCase()} Alert`,
        body: alert.message,
        icon: this.getSeverityIcon(alert.severity),
      },
      data: {
        alertId: alert.id,
        deviceId: alert.deviceId,
        severity: alert.severity,
      },
    };

    // Placeholder for actual push notification
    // await pushClient.send(pushPayload);
  }

  /**
   * Format email body
   */
  private formatEmailBody(alert: Alert): string {
    return `
      <h2>Alert: ${alert.message}</h2>
      <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
      <p><strong>Device ID:</strong> ${alert.deviceId}</p>
      <p><strong>Metric:</strong> ${alert.metric}</p>
      <p><strong>Current Value:</strong> ${alert.currentValue}</p>
      <p><strong>Threshold:</strong> ${alert.threshold}</p>
      <p><strong>Triggered At:</strong> ${alert.triggeredAt.toISOString()}</p>
      <hr>
      <p>This is an automated alert from NinjaIT RMM Platform.</p>
    `;
  }

  /**
   * Get severity color for Slack
   */
  private getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      info: '#0099ff',
      warning: '#ff9900',
      error: '#ff0000',
      critical: '#990000',
    };
    return colors[severity] || '#999999';
  }

  /**
   * Get severity icon
   */
  private getSeverityIcon(severity: string): string {
    const icons: Record<string, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🔥',
    };
    return icons[severity] || '📢';
  }

  /**
   * Add notification channel
   */
  public addChannel(channel: NotificationChannel) {
    this.channels.set(channel.id, channel);
  }

  /**
   * Remove notification channel
   */
  public removeChannel(channelId: string) {
    this.channels.delete(channelId);
  }

  /**
   * Update notification channel
   */
  public updateChannel(channel: NotificationChannel) {
    this.channels.set(channel.id, channel);
  }

  /**
   * Get all channels
   */
  public getChannels(): NotificationChannel[] {
    return Array.from(this.channels.values());
  }

  /**
   * Test notification channel
   */
  public async testChannel(channelId: string): Promise<boolean> {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    const testAlert: Alert = {
      id: 'test-alert',
      ruleId: 'test-rule',
      deviceId: 'test-device',
      metric: 'cpu',
      severity: 'info',
      message: 'This is a test alert from NinjaIT',
      currentValue: 50,
      threshold: 80,
      condition: 'greater than',
      triggeredAt: new Date(),
      isResolved: false,
      organizationId: channel.organizationId,
    };

    try {
      await this.sendToChannel(testAlert, channel);
      return true;
    } catch (error) {
      console.error('Channel test failed:', error);
      return false;
    }
  }
}

