import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Save, HelpCircle, AlertCircle } from 'lucide-react';
import { ConfigurationTool } from '../utils/ConfigurationTool';
import FieldInput from './FieldInput';
import ArrayEditor from './ArrayEditor';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const SchemaEditor = ({ manifest, configuration, onSave }) => {
	const [config, setConfig] = useState(configuration || {});
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

	const hasValidationErrors = validationErrors.schema?.length > 0 || validationErrors.references?.length > 0;

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
			<Accordion type="single" collapsible className="space-y-4">
				{Object.keys(groupedManifest).map(groupId => {
					const groupData = groupedManifest[groupId];

					return (
						<AccordionItem key={groupId} value={groupId} className="border rounded-lg shadow-sm">
							<AccordionTrigger className="px-6 py-4 hover:bg-accent/50 transition-colors">
								<div className="flex items-center justify-between w-full">
									<div className="flex items-center space-x-2">
										<CardTitle className="text-xl">
											{groupData.group?.title || 'General'}
										</CardTitle>
									</div>
									{groupData.group?.docRef && (
										<HelpCircle className="w-5 h-5 text-muted-foreground" />
									)}
								</div>
							</AccordionTrigger>

							<AccordionContent>
								<div className="px-6 pb-6 space-y-6">
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
									{Object.keys(groupData.subtabs).length > 0 && (
										<>
											{Object.keys(groupData.properties).length > 0 && <Separator />}
											{Object.keys(groupData.subtabs).map(subtabId => {
												const subtabData = groupData.subtabs[subtabId];
												const isSubtabExpanded = expandedSubtabs[subtabId] ?? true;

												return (
													<Card key={subtabId} variant="outline" className="border-muted">
														<Collapsible open={isSubtabExpanded} onOpenChange={() => toggleSubtab(subtabId)}>
															<CollapsibleTrigger asChild>
																<CardHeader className="cursor-pointer hover:bg-accent/30 transition-colors py-3">
																	<div className="flex items-center justify-between">
																		<div className="flex items-center space-x-2">
																			{isSubtabExpanded ? (
																				<ChevronDown className="w-4 h-4 text-muted-foreground" />
																			) : (
																				<ChevronRight className="w-4 h-4 text-muted-foreground" />
																			)}
																			<CardTitle className="text-lg font-medium">
																				{subtabData.subtab?.title || subtabId}
																			</CardTitle>
																		</div>
																	</div>
																</CardHeader>
															</CollapsibleTrigger>

															<CollapsibleContent>
																<CardContent className="pt-0">
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
																</CardContent>
															</CollapsibleContent>
														</Collapsible>
													</Card>
												);
											})}
										</>
									)}
								</div>
							</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>
		</div>
	);
};

export default SchemaEditor; 