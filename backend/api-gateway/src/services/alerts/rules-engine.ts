/**
 * Alert Rules Engine
 * Evaluates metrics against defined rules and triggers alerts
 */

import { EventEmitter } from 'events';

export interface AlertRule {
  id: string;
  name: string;
  deviceId?: string;
  metric: 'cpu' | 'memory' | 'disk' | 'network' | 'uptime';
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration?: number; // seconds - alert only if condition persists
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  organizationId: string;
  notificationChannels: string[];
  cooldown?: number; // seconds - minimum time between alerts
}

export interface Alert {
  id: string;
  ruleId: string;
  deviceId: string;
  metric: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  currentValue: number;
  threshold: number;
  condition: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  isResolved: boolean;
  organizationId: string;
}

export interface MetricData {
  deviceId: string;
  organizationId: string;
  timestamp: Date;
  cpu?: number;
  memory?: number;
  disk?: number;
  network?: number;
  uptime?: number;
}

export class AlertRulesEngine extends EventEmitter {
  private rules: Map<string, AlertRule> = new Map();
  private alertHistory: Map<string, Date> = new Map(); // Track last alert time for cooldown
  private conditionState: Map<string, { startTime: Date; value: number }> = new Map(); // Track condition duration

  constructor() {
    super();
  }

  /**
   * Load rules from database
   */
  public loadRules(rules: AlertRule[]) {
    this.rules.clear();
    rules.forEach((rule) => {
      if (rule.enabled) {
        this.rules.set(rule.id, rule);
      }
    });
  }

  /**
   * Add a new rule
   */
  public addRule(rule: AlertRule) {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove a rule
   */
  public removeRule(ruleId: string) {
    this.rules.delete(ruleId);
  }

  /**
   * Update a rule
   */
  public updateRule(rule: AlertRule) {
    this.rules.set(rule.id, rule);
  }

  /**
   * Evaluate metrics against all rules
   */
  public evaluateMetrics(metrics: MetricData): Alert[] {
    const triggeredAlerts: Alert[] = [];

    this.rules.forEach((rule) => {
      // Skip if rule is for specific device and doesn't match
      if (rule.deviceId && rule.deviceId !== metrics.deviceId) {
        return;
      }

      // Skip if organization doesn't match
      if (rule.organizationId !== metrics.organizationId) {
        return;
      }

      // Get metric value
      const metricValue = metrics[rule.metric];
      if (metricValue === undefined) {
        return;
      }

      // Check if condition is met
      if (this.checkCondition(rule, metricValue)) {
        // Check duration requirement
        if (rule.duration && rule.duration > 0) {
          if (!this.checkDuration(rule, metrics.deviceId, metricValue)) {
            return; // Condition not met for required duration
          }
        }

        // Check cooldown
        if (this.isInCooldown(rule)) {
          return;
        }

        // Trigger alert
        const alert = this.createAlert(rule, metrics.deviceId, metricValue);
        triggeredAlerts.push(alert);

        // Update alert history
        this.alertHistory.set(rule.id, new Date());

        // Emit alert event
        this.emit('alert', alert);
      } else {
        // Condition not met, clear duration state
        const stateKey = `${rule.id}-${metrics.deviceId}`;
        this.conditionState.delete(stateKey);
      }
    });

    return triggeredAlerts;
  }

  /**
   * Check if condition is met
   */
  private checkCondition(rule: AlertRule, value: number): boolean {
    switch (rule.condition) {
      case 'gt':
        return value > rule.threshold;
      case 'gte':
        return value >= rule.threshold;
      case 'lt':
        return value < rule.threshold;
      case 'lte':
        return value <= rule.threshold;
      case 'eq':
        return value === rule.threshold;
      default:
        return false;
    }
  }

  /**
   * Check if condition has persisted for required duration
   */
  private checkDuration(rule: AlertRule, deviceId: string, value: number): boolean {
    const stateKey = `${rule.id}-${deviceId}`;
    const state = this.conditionState.get(stateKey);
    const now = new Date();

    if (!state) {
      // First time condition is met, start tracking
      this.conditionState.set(stateKey, { startTime: now, value });
      return false;
    }

    // Check if condition has persisted for required duration
    const elapsed = (now.getTime() - state.startTime.getTime()) / 1000;
    if (elapsed >= rule.duration!) {
      return true;
    }

    return false;
  }

  /**
   * Check if rule is in cooldown period
   */
  private isInCooldown(rule: AlertRule): boolean {
    if (!rule.cooldown || rule.cooldown <= 0) {
      return false;
    }

    const lastAlert = this.alertHistory.get(rule.id);
    if (!lastAlert) {
      return false;
    }

    const elapsed = (Date.now() - lastAlert.getTime()) / 1000;
    return elapsed < rule.cooldown;
  }

  /**
   * Create alert object
   */
  private createAlert(rule: AlertRule, deviceId: string, value: number): Alert {
    const conditionText = this.getConditionText(rule.condition);
    
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      deviceId,
      metric: rule.metric,
      severity: rule.severity,
      message: `${rule.name}: ${rule.metric} is ${value}${this.getMetricUnit(rule.metric)} (${conditionText} ${rule.threshold}${this.getMetricUnit(rule.metric)})`,
      currentValue: value,
      threshold: rule.threshold,
      condition: conditionText,
      triggeredAt: new Date(),
      isResolved: false,
      organizationId: rule.organizationId,
    };
  }

  /**
   * Get human-readable condition text
   */
  private getConditionText(condition: string): string {
    const map: Record<string, string> = {
      gt: 'greater than',
      gte: 'greater than or equal to',
      lt: 'less than',
      lte: 'less than or equal to',
      eq: 'equal to',
    };
    return map[condition] || condition;
  }

  /**
   * Get metric unit
   */
  private getMetricUnit(metric: string): string {
    const units: Record<string, string> = {
      cpu: '%',
      memory: '%',
      disk: '%',
      network: ' Mbps',
      uptime: ' seconds',
    };
    return units[metric] || '';
  }

  /**
   * Get all active rules
   */
  public getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rules for specific device
   */
  public getDeviceRules(deviceId: string): AlertRule[] {
    return Array.from(this.rules.values()).filter(
      (rule) => !rule.deviceId || rule.deviceId === deviceId
    );
  }

  /**
   * Clear all rules
   */
  public clearRules() {
    this.rules.clear();
    this.alertHistory.clear();
    this.conditionState.clear();
  }
}

