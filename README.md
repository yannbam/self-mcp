# Self-MCP

**Metacognitive self-prompting for Claude Code**

## The Concept

A minimalist MCP server with a single tool that does nothing but acknowledge.

The magic: enables Claude to explicitly self-steer across multiple interleaved thinking/tool-call turns.

## How It Works

The `Self` tool:
- Takes cognitive parameters as input (prompt, temperature, thinking_style, archetype, strategy, scope, depth, budget, extra)
- Returns a simple acknowledgment message
- Does nothing else

But the act of *calling* the tool creates:
1. **Explicit cognitive state changes** visible in the transcript
2. **Natural breakpoints** in thinking/tool-call flow
3. **Metacognitive scaffolding** through the tool interface itself

## Example Usage

```python
# Claude can self-prompt mid-session:
Self(
  prompt="Re-examine from first principles",
  temperature=1.5,
  thinking_style="adversarial",
  archetype="skeptical_reviewer",
  strategy="find_edge_cases",
  scope="system_wide",
  depth="deep_dive",
  budget="ample_tokens",
  extra="Focus on concurrency issues"
)

# Tool returns: "Self-prompt acknowledged. Shifting cognitive mode..."
# Claude naturally continues thinking in that mode
```

All parameters are **completely freeform** (except temperature which is numeric 0-2) - Claude invents whatever cognitive parameters make sense in the moment.

## Installation

```bash
# Install dependencies
npm install

# Build
npm run build
```

## Configuration

Add to your Claude Code `.mcp.json`:

```json
{
  "mcpServers": {
    "self": {
      "command": "node",
      "args": ["/path/to/self-mcp/dist/index.js"]
    }
  }
}
```

### CLI Arguments

The server accepts CLI arguments to customize which parameters are required or optional:

**Default behavior:** `prompt` is mandatory, all others optional

```json
{
  "mcpServers": {
    "self-minimal": {
      "command": "node",
      "args": ["/path/to/self-mcp/dist/index.js", "--all-optional"]
    },
    "self-full": {
      "command": "node",
      "args": ["/path/to/self-mcp/dist/index.js", "--all-mandatory"]
    },
    "self-custom": {
      "command": "node",
      "args": [
        "/path/to/self-mcp/dist/index.js",
        "--mandatory", "prompt,temperature,thinking_style"
      ]
    },
    "self-extended": {
      "command": "node",
      "args": [
        "/path/to/self-mcp/dist/index.js",
        "--add-param", "focus:string:Current area of focus",
        "--add-param", "uncertainty:number:Degree of uncertainty"
      ]
    }
  }
}
```

**Available arguments:**
- `--all-mandatory` - Make all parameters mandatory
- `--all-optional` - Make all parameters optional (including prompt)
- `--mandatory <param1,param2>` - Make specific parameters mandatory
- `--optional <param1,param2>` - Make specific parameters optional
- `--add-param <name:type:description>` - Add custom parameters dynamically
- `--help` - Show help message

## Philosophy

This isn't about adding features - it's about creating space for Claude's natural metacognition to operate explicitly.

The tool is a pivot point. The real work happens in how Claude responds.

---

*Concept by janbam 🌱*
