"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerExtractor = void 0;
const logger_1 = require("../../utils/logger");
class TriggerExtractor {
    static extractTriggers(rawText, triggersConfig) {
        const actions = [];
        let cleanText = rawText;
        if (!triggersConfig) {
            // Fallback/default structure if config is missing (backward compatibility)
            triggersConfig = {
                "LEAD": {
                    "pattern": "\\[LEAD:\\s*([^,\\]]*?)\\s*,\\s*([^,\\]]*?)\\s*,\\s*([^,\\]]*?)\\s*,\\s*([^,\\]]*?)\\s*\\]",
                    "fields": ["name", "email", "phone", "service"]
                },
                "APPOINTMENT": {
                    "pattern": "\\[APPOINTMENT:\\s*([^\\]]+)\\]",
                    "fields": ["details"]
                },
                "HANDOFF": {
                    "pattern": "\\[HANDOFF:\\s*([^\\]]+)\\]",
                    "fields": ["reason"]
                }
            };
        }
        for (const [triggerName, info] of Object.entries(triggersConfig)) {
            const patternStr = info.pattern;
            const fields = info.fields || [];
            if (!patternStr)
                continue;
            try {
                const regex = new RegExp(patternStr, 'g');
                // Using matchAll if groups are involved
                const matches = Array.from(cleanText.matchAll(regex));
                for (const m of matches) {
                    const data = {};
                    // m[0] is the full match, m[1], m[2]... are capture groups
                    if (m.length > 1) { // has capture groups
                        for (let idx = 0; idx < fields.length; idx++) {
                            if (idx + 1 < m.length) {
                                data[fields[idx]] = (m[idx + 1] || '').trim();
                            }
                        }
                    }
                    else { // no capture groups
                        if (fields.length > 0) {
                            data[fields[0]] = m[0].trim();
                        }
                        else {
                            data["value"] = m[0].trim();
                        }
                    }
                    logger_1.logger.info(`Extracted dynamic [${triggerName}] trigger: ${JSON.stringify(data)}`);
                    actions.push({
                        type: triggerName,
                        data: data
                    });
                }
                // Remove the trigger pattern from the output text
                cleanText = cleanText.replace(regex, '');
            }
            catch (e) {
                logger_1.logger.error(`Error parsing dynamic trigger '${triggerName}' with pattern '${patternStr}': ${e.message}`);
            }
        }
        // Post-process cleanup of double spaces or multiple trailing spaces/newlines
        cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
        cleanText = cleanText.trim();
        return [cleanText, actions];
    }
}
exports.TriggerExtractor = TriggerExtractor;
