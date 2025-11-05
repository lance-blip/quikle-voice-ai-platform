import { ExecutionContext } from './execution-context';
import { eventBus } from './event-bus';

export class VariableManager {
  /**
   * Renders templates in data by replacing {{variable_name}} with actual values
   */
  public renderTemplates(data: any, variables: Record<string, any>): any {
    if (typeof data === 'string') {
      return this.renderString(data, variables);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.renderTemplates(item, variables));
    }
    
    if (typeof data === 'object' && data !== null) {
      const rendered: any = {};
      for (const [key, value] of Object.entries(data)) {
        rendered[key] = this.renderTemplates(value, variables);
      }
      return rendered;
    }
    
    return data;
  }
  
  /**
   * Renders a string template by replacing {{variable_name}} with actual values
   */
  private renderString(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = variables[varName];
      
      if (value === undefined || value === null) {
        return match; // Keep placeholder if variable not found
      }
      
      return String(value);
    });
  }
  
  /**
   * Sets a variable in the execution context
   */
  public async setVariable(
    context: ExecutionContext,
    name: string,
    value: any
  ): Promise<void> {
    // Update in-memory context
    context.variables[name] = value;
    
    // Persist to database
    await context.db.setVariable(context.callId, name, value);
    
    // Emit event
    eventBus.emitEvent({
      type: 'variable.set',
      callId: context.callId,
      timestamp: new Date(),
      data: {
        variableName: name,
        variableValue: value,
      },
    });
  }
  
  /**
   * Gets a variable from the execution context
   */
  public getVariable(context: ExecutionContext, name: string): any {
    return context.variables[name];
  }
  
  /**
   * Extracts a variable from text using LLM
   */
  public async extractVariable(
    context: ExecutionContext,
    text: string,
    extractionInstructions: string,
    variableName: string,
    llmService: any // TODO: Type this properly
  ): Promise<any> {
    try {
      const value = await llmService.extractVariable(text, extractionInstructions);
      
      // Set the variable
      await this.setVariable(context, variableName, value);
      
      // Emit extraction event
      eventBus.emitEvent({
        type: 'variable.extracted',
        callId: context.callId,
        timestamp: new Date(),
        data: {
          variableName,
          extractedValue: value,
          sourceText: text,
          instructions: extractionInstructions,
        },
      });
      
      return value;
    } catch (error) {
      console.error(`Error extracting variable ${variableName}:`, error);
      return null;
    }
  }
  
  /**
   * Validates a variable against a schema
   */
  public validateVariable(value: any, schema: any): boolean {
    // TODO: Implement schema validation (e.g., using Zod)
    return true;
  }
}
