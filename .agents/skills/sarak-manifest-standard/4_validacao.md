# Validation Checklist: Sarak Manifest Standard (v6.8)

Use this checklist to ensure the module is correctly identified and ready for discovery.

## Manifest Phase
- [ ] Does the `manifest.json` file exist at the module's root?
- [ ] Is the `id` unique and does it follow the snake-case/kebab-case pattern?
- [ ] Does the `icon` name exist in the Lucide React library?
- [ ] Is the `category` part of the allowed set?

## Visual Contract Phase
- [ ] Are the endpoints listed in the manifest functional?
- [ ] Does the endpoint response follow the visual schemas (Table, Stats, Form)?
- [ ] Are there no `shared` dependencies injected into the manifest?

## Completion Phase
- [ ] Was the manifest successfully tested by the `UI-Core` discovery engine?
- [ ] No promotional language (matrix, super, mega, master) in labels or descriptions.
