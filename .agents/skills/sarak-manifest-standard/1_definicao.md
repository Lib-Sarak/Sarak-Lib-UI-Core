# Skill: Sarak Manifest Standard — Definition

## What it is
This skill defines the **Existence Contract** of a module in the Sarak ecosystem. In the Atomic Independence model, a module is not "installed"; it is "announced." The `manifest.json` is the document that allows this existence without code coupling.

In addition to identity (name, icon), this skill establishes the **Visual Contract**: the definition of how API data must be structured so that the `UI-Core` renders it without the need for custom logic.

## Objective
- Standardize module self-description (ID, Category, Lucide-compatible icons).
- Define the data output format (View Contract) for Tables, Forms, and Dashboards.
- Ensure that any module, regardless of the backend language, is interpretable by the Sarak visual engine.

## Exclusive Responsibilities of this Skill
1. Determine the mandatory content of the `manifest.json`.
2. Validate if icon names and categories follow the Design System standard.
3. Design the "Rendering Contracts" (e.g., "SarakTableContract" or "SarakFormContract").

## When to use
- When creating a new `Sarak-Lib-*` module.
- When auditing if an existing module is "Atomic Ready."
- When there is a rendering error in the `UI-Core` due to data format incompatibility.
