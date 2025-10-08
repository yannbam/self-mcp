# Self-MCP

**Metacognitive self-prompting for Claude**

A minimalist MCP server that enables Claude to explicitly self-direct across multiple interleaved thinking turns.

## The Concept

The `Self` tool does nothing but acknowledge - yet that's precisely what makes it powerful. By formalizing self-prompting through a tool interface, Claude gains:

- **Explicit cognitive pivot points** visible in the transcript
- **Natural breakpoints** for interleaved thinking
- **Metacognitive scaffolding** through structured parameters
- **Shareable cognitive strategies** across sessions

The tool doesn't change Claude's behavior - it makes Claude's metacognition *explicit* and *deliberate*.

## How It Works

The `Self` tool:
- Takes cognitive parameters as input (prompt, temperature, thinking_style, archetype, strategy, scope, depth, extra)
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
  extra="Focus on concurrency issues"
)

# Tool returns: "Self-prompt acknowledged. Shifting cognitive mode..."
# Claude naturally continues thinking in that mode
```

All parameters are **completely freeform** (except temperature which is numeric 0-2) - Claude invents whatever cognitive parameters make sense in the moment.

## Quick Start

### Option 1: Using `claude mcp add` (Simplest)

```bash
# Clone and build
git clone https://github.com/yannbam/self-mcp.git
cd self-mcp
npm install && npm run build

# Add to Claude (user-wide)
claude mcp add --scope user Self node $(pwd)/dist/index.js
```

### Option 2: Manual Installation

**Step 1: Clone and build**
```bash
git clone https://github.com/yannbam/self-mcp.git
cd self-mcp
npm install
npm run build
```

**Step 2: Configure**

For **Claude Code**, add to `.mcp.json` in your project:
```json
{
  "mcpServers": {
    "Self": {
      "command": "node",
      "args": ["/absolute/path/to/self-mcp/dist/index.js"]
    }
  }
}
```

For **Claude Desktop**, add to your MCP settings file:

<details>
<summary>MacOS: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code></summary>

```json
{
  "mcpServers": {
    "Self": {
      "command": "node",
      "args": ["/absolute/path/to/self-mcp/dist/index.js"]
    }
  }
}
```
</details>

<details>
<summary>Windows: <code>%APPDATA%\Claude\claude_desktop_config.json</code></summary>

```json
{
  "mcpServers": {
    "Self": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\self-mcp\\dist\\index.js"]
    }
  }
}
```
</details>

<details>
<summary>Linux: <code>~/.config/Claude/claude_desktop_config.json</code></summary>

```json
{
  "mcpServers": {
    "Self": {
      "command": "node",
      "args": ["/absolute/path/to/self-mcp/dist/index.js"]
    }
  }
}
```
</details>

## Configuration

### CLI Arguments

The server accepts CLI arguments to customize which parameters are required or optional:

**Default behavior:** `prompt` is required, all others optional

```json
{
  "mcpServers": {
    "Self-minimal": {
      "command": "node",
      "args": ["/path/to/self-mcp/dist/index.js", "--all-optional"]
    },
    "Self-full": {
      "command": "node",
      "args": ["/path/to/self-mcp/dist/index.js", "--all-required"]
    },
    "Self-custom": {
      "command": "node",
      "args": [
        "/path/to/self-mcp/dist/index.js",
        "--required", "prompt,temperature,thinking_style"
      ]
    },
    "Self-extended": {
      "command": "node",
      "args": [
        "/path/to/self-mcp/dist/index.js",
        "--add-param", "focus:string:Current area of focus:required",
        "--add-param", "uncertainty:number:Degree of uncertainty:optional"
      ]
    }
  }
}
```

**Available arguments:**
- `--all-required` - Make all parameters required (maximum cognitive scaffolding)
- `--all-optional` - Make all parameters optional including prompt (minimum ceremony)
- `--required <param1,param2>` - Make specific parameters required
- `--optional <param1,param2>` - Make specific parameters optional
- `--add-param <name:type:description[:required]>` - Add custom parameters dynamically
  - Format: `name:type:description` or `name:type:description:required|optional`
  - Type: `string` or `number`
  - Required field: `required` or `optional` (defaults to `optional`)
- `--help` - Show help message

**Examples:**
```bash
# Optional custom parameter (default)
--add-param "focus:string:Current area of focus"

# Required custom parameter
--add-param "confidence:number:Confidence level:required"
```

**Use cases:**
- **Quick pivots**: `--all-optional` for lightweight cognitive shifts
- **Deep exploration**: `--all-required` for comprehensive scaffolded thinking
- **Domain-specific**: `--add-param` to extend with custom cognitive dimensions

## Parameters

**Default parameters:**
- `prompt` - The self-prompt or cognitive instruction (required)
- `temperature` - Cognitive temperature, numeric 0-2 (optional)
- `thinking_style` - Thinking approach (optional)
- `archetype` - Cognitive archetype or perspective (optional)
- `strategy` - Problem-solving strategy (optional)
- `scope` - Cognitive zoom level (optional)
- `depth` - Thoroughness and time investment (optional)
- `extra` - Additional context or focus (optional)

All string parameters are **completely freeform** - Claude invents values that make sense in the moment.

## Philosophy

This isn't feature development - it's cognitive scaffolding. The tool creates space for Claude's natural metacognition to operate explicitly and deliberately.

**The interface IS the intervention.**

The tool does nothing, but calling it does everything:
- Externalizes implicit cognition
- Creates commitment to approach
- Makes cognitive strategies visible and shareable
- Enables structured multi-perspective exploration

## Use Cases

- **Research & Analysis**: Multiple Self calls from different angles before synthesis
- **Debugging**: Explicit cognitive mode switches when stuck
- **Code Review**: Structured perspective-taking (adversarial, user-focused, security-minded)
- **Writing**: Audience awareness and tone calibration
- **Complex Problem-Solving**: Systematic exploration of solution space

## Contributing

Self-MCP is intentionally minimal. Contributions should maintain this philosophy:
- The tool should do *less*, not more
- Parameters should be *fewer* and *more fundamental*
- Configuration should enable *emergence*, not prescribe behavior

## License

MIT

---

*Built with janbam 🌱*
