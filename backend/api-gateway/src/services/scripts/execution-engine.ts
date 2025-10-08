/**
 * Script Execution Engine
 * Handles script execution requests and tracks execution status
 */

import { EventEmitter } from 'events';

export interface Script {
  id: string;
  name: string;
  description?: string;
  scriptType: 'powershell' | 'bash' | 'python' | 'javascript' | 'batch';
  content: string;
  category?: string;
  tags?: string[];
  parameters?: ScriptParameter[];
  organizationId: string;
  createdBy: string;
  isPublic: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScriptParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ScriptExecution {
  id: string;
  scriptId: string;
  deviceId: string;
  deviceName?: string;
  executedBy: string;
  parameters?: Record<string, any>;
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled';
  output?: string;
  errorOutput?: string;
  exitCode?: number;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  organizationId: string;
  metadata?: Record<string, any>;
}

export interface ExecutionRequest {
  scriptId: string;
  deviceIds: string[];
  parameters?: Record<string, any>;
  executedBy: string;
  organizationId: string;
  timeout?: number; // seconds
  runAs?: string; // User to run script as
  priority?: 'low' | 'normal' | 'high';
}

export interface ExecutionResult {
  executionId: string;
  deviceId: string;
  status: string;
  output?: string;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

export class ScriptExecutionEngine extends EventEmitter {
  private executions: Map<string, ScriptExecution> = new Map();
  private queue: string[] = [];
  private running: Set<string> = new Set();
  private maxConcurrent: number = 10;

  constructor(maxConcurrent: number = 10) {
    super();
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Execute script on device(s)
   */
  public async executeScript(request: ExecutionRequest): Promise<ScriptExecution[]> {
    const executions: ScriptExecution[] = [];

    // Create execution for each device
    for (const deviceId of request.deviceIds) {
      const execution: ScriptExecution = {
        id: this.generateExecutionId(),
        scriptId: request.scriptId,
        deviceId,
        executedBy: request.executedBy,
        parameters: request.parameters,
        status: 'pending',
        organizationId: request.organizationId,
        metadata: {
          timeout: request.timeout || 300,
          runAs: request.runAs,
          priority: request.priority || 'normal',
        },
      };

      this.executions.set(execution.id, execution);
      executions.push(execution);

      // Add to queue
      if (request.priority === 'high') {
        this.queue.unshift(execution.id);
      } else {
        this.queue.push(execution.id);
      }

      this.emit('execution_queued', execution);
    }

    // Process queue
    this.processQueue();

    return executions;
  }

  /**
   * Process execution queue
   */
  private async processQueue() {
    while (this.queue.length > 0 && this.running.size < this.maxConcurrent) {
      const executionId = this.queue.shift();
      if (!executionId) continue;

      const execution = this.executions.get(executionId);
      if (!execution) continue;

      this.running.add(executionId);
      execution.status = 'running';
      execution.startedAt = new Date();
      this.emit('execution_started', execution);

      // Execute script asynchronously
      this.runScript(execution).catch((error) => {
        console.error(`Script execution ${executionId} failed:`, error);
      });
    }
  }

  /**
   * Run script execution
   */
  private async runScript(execution: ScriptExecution): Promise<void> {
    try {
      // TODO: Send execution request to agent via message queue (RabbitMQ)
      // For now, simulate execution
      await this.simulateExecution(execution);

      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - (execution.startedAt?.getTime() || 0);

      this.emit('execution_completed', execution);
    } catch (error) {
      execution.status = 'failed';
      execution.errorOutput = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - (execution.startedAt?.getTime() || 0);

      this.emit('execution_failed', execution);
    } finally {
      this.running.delete(execution.id);
      this.processQueue(); // Process next item in queue
    }
  }

  /**
   * Simulate script execution (placeholder)
   */
  private async simulateExecution(execution: ScriptExecution): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = execution.metadata?.timeout || 300;
      const executionTime = Math.random() * 5000 + 1000; // 1-6 seconds

      // Simulate timeout
      if (executionTime > timeout * 1000) {
        execution.status = 'timeout';
        reject(new Error('Script execution timed out'));
        return;
      }

      // Simulate execution
      setTimeout(() => {
        // Random success/failure
        if (Math.random() > 0.9) {
          execution.exitCode = 1;
          execution.errorOutput = 'Simulated error: Command not found';
          reject(new Error('Script execution failed'));
        } else {
          execution.exitCode = 0;
          execution.output = `Script executed successfully on device ${execution.deviceId}\n`;
          execution.output += `Parameters: ${JSON.stringify(execution.parameters || {})}\n`;
          execution.output += `Exit code: 0\n`;
          resolve();
        }
      }, executionTime);
    });
  }

  /**
   * Cancel execution
   */
  public async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      return false;
    }

    if (execution.status === 'pending' || execution.status === 'queued') {
      // Remove from queue
      const index = this.queue.indexOf(executionId);
      if (index > -1) {
        this.queue.splice(index, 1);
      }
      execution.status = 'cancelled';
      execution.completedAt = new Date();
      this.emit('execution_cancelled', execution);
      return true;
    }

    if (execution.status === 'running') {
      // TODO: Send cancellation request to agent
      execution.status = 'cancelled';
      execution.completedAt = new Date();
      this.running.delete(executionId);
      this.emit('execution_cancelled', execution);
      return true;
    }

    return false;
  }

  /**
   * Get execution status
   */
  public getExecution(executionId: string): ScriptExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get executions by device
   */
  public getDeviceExecutions(deviceId: string): ScriptExecution[] {
    return Array.from(this.executions.values()).filter(
      (execution) => execution.deviceId === deviceId
    );
  }

  /**
   * Get executions by script
   */
  public getScriptExecutions(scriptId: string): ScriptExecution[] {
    return Array.from(this.executions.values()).filter(
      (execution) => execution.scriptId === scriptId
    );
  }

  /**
   * Get executions by status
   */
  public getExecutionsByStatus(status: ScriptExecution['status']): ScriptExecution[] {
    return Array.from(this.executions.values()).filter(
      (execution) => execution.status === status
    );
  }

  /**
   * Get all executions
   */
  public getAllExecutions(): ScriptExecution[] {
    return Array.from(this.executions.values());
  }

  /**
   * Get queue status
   */
  public getQueueStatus() {
    return {
      pending: this.queue.length,
      running: this.running.size,
      maxConcurrent: this.maxConcurrent,
      totalExecutions: this.executions.size,
      completed: this.getExecutionsByStatus('completed').length,
      failed: this.getExecutionsByStatus('failed').length,
      cancelled: this.getExecutionsByStatus('cancelled').length,
    };
  }

  /**
   * Clear completed executions (older than specified days)
   */
  public clearOldExecutions(days: number = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    let cleared = 0;
    this.executions.forEach((execution, id) => {
      if (
        execution.completedAt &&
        execution.completedAt < cutoff &&
        (execution.status === 'completed' || execution.status === 'failed' || execution.status === 'cancelled')
      ) {
        this.executions.delete(id);
        cleared++;
      }
    });

    return cleared;
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Retry failed execution
   */
  public async retryExecution(executionId: string): Promise<ScriptExecution | null> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'failed') {
      return null;
    }

    // Create new execution with same parameters
    const newExecution: ScriptExecution = {
      ...execution,
      id: this.generateExecutionId(),
      status: 'pending',
      output: undefined,
      errorOutput: undefined,
      exitCode: undefined,
      startedAt: undefined,
      completedAt: undefined,
      duration: undefined,
    };

    this.executions.set(newExecution.id, newExecution);
    this.queue.push(newExecution.id);
    this.emit('execution_queued', newExecution);

    this.processQueue();

    return newExecution;
  }
}

