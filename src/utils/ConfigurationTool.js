// Configuration Tool for validation and modifications
export class ConfigurationTool {
	constructor() {
		this.modificationPlugins = [];
	}

	validateJSONSchema(data) {
		const errors = [];

		if (!data || typeof data !== 'object') {
			errors.push('Configuration must be an object');
			return errors;
		}

		// Basic validation - in real implementation would use JSON Schema validator
		return errors;
	}

	validateReferences(manifest) {
		const errors = [];
		const groups = {};
		const subtabs = {};
		const properties = {};

		manifest.forEach(entry => {
			if (entry.group) {
				if (groups[entry.group.id]) {
					errors.push(`Duplicated group declaration: ${entry.group.id}`);
				}
				groups[entry.group.id] = entry.group;
			}

			if (entry.subtab) {
				if (subtabs[entry.subtab.id]) {
					errors.push(`Duplicated subtab declaration: ${entry.subtab.id}`);
				}
				subtabs[entry.subtab.id] = entry.subtab;
			}

			Object.keys(entry.properties || {}).forEach(propId => {
				const property = entry.properties[propId];

				if (properties[propId]) {
					errors.push(`Duplicated property declaration: ${propId}`);
				}
				properties[propId] = true;

				if (property.group && !groups[property.group]) {
					errors.push(`Property ${propId} references non-existent group ${property.group}`);
				}

				if (property.subtab && !subtabs[property.subtab]) {
					errors.push(`Property ${propId} references non-existent subtab ${property.subtab}`);
				}
			});
		});

		return errors;
	}
} 