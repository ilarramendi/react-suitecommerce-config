import React, { useState, useEffect } from 'react';
import { Save, HelpCircle, AlertCircle } from 'lucide-react';
import { ConfigurationTool } from '../utils/ConfigurationTool';
import FieldInput from './FieldInput';
import ArrayEditor from './ArrayEditor';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const SchemaEditor = ({ manifest, configuration, onSave }) => {
	const [config, setConfig] = useState(configuration || {});
	const [validationErrors, setValidationErrors] = useState({});
	const [isSaving, setIsSaving] = useState(false);
	const [activeTab, setActiveTab] = useState('');

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

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(config);
		} finally {
			setIsSaving(false);
		}
	};

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
						<Badge variant="destructive" className="flex items-center">
							<AlertCircle className="w-4 h-4 mr-1" />
							Validation Errors
						</Badge>
					)}
					<Button
						onClick={handleSave}
						disabled={isSaving}
						className="flex items-center"
					>
						{isSaving ? (
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
						) : (
							<Save className="w-4 h-4 mr-2" />
						)}
						{isSaving ? 'Saving...' : 'Save Configuration'}
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
								<li key={idx} className="text-sm">{error}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{/* Configuration Form */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="w-full justify-start">
					{Object.keys(groups).map(groupId => {
						const groupData = groups[groupId];
						return (
							<TabsTrigger key={groupId} value={groupId} className="flex items-center space-x-2">
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
						<TabsContent key={groupId} value={groupId} className="space-y-6 mt-6">
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
																<div key={propId} className="w-full">
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
											<Accordion type="single" collapsible className="space-y-4" defaultValue={Object.keys(groupData.subtabs)[0]}>
												{Object.keys(groupData.subtabs).map(subtabId => {
													const subtabData = groupData.subtabs[subtabId];

													return (
														<AccordionItem key={subtabId} value={subtabId} className="border rounded-lg">
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
																						<div key={propId} className="w-full">
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