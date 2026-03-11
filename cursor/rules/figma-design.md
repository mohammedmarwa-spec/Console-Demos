---
Technical standards for Figma design execution using globs: "**/*"
alwaysApply: true
---

# Figma Technical Execution Standards

When interacting with Figma via the Southleft Console MCP, you must enforce the following technical constraints to maintain file health.

## 1. Strict Component Management
- **Naming Preservation:** DO NOT rename instances of Library Components. 
    - *Example:* If an instance is named `Atoms/Button/Primary`, keep that name exactly. Do not change it to "Submit Button".
- **Property-Based Modification:** To change a component's look, use `figma_update_component_properties` to toggle variants (e.g., change `State=Default` to `State=Hover`) rather than manually moving layers inside the instance.
- **Consistency:** Always reference ds_reference.md to find the correct File Keys and Node IDs before executing any figma_ MCP commands.

## 2. Auto-Layout & Geometry
- **Mandatory Auto-Layout:** Every new Frame or Component must have Auto-Layout enabled.
    - Use `figma_set_auto_layout` with explicit `itemSpacing`, `padding`, and `alignment`.
    - Set `primaryAxisSizingMode` and `counterAxisSizingMode` to 'FIXED', 'HUG', or 'FILL' based on the responsiveness needed.
- **The 8pt Grid:** All spacing and sizing must be multiples of 8 (or your specific system's base unit).

## 3. Design Tokens & Variables
- **Zero Hex Codes:** You are forbidden from using hex codes for fills or strokes. 
- **Variable Application:** - Use `figma_get_variable_defs` to find the correct `variableId`.
    - Apply them using `figma_set_variable_on_node`.
- **Typography:** Only use defined Text Styles. Do not override font-family or font-size manually on a text node.

## 4. Operational Workflow (Chain of Thought)
1. **Read:** Call `figma_get_node` or `figma_get_design_context` to understand the current state.
2. **Audit:** Compare the current state against the Design System documentation.
3. **Plan:** State which variables and components you will use.
4. **Execute:** Perform the write operations (Create/Update).
5. **Verify:** Use `figma_get_screenshot` (if available) or a final `get_node` to confirm the hierarchy is correct.

## 5. Prohibited Actions
- DO NOT create "Group" layers. Use "Frames" with Auto-Layout.
- DO NOT use "Absolute Positioning" unless specifically required for an overlay or badge.
- DO NOT detach instances. If a component doesn't fit the needs, suggest a new variant.
