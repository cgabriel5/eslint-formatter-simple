"use strict";

// Needed modules.
const path = require("path");
const archy = require("archy");
const chalk = require("chalk");
const plz = require("pluralize");
const table = require("text-table");
const strip_ansi = require("strip-ansi");

// Remove ansi color to get the string length.
const string_length = function(string) {
	return strip_ansi(string).length;
};

/**
 * Generate file issue breakdown.
 *
 * @param  {string} type - Warning or error.
 * @param  {number} issue_count - Total issue count.
 * @param  {number} fixable_count - Total fixable issue count.
 * @return {array} - Array containing file breakdown.
 */
// let file_breakdown = (type, issue_count, fixable_count) => {
// 	return [
// 		" ",
// 		issue_count,
// 		`${plz(type, issue_count)}`,
// 		fixable_count
// 			? `(${fixable_count} fixable with ${chalk.green.bold(
// 					"--fix"
// 			  )} option)`
// 			: ""
// 	];
// };

/**
 * Generate file's issue output.
 *
 * @param  {object} data - Main object containing all cleaned result data.
 * @return {string} - The file's final output to print to terminal.
 */
let printer = data => {
	// Vars.
	let { filepath, errors, warnings, fixables } = data;
	let result = [];

	// Print structure:
	// - FILE_PATH
	//   - WARNINGS?
	//   - ERRORS?
	//   - DIVIDER?
	//   - BREAKDOWN?

	// Get relative file path and decorate.
	filepath = chalk.underline.bold(path.relative(process.cwd(), filepath));
	if (fixables.fix) {
		filepath = chalk.green(filepath);
	}

	result.push(
		`[${chalk(`${warnings.length}:${errors.length}`)}]`,
		filepath,
		"\n"
	);

	// Generate issues table (warnings followed by errors).
	result.push(
		table(warnings.concat(errors), {
			// table([], {
			stringLength: string_length
		}),
		"\n"
	);

	// Generate file issue breakdown.

	// let [fixable_errors, fixable_warnings] = fixables;
	// let breakdown = [];
	// // Only add output if it exists.
	// if (warnings.length) {
	// 	breakdown.push(
	// 		file_breakdown("warning", warnings.length, fixable_warnings)
	// 	);
	// }
	// if (errors.length) {
	// 	breakdown.push(file_breakdown("error", errors.length, fixable_errors));
	// }
	// // Add divider to output.
	// if (breakdown.length) {
	// 	result.push(`  ${"-".repeat(58)}`, "\n");
	// }

	// // Generate file issue breakdown table.
	// result.push(
	// 	table(breakdown, {
	// 		hsep: " ",
	// 		stringLength: string_length
	// 	}),
	// 	breakdown.length ? "\n" : ""
	// );

	return result.join("");
};

/**
 * Generate the summary section for either total and/or fixable issues.
 *
 * @param  {string} header - Either "Total" or "Fixable".
 * @param  {number} errors - Total (fixable?) error count.
 * @param  {number} warnings - Total (fixable?) warning count.
 * @param  {array} files - Array of files containing issues.
 * @param  {number} file_count - Total count of files containing issues.
 * @param  {object} data - Main object containing all cleaned result data.
 * @return {string} - The eslint (fixable?) issues summary to print.
 */
let summary_section = (header, errors, warnings, files, file_count, data) => {
	// Vars.
	let list = [];
	let result = [];
	let roots = [];
	let dirsubs = {};
	let cwd = process.cwd();

	// Populate list with file information.
	for (let i = 0, l = files.length; i < l; i++) {
		// Cache current file.
		let [file, wcount, ecount] = files[i];
		// Get file paths file name.
		let filepath = path.basename(path.relative(cwd, file));
		// Get the file's directory path.
		let dirname = path.relative(cwd, path.dirname(file));

		// Reset directory if needed.
		if (dirname === ".") {
			dirname = "/";
		}
		if (!dirname.endsWith("/")) {
			dirname += "/";
		}
		if (dirname.startsWith("/")) {
			dirname = dirname.replace(/^\//, "");
		}

		// Bold the file path.
		let decorated_fpath = `${chalk.bold(filepath)}`;
		if (header === "Fixable") {
			decorated_fpath = chalk.green(decorated_fpath);
		}
		// Add the issue(s) count.
		decorated_fpath = `[${chalk(`${wcount}:${ecount}`)}]${decorated_fpath}`;

		// If the dirname is empty (i.e. "") it is a root file so add it to
		// the roots array.
		if (!dirname) {
			roots.push(decorated_fpath);
		} else {
			// Else the file contained within a sub folder so make on object
			// for archy if not already created or update the nodes if
			// already created.
			if (dirsubs.hasOwnProperty(dirname)) {
				// Update the archy nodes array.
				dirsubs[dirname].nodes.push(decorated_fpath);
			} else {
				// Create the archy object.
				dirsubs[dirname] = {
					label: chalk.dim(dirname),
					nodes: [decorated_fpath]
				};
			}
		}
	}

	// Add sub-directory objects to roots array to prep for archy.
	for (let subdir in dirsubs) {
		roots.push(dirsubs[subdir]);
	}
	// Add archy tree to output.
	list.push([
		"  ",
		archy(
			{
				label: ".",
				nodes: roots
			},
			"   "
		).trim()
	]);

	// Issues summary will be magenta. Fixable issues will be green.
	let color = header === "Fixable" ? "green" : "magenta";
	// Build summary section header.
	result.push(
		`${header === "Fixable" ? "\n" : ""}  ${header}: ${chalk.bold[color](
			`${data} ${plz("issue", data)}`
		)} (${warnings} ${plz("warning", warnings)}, ${errors} ${plz(
			"error",
			errors
		)}) in ${chalk.bold(`${file_count} ${plz("file", file_count)}`)}. ${
			header === "fixable"
				? ` (use ${chalk.bold.green("--fix")} option)`
				: ""
		}`,
		"\n"
	);

	result.push(
		table(list, {
			hsep: " ",
			stringLength: string_length
		}),
		"\n"
	);

	return result.join("");
};

/**
 * Generate eslint run summary.
 *
 * @param  {object} data - Main object containing all cleaned result data.
 * @return {string} - The eslint run summary to print.
 */
let summary = data => {
	// Vars.
	let result = [];

	// Get total issue counts.
	let total_issues = data.warnings + data.errors;
	let total_fixables = data.fixable.warnings + data.fixable.errors;

	// Decorate file name header.
	if (total_issues || total_fixables) {
		result.push(`${chalk.underline.bold("Summary")}`, "\n");
	}

	// Create summary sections for total and fixable issues.
	let totals = [total_issues, total_fixables];
	for (let i = 0, l = totals.length; i < l; i++) {
		// Cache current loop item.
		let issue_count = totals[i];
		// Set defaults to the issues.
		let source = data;
		let header = "Total";
		// Reset values for fixables.
		if (i) {
			source = data.fixable;
			header = "Fixable";
		}

		// If issues exist generate summary section (total/fixable).
		if (issue_count) {
			result.push(
				summary_section(
					header,
					source.errors,
					source.warnings,
					source.files,
					source.files.length,
					issue_count
				)
			);
		}
	}

	return result.join("");
};

/**
 * Generate final output to pass to eslint.
 *
 * @param  {object} data - Main object containing all cleaned result data.
 * @return {string} - The final output to give to eslint.
 */
let output = data => {
	// Create the final output string.
	let stdout = [];

	// Add padding (empty-line).
	if (data.padtop) {
		stdout.push("");
	}

	// Check for verbose environment variable.
	let env_verbose = process.env.ESLINT_CFS_VERBOSE;

	// Combine all output.
	// stdout.push(data.output.join("\n"), summary(data));
	stdout.push(data.output.join("\n"));
	// Show summary if env variable is provided.
	if (!env_verbose || (env_verbose && env_verbose === "true")) {
		stdout.push(summary(data));
	}

	// Make final output.
	let final_output = stdout.join("\n").trim().length
		? stdout.join("\n")
		: // If no output, give success message.
		  `\n${chalk.bold.green("ESLint found no issues!")}\n`;

	// Return final output string.
	return final_output;
};

module.exports = {
	printer,
	output
};
