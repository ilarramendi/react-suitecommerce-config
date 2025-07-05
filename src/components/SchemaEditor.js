import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Save, HelpCircle, AlertCircle } from 'lucide-react';
import { ConfigurationTool } from '../utils/ConfigurationTool';
import FieldInput from './FieldInput';
import ArrayEditor from './ArrayEditor';

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

export default SchemaEditor; 