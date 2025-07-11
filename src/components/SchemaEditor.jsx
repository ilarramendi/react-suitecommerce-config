import { Save, HelpCircle, AlertCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { ConfigurationTool } from '../utils/ConfigurationTool';

import ArrayEditor from './ArrayEditor';
import FieldInput from './FieldInput';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// Deep comparison function to check if configs are equal
const deepEqual = (obj1, obj2) => {
	if (obj1 === obj2) return true;
	
	if (obj1 == null || obj2 == null) return obj1 === obj2;
	
	if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
	
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);
	
	if (keys1.length !== keys2.length) return false;
	
	for (const key of keys1) {
		if (!keys2.includes(key)) return false;
		if (!deepEqual(obj1[key], obj2[key])) return false;
	}
	
	return true;
};

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

const buildGroups = (manifest) => {
	const groups = {};
	for (const entry of manifest) {
		if (entry.group) {
			groups[entry.group.id] = {
				group: entry.group,
				subtabs: {},
				properties: {}
			};
		}
	}
	for (const entry of manifest) {
		if (entry.subtab) {
			if (!groups[entry.subtab.group]) {
				console.error(`Subtab ${entry.subtab.id} not found in group ${entry.subtab.group}`);
				continue;
			}
			groups[entry.subtab.group].subtabs[entry.subtab.id] = {
				subtab: entry.subtab,
				properties: {}
			};
		}
	}
	for (const entry of manifest) {
		if (entry.properties) {
			for (const propId of Object.keys(entry.properties)) {
				const prop = entry.properties[propId];
				if (!groups[prop.group]) {
					console.error(`Manifest entry ${propId} not found in group ${prop.group}`);
					continue;
				}
				if (prop.subtab) {
					if (!groups[prop.group].subtabs[prop.subtab]) {
						console.error(`Subtab ${prop.subtab} not found in group ${prop.group}`);
						continue;
					}
					groups[prop.group].subtabs[prop.subtab].properties[propId] = prop;
				} else {
					groups[prop.group].properties[propId] = prop;
				}
			}
		}
	}

	return groups;
}

const SchemaEditor = ({ manifest, configuration, onSave }) => {
	const [config, setConfig] = useState(configuration || {});
	const [validationErrors, setValidationErrors] = useState({});
	const [isSaving, setIsSaving] = useState(false);
	const [activeTab, setActiveTab] = useState('');
	const initialConfig = useRef(configuration || {});

	const configTool = new ConfigurationTool();

	const hasConfigChanged = !deepEqual(config, initialConfig.current);

	useEffect(() => {
		// Update initial config when configuration prop changes
		initialConfig.current = configuration || {};
		setConfig(configuration || {});
	}, [configuration]);

	useEffect(() => {
		// Validate configuration on mount and changes
		const errors = configTool.validateJSONSchema(config);
		const refErrors = configTool.validateReferences(manifest);
		setValidationErrors({ schema: errors, references: refErrors });
	}, [config, manifest]);

	const handleFieldChange = (fieldId, value) => {
		setConfig(prev => setPathValue(prev, fieldId, value));
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(config);
			// Reset initial config after successful save
			initialConfig.current = { ...config };
		} finally {
			setIsSaving(false);
		}
	};


	const groups = buildGroups(manifest);
	const hasValidationErrors = validationErrors.schema?.length > 0 || validationErrors.references?.length > 0;

	// Set initial active tab
	useEffect(() => {
		if (!activeTab && Object.keys(groups).length > 0) {
			setActiveTab(Object.keys(groups)[0]);
		}
	}, [groups, activeTab]);

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">SuiteCommerce Configuration</h1>
				<div className="flex items-center space-x-3">
					{hasValidationErrors && (
						<Badge className="flex items-center" variant="destructive">
							<AlertCircle className="w-4 h-4 mr-1" />
							Validation Errors
						</Badge>
					)}
					<Button
						className="flex items-center"
						disabled={isSaving || !hasConfigChanged}
						onClick={handleSave}
					>
						{isSaving ? (
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
						) : (
							<Save className="w-4 h-4 mr-2" />
						)}
						{isSaving ? 'Saving...' : hasConfigChanged ? 'Save Configuration' : 'No Changes'}
					</Button>
				</div>
			</div>

			{/* Validation Errors Display */}
			{hasValidationErrors && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Validation Errors</AlertTitle>
					<AlertDescription>
						<ul className="list-disc list-inside space-y-1 mt-2">
							{[...(validationErrors.schema || []), ...(validationErrors.references || [])].map((error, idx) => (
								<li className="text-sm" key={idx}>{error}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{/* Configuration Form */}
			<Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="w-full justify-start">
					{Object.keys(groups).map(groupId => {
						const groupData = groups[groupId];
						return (
							<TabsTrigger className="flex items-center space-x-2" key={groupId} value={groupId}>
								<span>{groupData.group?.title || 'General'}</span>
								{groupData.group?.docRef && (
									<HelpCircle className="w-4 h-4 text-muted-foreground" />
								)}
							</TabsTrigger>
						);
					})}
				</TabsList>

				{Object.keys(groups).map(groupId => {
					const groupData = groups[groupId];

					return (
						<TabsContent className="space-y-6 mt-6" key={groupId} value={groupId}>
							<Card>
								<CardContent className="p-6 space-y-6">
									{/* Direct group properties */}
									{Object.keys(groupData.properties).length > 0 && (
										<div className="space-y-6">
											{/* Normal properties in 2-column grid */}
											{Object.keys(groupData.properties).filter(propId => groupData.properties[propId].type !== 'array').length > 0 && (
												<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
													{Object.keys(groupData.properties)
														.filter(propId => groupData.properties[propId].type !== 'array')
														.map(propId => {
															const property = groupData.properties[propId];
															const fieldConfig = {
																...property,
																id: propId,
																title: property.title || propId
															};

															const currentValue = getPathValue(config, propId);

															return (
																<div key={propId}>
																	<FieldInput
																		field={fieldConfig}
																		value={currentValue}
																		onChange={(value) => handleFieldChange(propId, value)}
																	/>
																</div>
															);
														})}
												</div>
											)}

											{/* Array properties - each takes full row */}
											{Object.keys(groupData.properties).filter(propId => groupData.properties[propId].type === 'array').length > 0 && (
												<div className="space-y-6">
													{Object.keys(groupData.properties)
														.filter(propId => groupData.properties[propId].type === 'array')
														.map(propId => {
															const property = groupData.properties[propId];
															const fieldConfig = {
																...property,
																id: propId,
																title: property.title || propId
															};

															const currentValue = getPathValue(config, propId);

															return (
																<div className="w-full" key={propId}>
																	<ArrayEditor
																		field={fieldConfig}
																		value={currentValue}
																		onChange={(value) => handleFieldChange(propId, value)}
																	/>
																</div>
															);
														})}
												</div>
											)}
										</div>
									)}

									{/* Subtabs */}
									{Object.keys(groupData.subtabs).length > 0 && (
										<>
											{Object.keys(groupData.properties).length > 0 && <Separator />}
											<Accordion collapsible className="space-y-4" defaultValue={Object.keys(groupData.subtabs)[0]} type="single">
												{Object.keys(groupData.subtabs).map(subtabId => {
													const subtabData = groupData.subtabs[subtabId];

													return (
														<AccordionItem className="border rounded-lg" key={subtabId} value={subtabId}>
															<AccordionTrigger className="px-4 py-3 hover:bg-accent/30 transition-colors">
																<div className="flex items-center space-x-2">
																	<CardTitle className="text-lg font-medium">
																		{subtabData.subtab?.title || subtabId}
																	</CardTitle>
																</div>
															</AccordionTrigger>
															<AccordionContent className="px-4 pb-4">
																<div className="space-y-6">
																	{/* Normal properties in 2-column grid */}
																	{Object.keys(subtabData.properties).filter(propId => subtabData.properties[propId].type !== 'array').length > 0 && (
																		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																			{Object.keys(subtabData.properties)
																				.filter(propId => subtabData.properties[propId].type !== 'array')
																				.map(propId => {
																					const property = subtabData.properties[propId];
																					const fieldConfig = {
																						...property,
																						id: propId,
																						title: property.title || propId
																					};

																					const currentValue = getPathValue(config, propId);

																					return (
																						<div key={propId}>
																							<FieldInput
																								field={fieldConfig}
																								value={currentValue}
																								onChange={(value) => handleFieldChange(propId, value)}
																							/>
																						</div>
																					);
																				})}
																		</div>
																	)}

																	{/* Array properties - each takes full row */}
																	{Object.keys(subtabData.properties).filter(propId => subtabData.properties[propId].type === 'array').length > 0 && (
																		<div className="space-y-6">
																			{Object.keys(subtabData.properties)
																				.filter(propId => subtabData.properties[propId].type === 'array')
																				.map(propId => {
																					const property = subtabData.properties[propId];
																					const fieldConfig = {
																						...property,
																						id: propId,
																						title: property.title || propId
																					};

																					const currentValue = getPathValue(config, propId);

																					return (
																						<div className="w-full" key={propId}>
																							<ArrayEditor
																								field={fieldConfig}
																								value={currentValue}
																								onChange={(value) => handleFieldChange(propId, value)}
																							/>
																						</div>
																					);
																				})}
																		</div>
																	)}
																</div>
															</AccordionContent>
														</AccordionItem>
													);
												})}
											</Accordion>
										</>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					);
				})}
			</Tabs>
		</div>
	);
};

export default SchemaEditor; 