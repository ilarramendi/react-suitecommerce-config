import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Save, Copy, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';

// Mock data for demonstration
const mockWebsites = [
	{
		id: '1', name: 'Main Store', sitetype: 'STANDARD', domains: [
			{ name: 'shopping.netsuite.com', primary: false },
			{ name: 'store.example.com', primary: true }
		]
	},
	{
		id: '2', name: 'B2B Portal', sitetype: 'ADVANCED', domains: [
			{ name: 'b2b.example.com', primary: true }
		]
	}
];

const mockManifest = [
	{
		group: { id: 'general', title: 'General Settings', docRef: 'general_help' },
		properties: {
			siteName: {
				type: 'string',
				title: 'Site Name',
				description: 'The display name for your site',
				default: 'My Store',
				group: 'general',
				mandatory: true
			},
			enableFeature: {
				type: 'boolean',
				title: 'Enable Advanced Features',
				description: 'Enable advanced functionality',
				default: false,
				group: 'general'
			},
			maxItems: {
				type: 'integer',
				title: 'Maximum Items',
				description: 'Maximum number of items to display',
				default: 10,
				group: 'general'
			}
		}
	},
	{
		group: { id: 'appearance', title: 'Appearance', docRef: 'appearance_help' },
		subtab: { id: 'colors', title: 'Colors', group: 'appearance' },
		properties: {
			primaryColor: {
				type: 'string',
				title: 'Primary Color',
				description: 'Main brand color',
				default: '#007bff',
				group: 'appearance',
				subtab: 'colors'
			},
			theme: {
				type: 'enum',
				title: 'Theme',
				description: 'Select site theme',
				enum: ['light', 'dark', 'auto'],
				default: 'light',
				group: 'appearance'
			},
			categories: {
				type: 'array',
				title: 'Product Categories',
				description: 'List of product categories',
				items: {
					type: 'object',
					properties: {
						name: { type: 'string', title: 'Category Name' },
						enabled: { type: 'boolean', title: 'Enabled' }
					}
				},
				group: 'appearance',
				default: [
					{ name: 'Electronics', enabled: true },
					{ name: 'Clothing', enabled: false }
				]
			}
		}
	}
];

// Configuration Tool for validation and modifications
class ConfigurationTool {
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

// Field Components
const FieldInput = ({ field, value, onChange, errors = [] }) => {
	const hasError = errors.length > 0;

	const renderField = () => {
		switch (field.type) {
			case 'string':
			case 'text':
				return (
					<input
						type="text"
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						className={`w-full px-3 py-2 border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
						placeholder={field.description}
					/>
				);

			case 'integer':
			case 'number':
				return (
					<input
						type="number"
						value={value || ''}
						onChange={(e) => onChange(field.type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value))}
						className={`w-full px-3 py-2 border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
						placeholder={field.description}
					/>
				);

			case 'boolean':
			case 'checkbox':
				return (
					<div className="flex items-center">
						<input
							type="checkbox"
							checked={value || false}
							onChange={(e) => onChange(e.target.checked)}
							className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
						/>
						<label className="ml-2 text-sm text-gray-700">{field.title}</label>
					</div>
				);

			case 'enum':
			case 'select':
				return (
					<select
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						className={`w-full px-3 py-2 border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
					>
						<option value="">Select an option</option>
						{(field.enum || field.options || []).map((option, idx) => (
							<option key={idx} value={option}>{option}</option>
						))}
					</select>
				);

			default:
				return (
					<input
						type="text"
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						className={`w-full px-3 py-2 border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
						placeholder={field.description}
					/>
				);
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center space-x-2">
				<label className="block text-sm font-medium text-gray-700">
					{field.title}
					{field.mandatory && <span className="text-red-500 ml-1">*</span>}
				</label>
				{field.docRef && (
					<HelpCircle
						className="w-4 h-4 text-gray-400 cursor-help"
						title="Click for help documentation"
					/>
				)}
			</div>

			{renderField()}

			{field.description && (
				<p className="text-xs text-gray-500">{field.description}</p>
			)}

			{errors.map((error, idx) => (
				<p key={idx} className="text-xs text-red-500 flex items-center">
					<AlertCircle className="w-3 h-3 mr-1" />
					{error}
				</p>
			))}
		</div>
	);
};

const ArrayEditor = ({ field, value = [], onChange, errors = [] }) => {
	const addItem = () => {
		const newItem = field.items.type === 'object'
			? Object.keys(field.items.properties || {}).reduce((acc, key) => {
				acc[key] = field.items.properties[key].default || '';
				return acc;
			}, {})
			: '';

		onChange([...value, newItem]);
	};

	const removeItem = (index) => {
		const newValue = value.filter((_, i) => i !== index);
		onChange(newValue);
	};

	const updateItem = (index, itemValue) => {
		const newValue = [...value];
		newValue[index] = itemValue;
		onChange(newValue);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<label className="block text-sm font-medium text-gray-700">
					{field.title}
					{field.mandatory && <span className="text-red-500 ml-1">*</span>}
				</label>
				<button
					onClick={addItem}
					className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
				>
					<Plus className="w-4 h-4 mr-1" />
					Add
				</button>
			</div>

			{field.description && (
				<p className="text-xs text-gray-500">{field.description}</p>
			)}

			<div className="space-y-2">
				{value.map((item, index) => (
					<div key={index} className="flex items-start space-x-2 p-3 border rounded-md bg-gray-50">
						<div className="flex-1">
							{field.items.type === 'object' ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{Object.keys(field.items.properties || {}).map(propKey => {
										const propField = field.items.properties[propKey];
										return (
											<FieldInput
												key={propKey}
												field={{ ...propField, title: propField.title || propKey }}
												value={item[propKey]}
												onChange={(val) => updateItem(index, { ...item, [propKey]: val })}
											/>
										);
									})}
								</div>
							) : (
								<FieldInput
									field={field.items}
									value={item}
									onChange={(val) => updateItem(index, val)}
								/>
							)}
						</div>
						<button
							onClick={() => removeItem(index)}
							className="flex items-center px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				))}
			</div>

			{errors.map((error, idx) => (
				<p key={idx} className="text-xs text-red-500 flex items-center">
					<AlertCircle className="w-3 h-3 mr-1" />
					{error}
				</p>
			))}
		</div>
	);
};

// Main Configuration Editor Component
const SchemaEditor = ({ manifest, configuration, onSave }) => {
	const [config, setConfig] = useState(configuration || {});
	const [expandedGroups, setExpandedGroups] = useState({});
	const [expandedSubtabs, setExpandedSubtabs] = useState({});
	const [validationErrors, setValidationErrors] = useState({});
	const [isSaving, setIsSaving] = useState(false);

	const configTool = new ConfigurationTool();

	useEffect(() => {
		// Validate configuration on mount and changes
		const errors = configTool.validateJSONSchema(config);
		const refErrors = configTool.validateReferences(manifest);
		setValidationErrors({ schema: errors, references: refErrors });
	}, [config, manifest]);

	const getPathValue = (obj, path) => {
		return path.split('.').reduce((current, key) => current?.[key], obj);
	};

	const setPathValue = (obj, path, value) => {
		const keys = path.split('.');
		const lastKey = keys.pop();
		const target = keys.reduce((current, key) => {
			if (!current[key]) current[key] = {};
			return current[key];
		}, obj);
		target[lastKey] = value;
		return { ...obj };
	};

	const handleFieldChange = (fieldId, value) => {
		setConfig(prev => setPathValue(prev, fieldId, value));
	};

	const toggleGroup = (groupId) => {
		setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
	};

	const toggleSubtab = (subtabId) => {
		setExpandedSubtabs(prev => ({ ...prev, [subtabId]: !prev[subtabId] }));
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(config);
		} finally {
			setIsSaving(false);
		}
	};

	// Group manifest entries by group and subtab
	const groupedManifest = manifest.reduce((acc, entry) => {
		const groupId = entry.group?.id || 'ungrouped';
		if (!acc[groupId]) {
			acc[groupId] = { group: entry.group, subtabs: {}, properties: {} };
		}

		Object.keys(entry.properties || {}).forEach(propId => {
			const property = entry.properties[propId];
			if (property.subtab) {
				const subtabId = property.subtab;
				if (!acc[groupId].subtabs[subtabId]) {
					acc[groupId].subtabs[subtabId] = { subtab: entry.subtab, properties: {} };
				}
				acc[groupId].subtabs[subtabId].properties[propId] = property;
			} else {
				acc[groupId].properties[propId] = property;
			}
		});

		return acc;
	}, {});

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold text-gray-900">SuiteCommerce Configuration</h1>
				<div className="flex space-x-3">
					{(validationErrors.schema?.length > 0 || validationErrors.references?.length > 0) && (
						<div className="flex items-center text-red-600">
							<AlertCircle className="w-5 h-5 mr-2" />
							Validation Errors
						</div>
					)}
					<button
						onClick={handleSave}
						disabled={isSaving}
						className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
					>
						{isSaving ? (
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
						) : (
							<Save className="w-4 h-4 mr-2" />
						)}
						{isSaving ? 'Saving...' : 'Save Configuration'}
					</button>
				</div>
			</div>

			{/* Validation Errors Display */}
			{(validationErrors.schema?.length > 0 || validationErrors.references?.length > 0) && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<h3 className="text-lg font-medium text-red-800 mb-2">Validation Errors</h3>
					<ul className="list-disc list-inside space-y-1">
						{[...(validationErrors.schema || []), ...(validationErrors.references || [])].map((error, idx) => (
							<li key={idx} className="text-sm text-red-700">{error}</li>
						))}
					</ul>
				</div>
			)}

			{/* Configuration Form */}
			<div className="space-y-6">
				{Object.keys(groupedManifest).map(groupId => {
					const groupData = groupedManifest[groupId];
					const isExpanded = expandedGroups[groupId] ?? true;

					return (
						<div key={groupId} className="bg-white border border-gray-200 rounded-lg shadow-sm">
							<div
								className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
								onClick={() => toggleGroup(groupId)}
							>
								<div className="flex items-center space-x-2">
									{isExpanded ? (
										<ChevronDown className="w-5 h-5 text-gray-500" />
									) : (
										<ChevronRight className="w-5 h-5 text-gray-500" />
									)}
									<h2 className="text-xl font-semibold text-gray-900">
										{groupData.group?.title || 'General'}
									</h2>
								</div>
								{groupData.group?.docRef && (
									<HelpCircle className="w-5 h-5 text-gray-400" />
								)}
							</div>

							{isExpanded && (
								<div className="p-6 pt-0 space-y-6">
									{/* Direct group properties */}
									{Object.keys(groupData.properties).length > 0 && (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{Object.keys(groupData.properties).map(propId => {
												const property = groupData.properties[propId];
												const fieldConfig = {
													...property,
													id: propId,
													title: property.title || propId
												};

												const currentValue = getPathValue(config, propId);

												return (
													<div key={propId}>
														{property.type === 'array' ? (
															<ArrayEditor
																field={fieldConfig}
																value={currentValue}
																onChange={(value) => handleFieldChange(propId, value)}
															/>
														) : (
															<FieldInput
																field={fieldConfig}
																value={currentValue}
																onChange={(value) => handleFieldChange(propId, value)}
															/>
														)}
													</div>
												);
											})}
										</div>
									)}

									{/* Subtabs */}
									{Object.keys(groupData.subtabs).map(subtabId => {
										const subtabData = groupData.subtabs[subtabId];
										const isSubtabExpanded = expandedSubtabs[subtabId] ?? true;

										return (
											<div key={subtabId} className="border border-gray-100 rounded-md">
												<div
													className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
													onClick={() => toggleSubtab(subtabId)}
												>
													<div className="flex items-center space-x-2">
														{isSubtabExpanded ? (
															<ChevronDown className="w-4 h-4 text-gray-500" />
														) : (
															<ChevronRight className="w-4 h-4 text-gray-500" />
														)}
														<h3 className="text-lg font-medium text-gray-800">
															{subtabData.subtab?.title || subtabId}
														</h3>
													</div>
												</div>

												{isSubtabExpanded && (
													<div className="p-4">
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															{Object.keys(subtabData.properties).map(propId => {
																const property = subtabData.properties[propId];
																const fieldConfig = {
																	...property,
																	id: propId,
																	title: property.title || propId
																};

																const currentValue = getPathValue(config, propId);

																return (
																	<div key={propId}>
																		{property.type === 'array' ? (
																			<ArrayEditor
																				field={fieldConfig}
																				value={currentValue}
																				onChange={(value) => handleFieldChange(propId, value)}
																			/>
																		) : (
																			<FieldInput
																				field={fieldConfig}
																				value={currentValue}
																				onChange={(value) => handleFieldChange(propId, value)}
																			/>
																		)}
																	</div>
																);
															})}
														</div>
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

// Website Selection Component
const WebsiteSelector = ({ websites, onSelect }) => {
	const [selectedWebsite, setSelectedWebsite] = useState('');
	const [selectedDomain, setSelectedDomain] = useState('');
	const [availableDomains, setAvailableDomains] = useState([]);

	useEffect(() => {
		if (selectedWebsite) {
			const website = websites.find(w => w.id === selectedWebsite);
			setAvailableDomains(website?.domains || []);
			setSelectedDomain('');
		}
	}, [selectedWebsite, websites]);

	const handleConfigure = () => {
		if (selectedWebsite && selectedDomain) {
			onSelect({ websiteId: selectedWebsite, domain: selectedDomain });
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="bg-white rounded-lg shadow-md p-8 space-y-6">
				<h1 className="text-3xl font-bold text-gray-900 text-center">
					SuiteCommerce Configuration
				</h1>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Select Website
						</label>
						<select
							value={selectedWebsite}
							onChange={(e) => setSelectedWebsite(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Pick one</option>
							{websites.map(website => (
								<option key={website.id} value={website.id}>
									{website.name}
								</option>
							))}
						</select>
					</div>

					{selectedWebsite && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Select Domain
							</label>
							<select
								value={selectedDomain}
								onChange={(e) => setSelectedDomain(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Pick one</option>
								{availableDomains.map((domain, idx) => (
									<option key={idx} value={domain.name}>
										{domain.name} {domain.primary ? '(Primary)' : ''}
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				<div className="flex space-x-4">
					<button
						onClick={handleConfigure}
						disabled={!selectedWebsite || !selectedDomain}
						className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Configure
					</button>

					<button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
						<Copy className="w-4 h-4 mr-2" />
						Copy Configuration
					</button>
				</div>
			</div>
		</div>
	);
};

// Main Application Component
const SuiteCommerceConfigApp = () => {
	const [currentView, setCurrentView] = useState('selector'); // 'selector' | 'editor'
	const [selectedConfig, setSelectedConfig] = useState(null);
	const [configuration, setConfiguration] = useState({});
	const [saveStatus, setSaveStatus] = useState(null);

	const handleWebsiteSelect = (selection) => {
		setSelectedConfig(selection);
		// Load existing configuration for this website/domain
		const existingConfig = {
			siteName: 'My Example Store',
			enableFeature: true,
			maxItems: 25,
			primaryColor: '#007bff',
			theme: 'light',
			categories: [
				{ name: 'Electronics', enabled: true },
				{ name: 'Clothing', enabled: false }
			]
		};
		setConfiguration(existingConfig);
		setCurrentView('editor');
	};

	const handleSave = async (config) => {
		try {
			setSaveStatus('saving');
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			setConfiguration(config);
			setSaveStatus('success');
			setTimeout(() => setSaveStatus(null), 3000);
		} catch (error) {
			setSaveStatus('error');
			setTimeout(() => setSaveStatus(null), 3000);
		}
	};

	const handleBack = () => {
		setCurrentView('selector');
		setSelectedConfig(null);
	};

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Header */}
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center">
							<h1 className="text-xl font-semibold text-gray-900">
								SuiteCommerce Configuration Manager
							</h1>
						</div>

						{currentView === 'editor' && (
							<div className="flex items-center space-x-4">
								{saveStatus === 'success' && (
									<div className="flex items-center text-green-600">
										<CheckCircle className="w-5 h-5 mr-2" />
										Configuration saved successfully
									</div>
								)}
								<button
									onClick={handleBack}
									className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
								>
									Back to Selection
								</button>
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="py-8">
				{currentView === 'selector' ? (
					<WebsiteSelector
						websites={mockWebsites}
						onSelect={handleWebsiteSelect}
					/>
				) : (
					<SchemaEditor
						manifest={mockManifest}
						configuration={configuration}
						onSave={handleSave}
					/>
				)}
			</main>

			{/* Footer */}
			<footer className="bg-white border-t mt-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<p className="text-center text-sm text-gray-500">
						SuiteCommerce Configuration Editor - React Implementation
					</p>
				</div>
			</footer>
		</div>
	);
};

export default SuiteCommerceConfigApp;