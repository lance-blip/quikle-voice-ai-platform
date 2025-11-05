# Thoughtly - Agent Builder Analysis

## Sources
- Agent Builder Overview: https://docs.thoughtly.com/agents/overview
- Nodes and their Types: https://docs.thoughtly.com/agents/nodes
- Outcomes: https://docs.thoughtly.com/agents/outcomes
- Variables: https://docs.thoughtly.com/agents/variables
- Actions: https://docs.thoughtly.com/agents/actions

## Key Observations

### Workflow Structure

**Visual Flow Editor:**
- Node-based canvas with connections
- Clean, minimalist UI with light backgrounds
- Right-side panel for node configuration
- Bottom-right "+" button to add nodes
- Linear flow with branching via outcomes

**Core Philosophy:**
- "Conversational agents that sound natural and get work done"
- Balance between "adaptive AI" and "deterministic rules"
- "Brand-safe scripting" with control where needed
- Non-technical team focus

### Node Types (4 Core Types)

**1. Start Node**
- Opens the conversation
- First thing caller hears
- Content spoken exactly as written (verbatim)
- Best for: Legal wording, opt-in statements, greetings
- Can reference variables for personalization

**2. Speak Node (Two Variants)**

**Speak > Message:**
- Fixed lines with minimal variation
- Options:
  - "Repeat verbatim" - exact delivery every time
  - "Uninterrupted message" - prevents caller interruption
  - "Read numbers phonetically" - improves number pronunciation
- Best for: Confirmations, disclaimers, short instructions

**Speak > Prompt:**
- Composed responses using context/data
- Treats field as "instructions" not script
- Uses variables and integration outputs
- Adaptive AI-powered responses
- Options:
  - "Uninterrupted message"
  - "Read numbers phonetically"
- Best for: Dynamic Q&A, complex responses, data-driven answers

**Authoring Template for Prompts:**
```
Goal: <what to accomplish>
Constraints: <what to avoid>
Must-say points: <required information>
Tone: <how to sound>
Clarity cue: "Keep it short and concise"
```

**3. Transfer Node (Two Modes)**

**Phone Router:**
- Transfers to specific phone number
- Optional pre-transfer message (verbatim)
- Immediate transfer after message

**Agent Transfer:**
- Connects to another Thoughtly agent
- No extra setup required
- Current session ends when transfer begins
- Best for: Warm hand-offs, specialist escalation

**4. End Node**
- Closes conversation gracefully
- Content spoken exactly as written
- Hands control to downstream automations
- Can have multiple End nodes for different branches

### Outcomes (Routing Logic)

**Two Types:**

**1. Prompt-Based Outcomes (AI-Driven)**
- AI evaluates caller response and selects best match
- Best for: Open-ended replies, varied phrasing, intent detection
- Writing guidelines:
  - Be distinct (avoid "Positive" vs "Very positive")
  - Be concrete ("Wants appointment" not "Positive answer")
  - Be short (12-50 characters)
  - Cover common branches only

Example set:
- "Wants to book now"
- "Interested, send SMS link"
- "Not interested"
- "Busy - call back later"

**2. Rule-Based Outcomes (Deterministic)**
- Top-to-bottom evaluation
- First match wins
- No AI involved
- MUST have "Else/Default" outcome
- Best for: Structured data, yes/no, compliance, validation

Evaluation order critical:
```
Outcome A: caller_said_stop == true → End
Outcome B: email_is_valid == true → Next step
Outcome C: Else/Default → Clarify/retry
```

**Loops:**
- Can connect outcome back to same node
- Best for: Q&A loops, validation retries
- Must have exit condition or max retry count

**Key Rule: Outcomes execute BEFORE actions in a node**
Order: Variables → Outcomes → Actions

### Variables (Data Capture)

**Extraction Timing:**
- Immediately after caller's reply
- BEFORE outcome evaluation
- Outcomes can use fresh variable values

**Configuration Fields:**

1. **Name** - Identifier (e.g., `budget`, `email`, `callback_time`)

2. **Source:**
   - "Current speak node" - only latest reply (precise)
   - "Conversation history" - searches entire conversation (fallback)

3. **Extraction Instructions** - Natural language description of what/how to extract

Template:
```
Goal: Extract the <thing> the caller states.
If multiple candidates: choose the most recent, high-confidence value.
If absent or unclear: return an empty value (no placeholder text).
Normalization: <how to clean or format>.
Do not invent values.
```

4. **Format:**
   - Text (default)
   - Number (enforces numeric)
   - Boolean (true/false)

**System Variables:**
- `{{system.interviewResponse.id}}` - unique call ID

**AI-Generated Variables:**
- Can use AI to extract keywords, summaries, sentiment from transcript

**Validation:**
- Use rule-based outcomes to check variable values
- Example: `email` is empty → loop back to re-ask
- Example: `budget >= 250000` → high-intent path

### Actions (Mid-Call Integrations)

**Purpose:**
- Lookup data (CRM, API)
- Write records
- Automate workflows
- Run mid-call without waiting for caller response

**Execution Flow (with actions):**
1. Agent speaks (Message or Prompt)
2. Actions run mid-call (interruptions disabled by default)
3. Variables update from action results
4. Outcomes evaluate (rule-based recommended)
5. Next node executes

**Key Insight:** Caller does NOT speak before outcomes fire when actions are present. Use rule-based outcomes that check action results.

**Recommended Patterns:**

**1. Lookup → Branch**
- Action: CRM/API lookup
- Variables: `lookup_found` (boolean), `customer_id`
- Outcomes:
  - `lookup_found == true` → enriched path
  - `lookup_found == false` → collect details

**2. Validate → Retry Loop**
- Action: Email/phone verification
- Variables: `email`, `email_valid` (boolean)
- Outcomes:
  - `email_valid == true` → next step
  - Else → self-loop (with retry limit)

**3. Book → Confirm**
- Action: Scheduler integration
- Variables: `timeslot_chosen`, `booking_status`
- Outcomes:
  - `booking_status == "confirmed"` → confirmation
  - Else → offer alternatives or transfer

**Error Handling:**
- Happy path: `action_status == "ok"`
- Recoverable: `action_status == "error"` → retry
- Fallback: persistent failure → transfer to human
- Timeouts: graceful message and continue

**Best Practices:**
- Keep interruptions disabled during actions
- Add "One moment while I check that" before long actions
- Use structured outputs (`action_status = "ok"` or `"error"`)
- Send only needed variables (lean payloads)

### Testing

**Two Modes:**

1. **Test Agent** (text-based)
   - Debug conversation flow
   - Verify logic cheaply
   - Test first before voice

2. **Call Me** (live voice)
   - Polish actual voice experience
   - Test pronunciation, timing, presence
   - Validate end-to-end flow

**Workflow:** Test Agent (text) → Call Me (voice) → iterate

### Settings

**Configuration Options:**
- Voice selection (marketplace)
- Language
- Presence/endpointing
- Knowledge base ("Genius")
- Post-call behavior
- Voicemail handling
- Advanced prompts

### UI/UX Paradigms

**Simplicity:**
- 4 node types (vs. 8+ in competitors)
- Two outcome modes (prompt vs. rule)
- Clear visual hierarchy
- Right panel for configuration
- No code required

**Natural Language Configuration:**
- Extraction instructions for variables
- Prompt instructions for speak nodes
- Outcome labels as plain English

**Deterministic Control:**
- "Repeat verbatim" option for compliance
- Rule-based outcomes for precision
- Uninterrupted messages for critical info

**Progressive Disclosure:**
- Start simple, add complexity incrementally
- Template-based starting points
- Clear decision guide ("What to use when")

**Error Prevention:**
- Must have Else/Default in rule outcomes
- Warnings about dead ends
- Execution order clearly documented

### Advanced Capabilities

**Knowledge Base ("Genius"):**
- Stores information for agents
- Custom prompts shape behavior
- Referenced during conversations

**Automations:**
- Post-call workflows
- Integration with external systems
- Webhook support

**Developer Documentation:**
- API reference available
- Programmatic access
- Custom integrations

**Promptbooks:**
- Reusable prompt templates
- Best practices library

---

## Key Takeaways for VoiceForge

1. **Simplicity Through Constraint**: 4 node types vs. 8 (less is more)
2. **Dual-Mode Nodes**: Message (verbatim) vs. Prompt (adaptive) in same node type
3. **Deterministic + AI Hybrid**: Rule-based outcomes for precision, prompt-based for flexibility
4. **Variables Extract First**: Before outcomes, enabling immediate branching
5. **Actions Without Caller Input**: Mid-call integrations that don't wait for response
6. **Mandatory Else/Default**: Prevents dead ends in rule-based routing
7. **Test-First Workflow**: Text testing before voice testing
8. **Natural Language Instructions**: Extraction instructions, prompt templates
9. **Progressive Complexity**: Start simple, add features incrementally
10. **Voice-First Design**: Pronunciation controls, interruption management, presence settings

