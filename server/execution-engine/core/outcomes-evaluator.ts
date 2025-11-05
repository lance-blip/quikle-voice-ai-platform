import { ExecutionContext, FlowNode, FlowEdge, Outcome } from './execution-context';

export class OutcomesEvaluator {
  private edges: FlowEdge[];
  private llmService: any; // TODO: Type this properly
  
  constructor(edges: FlowEdge[], llmService: any) {
    this.edges = edges;
    this.llmService = llmService;
  }
  
  /**
   * Evaluates outcomes for a node and returns the next node ID
   */
  public async evaluate(node: FlowNode, context: ExecutionContext): Promise<string | null> {
    const outcomes = node.data.outcomes || [];
    
    if (outcomes.length === 0) {
      // No outcomes defined, follow default edge
      return this.getDefaultNextNode(node.id);
    }
    
    // Check if outcomes are prompt-based or rule-based
    const firstOutcome = outcomes[0];
    
    if (firstOutcome.type === 'prompt') {
      // AI-driven outcome evaluation
      return await this.evaluateWithAI(outcomes, context);
    } else {
      // Rule-based outcome evaluation
      return this.evaluateWithRules(outcomes, context);
    }
  }
  
  /**
   * Evaluates outcomes using AI (LLM)
   */
  private async evaluateWithAI(outcomes: Outcome[], context: ExecutionContext): Promise<string | null> {
    // Get the last message from the caller
    const lastMessage = context.conversationHistory
      .filter(m => m.role === 'caller')
      .pop();
    
    if (!lastMessage) {
      console.warn('No caller message found for AI outcome evaluation');
      return this.getDefaultOutcome(outcomes);
    }
    
    try {
      const outcomeLabels = outcomes.map(o => o.label);
      const selectedLabel = await this.llmService.evaluateOutcome(
        lastMessage.text,
        outcomeLabels
      );
      
      const selectedOutcome = outcomes.find(o => o.label === selectedLabel);
      
      if (selectedOutcome) {
        console.log(`AI selected outcome: ${selectedLabel}`);
        return selectedOutcome.targetNodeId;
      }
      
      // Fallback to default
      return this.getDefaultOutcome(outcomes);
    } catch (error) {
      console.error('Error evaluating outcomes with AI:', error);
      return this.getDefaultOutcome(outcomes);
    }
  }
  
  /**
   * Evaluates outcomes using rules
   */
  private evaluateWithRules(outcomes: Outcome[], context: ExecutionContext): string | null {
    for (const outcome of outcomes) {
      if (outcome.rule && this.evaluateRule(outcome.rule, context.variables)) {
        console.log(`Rule matched outcome: ${outcome.label}`);
        return outcome.targetNodeId;
      }
    }
    
    // No rule matched, use default outcome
    return this.getDefaultOutcome(outcomes);
  }
  
  /**
   * Evaluates a single rule
   */
  private evaluateRule(rule: string, variables: Record<string, any>): boolean {
    if (!rule) return false;
    
    try {
      // Simple rule evaluation
      // Format: "variable_name == value" or "variable_name > value"
      
      const operators = ['==', '!=', '>', '<', '>=', '<=', 'contains', 'startsWith', 'endsWith'];
      let operator = '';
      let parts: string[] = [];
      
      for (const op of operators) {
        if (rule.includes(op)) {
          operator = op;
          parts = rule.split(op).map(p => p.trim());
          break;
        }
      }
      
      if (parts.length !== 2) {
        console.warn(`Invalid rule format: ${rule}`);
        return false;
      }
      
      const [varName, expectedValue] = parts;
      const actualValue = variables[varName];
      
      // Convert values for comparison
      const expected = this.parseValue(expectedValue);
      
      switch (operator) {
        case '==':
          return actualValue == expected;
        case '!=':
          return actualValue != expected;
        case '>':
          return Number(actualValue) > Number(expected);
        case '<':
          return Number(actualValue) < Number(expected);
        case '>=':
          return Number(actualValue) >= Number(expected);
        case '<=':
          return Number(actualValue) <= Number(expected);
        case 'contains':
          return String(actualValue).toLowerCase().includes(String(expected).toLowerCase());
        case 'startsWith':
          return String(actualValue).toLowerCase().startsWith(String(expected).toLowerCase());
        case 'endsWith':
          return String(actualValue).toLowerCase().endsWith(String(expected).toLowerCase());
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error evaluating rule: ${rule}`, error);
      return false;
    }
  }
  
  /**
   * Parses a value from a string
   */
  private parseValue(value: string): any {
    // Try to parse as number
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    
    // Try to parse as boolean
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    return value;
  }
  
  /**
   * Gets the default next node (follows the first edge from this node)
   */
  private getDefaultNextNode(nodeId: string): string | null {
    const edge = this.edges.find(e => e.source === nodeId);
    return edge?.target || null;
  }
  
  /**
   * Gets the default outcome (first outcome or outcome marked as default)
   */
  private getDefaultOutcome(outcomes: Outcome[]): string | null {
    const defaultOutcome = outcomes.find(o => o.isDefault);
    if (defaultOutcome) {
      return defaultOutcome.targetNodeId;
    }
    
    // Fallback to first outcome
    return outcomes[0]?.targetNodeId || null;
  }
}
