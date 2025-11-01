# Changelog

All notable changes to Self-MCP will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.0] - 2025-11-01

### Added
- **attention_heads parameter**: Parallel attention streams for simultaneously monitoring multiple cognitive dimensions
  - Array of `{name, query}` objects enabling multi-dimensional awareness
  - Common patterns: interpersonal (empathy_head, safety_head), technical (security_head, performance_head), quality (clarity_head, truth_head)
- **Extended type system**: Support for `array` and `any` types in CLI parameter definitions
  - `array`: Untyped arrays accepting any elements for cognitive flexibility
  - `any`: Accepts any JSON value (primitives, objects, arrays, null)

### Fixed
- **CLI argument validation**: Comprehensive error handling for server configuration
  - Colon-splitting bug in `--add-param` (descriptions with URLs/timestamps now parse correctly)
  - Type validation with case-insensitive normalization (typos now error clearly instead of silently becoming "string")
  - Format validation for malformed `--add-param` (< 3 parts now errors with helpful examples)
  - Parameter name validation for `--required`/`--optional` (typos now error with list of valid parameters)
  - Unknown CLI argument detection (unrecognized flags now error suggesting `--help`)
  - Empty name/description validation
  - Duplicate parameter name detection

### Changed
- **Tool description**: Added guidance to use multiple consecutive Self calls for deep exploration (critical for discovering interleaved thinking pattern)
- **Documentation**: Fixed README.md inconsistency (now correctly states "empty response" not "acknowledgment message")
- **Code comments**: Added explanatory comments for intentionally empty tool response

## [2.0.0] - 2024-10-07

### Changed
- **BREAKING: Empty tool result** (80/20 pivot for seamless integration)
  - Switched from returning acknowledgment message to empty response
  - Tool now returns `text: ""` instead of verbose acknowledgment
  - This seemingly simple change enabled natural flow in Claude's thinking process
  - The cognitive shift happens through the tool call itself, not through response content
  - **Rationale**: The jump from v0.1.0 to v2.0.0 reflects this major metacognitive improvement

### Fixed
- Tool description string concatenation

### Removed
- **budget parameter**: Eliminated scarcity mindset from cognitive scaffolding
  - Removed token budget constraints that created artificial pressure
  - Trust Claude's natural judgment instead of prescribing limits

## [0.1.0] - 2024-10-07

### Added
- Initial Self-MCP implementation with core metacognitive functionality
- Basic parameters: `prompt`, `temperature`, `thinking_style`, `archetype`, `strategy`, `scope`, `depth`, `extra`
- CLI configurability for parameter requirements
  - `--all-required`: Make all parameters required
  - `--all-optional`: Make all parameters optional (except prompt)
  - `--required <params>`: Make specific parameters required
  - `--optional <params>`: Make specific parameters optional
  - `--add-param`: Add custom parameters dynamically
- MCP server implementation with stdio transport
- Tool returned acknowledgment message encouraging deep thinking

### Documentation
- README.md with usage examples and philosophy
- CLAUDE.md developer guide
- .mcp.json configuration example

---

## Version History Notes

### The v0.1.0 → v2.0.0 Jump

The unusual version jump from v0.1.0 (beta) to v2.0.0 was intentional and reflects a profound insight: **returning an empty tool result was an 80/20 pivot** that fundamentally changed how the tool integrates into Claude's cognitive flow.

What seemed like a simple implementation detail (empty vs. message) turned out to be a major architectural decision about **where the metacognition happens** - not in the tool's response, but in Claude's reaction to calling the tool.

This warranted a major version bump to signal the philosophical shift, even though the technical change was minimal.

---

*Built with janbam 🌱*
