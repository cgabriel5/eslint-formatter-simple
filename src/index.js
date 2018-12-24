"use strict";

// Needed modules.
const chalk = require("chalk");
const { printer, output } = require("./output.js");

/**
 * Formatter: Handles and formats the eslint results array objects.
 *
 * @param  {array} results - Eslint provided result array containing objects.
 * @return {undefined} - Nothing.
 *
 * @resource - [https://eslint.org/docs/developer-guide/working-with-custom-formatters]
 */
module.exports = function(results = []) {
	// Keep tabs warnings, errors, files, and output.
	let data = {
		output: [],
		padtop: false,
		// Regular issues/warnings.
		warnings: 0,
		errors: 0,
		files: [],
		// Fixable issues/warnings.
		fixable: {
			files: [],
			errors: 0,
			warnings: 0
		}
	};

	// Loop over results objects.
	for (let i = 0, l = results.length; i < l; i++) {
		// Cache current loop item.
		let result = results[i];
		// Get result information.
		let issues = result.messages;
		let filepath = result.filePath;
		// Defaults.
		let errors = [];
		let warnings = [];
		let fixables = [0, 0]; // [ErrorFixCount, WarningFixCount]

		// Group into warnings and errors
		for (let j = 0, k = issues.length; j < k; j++) {
			// Cache current loop item.
			let issue = issues[j];

			// Check whether an error or warning.
			let is_err = issue.severity === 2 || issue.fatal;
			// NOTE: When the `fatal` key is provided in the result object,
			// the `ruleId` is set to null. Therefore, we reset it.
			// [https://eslint.org/docs/developer-guide/nodejs-api.html#linter]
			let issue_name = !issue.fatal ? issue.ruleId : "fatal";

			// Issue severity:
			// 1 → warning → ⚠:yellow
			// 2 → error   → ❌:red
			(is_err ? errors : warnings).push([
				// Empty space for spacing purposes with text-table.
				"",
				chalk[is_err ? "red" : "yellow"](is_err ? "❌" : "⚠"),
				chalk.gray(`${issue.line}:${issue.column}`),
				issue.fix ? chalk.green.bold(issue_name) : issue_name,
				issue.message
			]);
		}

		// If no issues do not add file info (skips file logging).
		if (errors.length || warnings.length) {
			// Get issue information.
			let warnings_count = result.warningCount;
			let errors_count = result.errorCount;
			// Get fixable issue information.
			let fixable_errors = result.fixableErrorCount;
			let fixable_warnings = result.fixableWarningCount;

			// Increment total counts.
			data.errors = data.errors + result.errorCount;
			data.warnings = data.warnings + result.warningCount;
			data.fixable.warnings = data.fixable.warnings + fixable_warnings;
			data.fixable.errors = data.fixable.errors + fixable_errors;
			// Add filepath to files array.
			data.files.push([filepath, warnings_count, errors_count]);

			// If issue is fixable add it to fixable data set.
			if (fixable_errors || fixable_warnings) {
				fixables[0] = fixable_errors;
				fixables[1] = fixable_warnings;
				// Boolean denotes to highlight path green.
				fixables.fix = true;
				data.fixable.files.push([
					filepath,
					fixable_warnings,
					fixable_errors
				]);
			}

			// If issues exist set flag to later pad (empty-line) output only
			// on the first issue.
			if (!data.padtop) {
				data.padtop = true;
			}

			// Run the printer on each object.
			data.output.push(
				printer({
					filepath,
					errors,
					warnings,
					fixables
				})
			);
		}
	}

	// Finally, pass output to eslint.
	return output(data);
};
